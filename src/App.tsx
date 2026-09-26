/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GenealogyTree, 
  Member, 
  MemoryPost, 
  NotificationItem, 
  UserProfile, 
  ScreenType, 
  RelationshipType,
  MemberRole,
  MemberPermissions
} from './types';
import { 
  initialGenealogyTree, 
  initialMembers, 
  initialMemories, 
  initialNotifications, 
  initialCurrentUser 
} from './data/initialData';
import { 
  seedInitialDataIfEmpty,
  subscribeToTree,
  subscribeToMembers,
  subscribeToMemories,
  subscribeToNotifications,
  subscribeToUserProfile,
  syncSaveTree,
  syncSaveMember,
  syncDeleteMember,
  syncBatchSaveMembers,
  syncSaveMemory,
  syncDeleteMemory,
  syncSaveNotification,
  syncSaveUserProfile
} from './services/firebase';

// Screens
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { EmptyHomeScreen } from './components/EmptyHomeScreen';
import { FamilyTreeView } from './components/FamilyTreeView';
import { MembersListScreen } from './components/MembersListScreen';
import { MemberDetailScreen } from './components/MemberDetailScreen';
import { MemoriesScreen } from './components/MemoriesScreen';
import { MemoryDetailScreen } from './components/MemoryDetailScreen';
import { NotificationsScreen } from './components/NotificationsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { OnboardingScreens } from './components/OnboardingScreens';

// Modals
import { AddMemberModal } from './components/modals/AddMemberModal';
import { EditMemberModal } from './components/modals/EditMemberModal';
import { CreateGenealogyModal } from './components/modals/CreateGenealogyModal';
import { EditGenealogyModal } from './components/modals/EditGenealogyModal';
import { CreateMemoryModal } from './components/modals/CreateMemoryModal';
import { ShareGenealogyModal } from './components/modals/ShareGenealogyModal';
import { ManageMembersModal } from './components/modals/ManageMembersModal';
import { ImportMembersModal } from './components/modals/ImportMembersModal';
import { MemberRoleModal } from './components/modals/MemberRoleModal';
import { PrintGenealogyModal } from './components/modals/PrintGenealogyModal';

export default function App() {
  // Navigation & Screen State
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [historyStack, setHistoryStack] = useState<ScreenType[]>(['home']);

  // Core Data State with LocalStorage offline persistence fallback
  const [tree, setTree] = useState<GenealogyTree>(() => {
    try {
      const saved = localStorage.getItem('gia_pha_tree');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialGenealogyTree;
  });
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('gia_pha_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialMembers;
  });
  const [memories, setMemories] = useState<MemoryPost[]>(() => {
    try {
      const saved = localStorage.getItem('gia_pha_memories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialMemories;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('gia_pha_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialNotifications;
  });
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('gia_pha_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return initialCurrentUser;
  });

  // Active Detail Targets
  const [selectedMemberId, setSelectedMemberId] = useState<string>(initialMembers[0]?.id || '');
  const [selectedMemoryId, setSelectedMemoryId] = useState<string>(initialMemories[0]?.id || '');

  // Cloud Database Sync Status
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);
  const [isDbSyncing, setIsDbSyncing] = useState<boolean>(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Modals state
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [addMemberTargetId, setAddMemberTargetId] = useState<string | undefined>();
  const [addMemberRelType, setAddMemberRelType] = useState<RelationshipType>('child');

  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [editTargetMember, setEditTargetMember] = useState<Member | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isCreateTreeOpen, setIsCreateTreeOpen] = useState(false);
  const [isEditGenealogyOpen, setIsEditGenealogyOpen] = useState(false);
  const [isCreateMemoryOpen, setIsCreateMemoryOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Specific member role modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleTargetMember, setRoleTargetMember] = useState<Member | null>(null);

  // Toast / notification banner
  const [toastMessage, setToastMessage] = useState<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Tự động lưu bản sao dự phòng vào LocalStorage để đảm bảo F5/reset không bao giờ mất dữ liệu
  useEffect(() => {
    try {
      localStorage.setItem('gia_pha_tree', JSON.stringify(tree));
    } catch (e) {}
  }, [tree]);

  useEffect(() => {
    try {
      localStorage.setItem('gia_pha_members', JSON.stringify(members));
    } catch (e) {}
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem('gia_pha_memories', JSON.stringify(memories));
    } catch (e) {}
  }, [memories]);

  useEffect(() => {
    try {
      localStorage.setItem('gia_pha_notifications', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('gia_pha_user', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  // Khởi tạo và lắng nghe đồng bộ cơ sở dữ liệu Cloud (Firebase Firestore)
  useEffect(() => {
    let unsubscribeTree: (() => void) | undefined;
    let unsubscribeMembers: (() => void) | undefined;
    let unsubscribeMemories: (() => void) | undefined;
    let unsubscribeNotifs: (() => void) | undefined;
    let unsubscribeUser: (() => void) | undefined;

    async function initFirestoreSync() {
      try {
        // Tự động kiểm tra và đẩy dữ liệu mẫu ban đầu nếu Database trên Cloud đang trống
        await seedInitialDataIfEmpty(
          initialGenealogyTree,
          initialMembers,
          initialMemories,
          initialNotifications,
          initialCurrentUser
        );

        // Lắng nghe realtime thay đổi gia phả từ Firestore
        unsubscribeTree = subscribeToTree(tree.id, (remoteTree) => {
          if (remoteTree) {
            setTree(remoteTree);
            setIsDbConnected(true);
          }
        });

        // Lắng nghe realtime danh sách thành viên từ Firestore
        unsubscribeMembers = subscribeToMembers((remoteMembers) => {
          if (remoteMembers && remoteMembers.length > 0) {
            setMembers(remoteMembers);
            setIsDbConnected(true);
          }
        });

        // Lắng nghe realtime tin tức/kỷ niệm từ Firestore
        unsubscribeMemories = subscribeToMemories((remoteMemories) => {
          if (remoteMemories && remoteMemories.length > 0) {
            setMemories(remoteMemories);
          }
        });

        // Lắng nghe realtime thông báo
        unsubscribeNotifs = subscribeToNotifications((remoteNotifs) => {
          if (remoteNotifs && remoteNotifs.length > 0) {
            setNotifications(remoteNotifs);
          }
        });

        // Lắng nghe realtime hồ sơ tài khoản
        unsubscribeUser = subscribeToUserProfile(currentUser.id, (remoteUser) => {
          if (remoteUser) {
            setCurrentUser(remoteUser);
          }
        });
      } catch (err) {
        console.warn('Lỗi kết nối Firestore Cloud:', err);
      }
    }

    initFirestoreSync();

    return () => {
      if (unsubscribeTree) unsubscribeTree();
      if (unsubscribeMembers) unsubscribeMembers();
      if (unsubscribeMemories) unsubscribeMemories();
      if (unsubscribeNotifs) unsubscribeNotifs();
      if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  // Screen navigation helper with history
  const navigateTo = (screen: ScreenType) => {
    setHistoryStack(prev => [...prev, screen]);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop(); // remove current
      const prevScreen = newStack[newStack.length - 1];
      setHistoryStack(newStack);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('home');
    }
  };

  // Handlers for Member Management
  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    navigateTo('member_detail');
  };

  const handleOpenAddRelative = (targetId: string, relType: RelationshipType) => {
    setAddMemberTargetId(targetId);
    setAddMemberRelType(relType);
    setIsAddMemberOpen(true);
  };

  const handleAddMember = async (newMemberData: Omit<Member, 'id'>) => {
    const newId = 'm_' + Date.now();
    const newMember: Member = {
      ...newMemberData,
      id: newId,
      role: 'member',
      permissions: {
        canEditTree: false,
        canAddMembers: false,
        canDeleteMembers: false,
        canPostMemories: true,
        canManageRoles: false,
      }
    };

    // Update parent / child / spouse connections
    const affectedRelatives: Member[] = [];
    const updatedMembers = [...members, newMember].map(m => {
      let changed = false;
      let updatedM = { ...m };
      if (newMember.parentIds?.includes(m.id)) {
        updatedM.childIds = [...m.childIds, newId];
        changed = true;
      }
      if (newMember.spouseIds?.includes(m.id)) {
        updatedM.spouseIds = [...m.spouseIds, newId];
        changed = true;
      }
      if (changed) affectedRelatives.push(updatedM);
      return updatedM;
    });

    setMembers(updatedMembers);
    
    // Update clan stats & dynamic generation count
    const updatedTree: GenealogyTree = {
      ...tree,
      memberCount: tree.memberCount + 1,
      totalMembers: (tree.totalMembers || tree.memberCount) + 1,
      generationCount: Math.max(tree.generationCount, newMember.generation),
      livingMembers: newMember.isAlive ? tree.livingMembers + 1 : tree.livingMembers,
    };
    setTree(updatedTree);

    showToast(`Đã thêm "${newMember.fullName}" vào gia phả! Đang lưu Database...`);

    try {
      setIsDbSyncing(true);
      await syncSaveMember(newMember);
      if (affectedRelatives.length > 0) {
        await syncBatchSaveMembers(affectedRelatives);
      }
      await syncSaveTree(updatedTree);
      setIsDbSyncing(false);
      showToast(`Đã lưu "${newMember.fullName}" vào Cloud Database thành công!`);
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi khi lưu thành viên lên Firestore:', err);
    }
  };

  // Bulk Import Members from CSV/JSON
  const handleImportMembers = async (importedList: Omit<Member, 'id'>[]) => {
    if (importedList.length === 0) return;
    
    let currentMaxGen = tree.generationCount;
    let newLivingCount = 0;

    const newMembersWithIds: Member[] = importedList.map((item, idx) => {
      if (item.generation > currentMaxGen) currentMaxGen = item.generation;
      if (item.isAlive) newLivingCount++;
      return {
        ...item,
        id: `m_imp_${Date.now()}_${idx}`,
        role: item.role || 'member',
        permissions: item.permissions || {
          canEditTree: false,
          canAddMembers: false,
          canDeleteMembers: false,
          canPostMemories: true,
          canManageRoles: false,
        }
      };
    });

    setMembers(prev => [...prev, ...newMembersWithIds]);

    const updatedTree: GenealogyTree = {
      ...tree,
      memberCount: (tree.memberCount || 0) + newMembersWithIds.length,
      totalMembers: (tree.totalMembers || tree.memberCount) + newMembersWithIds.length,
      generationCount: Math.max(tree.generationCount, currentMaxGen),
      livingMembers: tree.livingMembers + newLivingCount,
    };
    setTree(updatedTree);

    showToast(`Đang lưu ${newMembersWithIds.length} thành viên vào Cloud Database...`);
    try {
      setIsDbSyncing(true);
      await syncBatchSaveMembers(newMembersWithIds);
      await syncSaveTree(updatedTree);
      setIsDbSyncing(false);
      showToast(`Đã nhập & lưu ${newMembersWithIds.length} thành viên vào Cloud Database!`);
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi khi lưu hàng loạt thành viên:', err);
    }
  };

  const handleOpenEditMember = (member: Member) => {
    setEditTargetMember(member);
    setIsEditMemberOpen(true);
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    const updatedTree = {
      ...tree,
      generationCount: Math.max(tree.generationCount, updatedMember.generation),
    };
    setTree(updatedTree);
    showToast(`Đã cập nhật hồ sơ "${updatedMember.fullName}"! Đang lưu Database...`);
    try {
      setIsDbSyncing(true);
      await syncSaveMember(updatedMember);
      await syncSaveTree(updatedTree);
      setIsDbSyncing(false);
      showToast(`Đã lưu "${updatedMember.fullName}" vào Cloud Database!`);
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi khi cập nhật thành viên lên Firestore:', err);
    }
  };

  const handleUpdateMemberPassword = async (memberId: string, newPassword: string) => {
    let targetMember: Member | undefined;
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        targetMember = { ...m, password: newPassword };
        return targetMember;
      }
      return m;
    }));
    showToast(`Đang cập nhật mật khẩu mới vào Database Cloud...`);
    if (targetMember) {
      try {
        setIsDbSyncing(true);
        await syncSaveMember(targetMember);
        setIsDbSyncing(false);
        showToast(`Đã lưu mật khẩu cho "${targetMember.fullName}" vào Cloud Database!`);
      } catch (err) {
        setIsDbSyncing(false);
        console.error('Lỗi khi lưu mật khẩu thành viên:', err);
      }
    }
  };

  const handleUpdateUserProfile = async (updatedProfile: Partial<UserProfile>) => {
    const updated = {
      ...currentUser,
      ...updatedProfile,
    };
    setCurrentUser(updated);
    showToast('Đang cập nhật thông tin cá nhân vào Database Cloud...');
    try {
      setIsDbSyncing(true);
      await syncSaveUserProfile(updated);
      setIsDbSyncing(false);
      showToast('Đã lưu thông tin cá nhân & mật khẩu vào Cloud Database thành công!');
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi khi lưu thông tin người dùng:', err);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    const target = members.find(m => m.id === memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
    const updatedTree: GenealogyTree = {
      ...tree,
      memberCount: Math.max(1, tree.memberCount - 1),
      totalMembers: Math.max(1, (tree.totalMembers || tree.memberCount) - 1),
      livingMembers: target?.isAlive ? Math.max(0, tree.livingMembers - 1) : tree.livingMembers,
    };
    setTree(updatedTree);
    showToast(`Đã xóa thành viên khỏi gia phả.`);
    if (currentScreen === 'member_detail') {
      handleBack();
    }
    try {
      setIsDbSyncing(true);
      await syncDeleteMember(memberId);
      await syncSaveTree(updatedTree);
      setIsDbSyncing(false);
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi khi xóa thành viên:', err);
    }
  };

  // Bulk Delete Members
  const handleBulkDeleteMembers = async (memberIds: string[]) => {
    if (memberIds.length === 0) return;
    const countToDelete = memberIds.length;
    const livingDeleted = members.filter(m => memberIds.includes(m.id) && m.isAlive).length;

    setMembers(prev => prev.filter(m => !memberIds.includes(m.id)));
    const updatedTree: GenealogyTree = {
      ...tree,
      memberCount: Math.max(1, tree.memberCount - countToDelete),
      totalMembers: Math.max(1, (tree.totalMembers || tree.memberCount) - countToDelete),
      livingMembers: Math.max(0, tree.livingMembers - livingDeleted),
    };
    setTree(updatedTree);

    showToast(`Đã xóa thành công ${countToDelete} thành viên khỏi gia phả.`);
    try {
      setIsDbSyncing(true);
      for (const id of memberIds) {
        await syncDeleteMember(id);
      }
      await syncSaveTree(updatedTree);
      setIsDbSyncing(false);
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi khi xóa hàng loạt thành viên:', err);
    }
  };

  // Specific Role Assignment Handlers
  const handleOpenRoleModal = (member: Member) => {
    setRoleTargetMember(member);
    setIsRoleModalOpen(true);
  };

  const handleUpdateMemberRole = async (
    memberId: string, 
    role: MemberRole, 
    roleTitle?: string, 
    permissions?: MemberPermissions
  ) => {
    let targetUpdated: Member | null = null;
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        targetUpdated = {
          ...m,
          role,
          roleTitle: roleTitle || m.roleTitle,
          permissions: permissions || m.permissions || {
            canEditTree: role === 'admin' || role === 'moderator',
            canAddMembers: role === 'admin' || role === 'moderator',
            canDeleteMembers: role === 'admin',
            canPostMemories: role !== 'viewer',
            canManageRoles: role === 'admin',
          }
        };
        return targetUpdated;
      }
      return m;
    }));

    // If current logged-in user matches, update their session profile role too
    const targetMember = members.find(m => m.id === memberId);
    if (targetMember && (currentUser.fullName === targetMember.fullName || memberId === 'mem-12')) {
      setCurrentUser(prev => ({ ...prev, role: role === 'admin' ? 'admin' : role === 'moderator' ? 'moderator' : 'member' }));
    }

    showToast(`Đã cập nhật vai trò phân quyền cho ${targetMember?.fullName || 'thành viên'}!`);
    if (targetUpdated) {
      try {
        setIsDbSyncing(true);
        await syncSaveMember(targetUpdated);
        setIsDbSyncing(false);
      } catch (err) {
        setIsDbSyncing(false);
        console.error('Lỗi khi lưu vai trò:', err);
      }
    }
  };

  // Handlers for Memories
  const handleSelectMemory = (id: string) => {
    setSelectedMemoryId(id);
    navigateTo('memory_detail');
  };

  const handleToggleLike = async (memoryId: string) => {
    let updatedItem: MemoryPost | null = null;
    setMemories(prev => prev.map(m => {
      if (m.id === memoryId) {
        const nextLiked = !m.isLiked;
        updatedItem = {
          ...m,
          isLiked: nextLiked,
          likes: nextLiked ? m.likes + 1 : Math.max(0, m.likes - 1),
        };
        return updatedItem;
      }
      return m;
    }));

    if (updatedItem) {
      try {
        await syncSaveMemory(updatedItem);
      } catch (err) {
        console.error('Lỗi cập nhật lượt thích:', err);
      }
    }
  };

  const handleAddComment = async (memoryId: string, content: string) => {
    const newComment = {
      id: 'c_' + Date.now(),
      userName: currentUser.fullName,
      userAvatar: currentUser.avatarUrl,
      content,
      timestamp: 'Vừa xong',
    };

    let updatedItem: MemoryPost | null = null;
    setMemories(prev => prev.map(m => {
      if (m.id === memoryId) {
        updatedItem = {
          ...m,
          comments: [...m.comments, newComment],
        };
        return updatedItem;
      }
      return m;
    }));
    showToast('Đã đăng bình luận của bạn!');

    if (updatedItem) {
      try {
        await syncSaveMemory(updatedItem);
      } catch (err) {
        console.error('Lỗi lưu bình luận:', err);
      }
    }
  };

  const handleCreateMemory = async (newPostData: Omit<MemoryPost, 'id' | 'likes' | 'comments' | 'isLiked'>) => {
    const newPost: MemoryPost = {
      ...newPostData,
      id: 'post_' + Date.now(),
      likes: 1,
      isLiked: false,
      comments: [],
    };
    setMemories(prev => [newPost, ...prev]);
    showToast('Bài viết tin tức đã được xuất bản tới cả dòng họ!');
    try {
      setIsDbSyncing(true);
      await syncSaveMemory(newPost);
      setIsDbSyncing(false);
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi lưu bài viết:', err);
    }
  };

  // Bulk Delete Memories
  const handleBulkDeleteMemories = async (memoryIds: string[]) => {
    if (memoryIds.length === 0) return;
    setMemories(prev => prev.filter(m => !memoryIds.includes(m.id)));
    showToast(`Đã xóa thành công ${memoryIds.length} bài viết.`);
    if (memoryIds.includes(selectedMemoryId) && currentScreen === 'memory_detail') {
      handleBack();
    }
    try {
      setIsDbSyncing(true);
      for (const id of memoryIds) {
        await syncDeleteMemory(id);
      }
      setIsDbSyncing(false);
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi xóa bài viết:', err);
    }
  };

  // Handlers for Notifications
  const handleSelectNotification = async (item: NotificationItem) => {
    const updated = { ...item, isRead: true };
    setNotifications(prev => prev.map(n => n.id === item.id ? updated : n));
    try {
      await syncSaveNotification(updated);
    } catch (err) {
      console.error('Lỗi cập nhật thông báo:', err);
    }
    if (item.targetId) {
      if (item.type === 'memory') {
        setSelectedMemoryId(item.targetId);
        navigateTo('memory_detail');
      } else if (item.type === 'member') {
        setSelectedMemberId(item.targetId);
        navigateTo('member_detail');
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    const updatedList = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updatedList);
    showToast('Đã đánh dấu đọc tất cả thông báo.');
    try {
      for (const item of updatedList) {
        await syncSaveNotification(item);
      }
    } catch (err) {
      console.error('Lỗi cập nhật hàng loạt thông báo:', err);
    }
  };

  // Handler for Create Genealogy Tree
  const handleCreateTree = async (newTreeData: Omit<GenealogyTree, 'id'>) => {
    const newTree: GenealogyTree = {
      ...newTreeData,
      id: 'tree_' + Date.now(),
    };
    setTree(newTree);
    showToast(`Đã khởi tạo phả đồ "${newTree.name}" thành công! Đang lưu Database...`);
    navigateTo('home');
    try {
      setIsDbSyncing(true);
      await syncSaveTree(newTree);
      setIsDbSyncing(false);
      showToast(`Đã lưu phả đồ vào Cloud Database!`);
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi lưu phả đồ:', err);
    }
  };

  // Handler for Updating Genealogy Tree Settings & Logo
  const handleSaveTree = async (updatedTree: GenealogyTree) => {
    setTree(updatedTree);
    showToast('Đã lưu cài đặt và cập nhật Logo gia phả thành công!');
    try {
      setIsDbSyncing(true);
      await syncSaveTree(updatedTree);
      setIsDbSyncing(false);
      showToast('Đã cập nhật dữ liệu gia phả lên Cloud Database!');
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi cập nhật gia phả:', err);
    }
  };

  // Force Full Sync to Cloud DB
  const handleForceSyncCloud = async () => {
    try {
      setIsDbSyncing(true);
      showToast('Đang tải toàn bộ dữ liệu lên Firebase Firestore...');
      await syncSaveTree(tree);
      await syncBatchSaveMembers(members);
      for (const m of memories) {
        await syncSaveMemory(m);
      }
      for (const n of notifications) {
        await syncSaveNotification(n);
      }
      await syncSaveUserProfile(currentUser);
      setIsDbConnected(true);
      setIsDbSyncing(false);
      showToast('Đã đồng bộ toàn bộ dữ liệu lên Cloud Database thành công!');
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi khi đồng bộ lên Cloud:', err);
      showToast('Không thể đồng bộ lên Cloud. Vui lòng kiểm tra kết nối mạng!');
    }
  };

  // Handler for Empty State testing & Restore Sample Data
  const handleResetDemoData = async () => {
    setTree(initialGenealogyTree);
    setMembers(initialMembers);
    setMemories(initialMemories);
    setNotifications(initialNotifications);
    showToast('Đã khôi phục dữ liệu mẫu và đang lưu lên Cloud Database...');
    try {
      setIsDbSyncing(true);
      await syncSaveTree(initialGenealogyTree);
      await syncBatchSaveMembers(initialMembers);
      for (const m of initialMemories) {
        await syncSaveMemory(m);
      }
      for (const n of initialNotifications) {
        await syncSaveNotification(n);
      }
      setIsDbSyncing(false);
      showToast('Đã khôi phục dữ liệu mẫu Họ Nguyễn Chi Ất và lưu vào Database!');
    } catch (err) {
      setIsDbSyncing(false);
      console.error('Lỗi khi khôi phục dữ liệu mẫu:', err);
    }
  };

  const handleExportJson = () => {
    const exportData = {
      tree,
      members,
      memories,
      exportDate: new Date().toISOString(),
      appVersion: 'Cội Nguồn 2026.2',
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GiaPha_${tree.name.replace(/\s+/g, '_')}_Backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã tải tệp sao lưu dữ liệu gia phả (JSON)!');
  };

  const handleCompleteAuth = (
    name: string,
    phone: string,
    email: string,
    username?: string,
    matchedMember?: Member
  ) => {
    setCurrentUser(prev => ({
      ...prev,
      id: matchedMember ? matchedMember.id : prev.id,
      fullName: name,
      username: username || matchedMember?.username || prev.username,
      phone: phone || matchedMember?.phone || prev.phone,
      email: email || matchedMember?.email || prev.email,
      avatarUrl: matchedMember?.avatarUrl || prev.avatarUrl,
      role: matchedMember?.role || prev.role,
      branch: matchedMember?.branch || prev.branch,
      memberIdInTree: matchedMember ? matchedMember.id : prev.memberIdInTree,
    }));
    const displayTag = username ? `@${username}` : (matchedMember?.username ? `@${matchedMember.username}` : '');
    showToast(`Chào mừng ${name} ${displayTag ? `(${displayTag})` : ''} đến với Cội Nguồn!`);
    navigateTo('home');
  };

  // Unread notifications count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Render Screens based on currentScreen
  const isOnboarding = [
    'splash', 
    'onboarding_1', 
    'onboarding_2', 
    'onboarding_3', 
    'get_started', 
    'login', 
    'register'
  ].includes(currentScreen);

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans transition-colors selection:bg-amber-500 selection:text-white flex flex-col items-center">
      {/* Mobile Frame Container */}
      <div className="w-full max-w-md sm:max-w-2xl lg:max-w-4xl min-h-screen bg-stone-50 dark:bg-stone-900 shadow-2xl flex flex-col relative border-x border-stone-200 dark:border-stone-800">
        
        {/* Toast message banner */}
        {toastMessage && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-stone-900 text-amber-300 border border-amber-500/50 shadow-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Header (Only on main navigation screens) */}
        {!isOnboarding && currentScreen !== 'splash' && !['member_detail', 'memory_detail'].includes(currentScreen) && (
          <Header
            tree={tree}
            unreadCount={unreadCount}
            onOpenTreeMenu={() => setIsEditGenealogyOpen(true)}
            onOpenTreeSelector={() => setIsEditGenealogyOpen(true)}
            onOpenNotifications={() => navigateTo('notifications')}
            onOpenSearch={() => navigateTo('members')}
            currentScreen={currentScreen}
            onNavigate={navigateTo}
            isDbConnected={isDbConnected}
            isDbSyncing={isDbSyncing}
          />
        )}

        {/* Main Screen Router */}
        <main className="flex-1 w-full">
          {isOnboarding ? (
            <OnboardingScreens
              currentScreen={currentScreen}
              onNavigate={navigateTo}
              onCompleteAuth={handleCompleteAuth}
              members={members}
            />
          ) : currentScreen === 'empty_home' ? (
            <EmptyHomeScreen
              onOpenCreateTree={() => setIsCreateTreeOpen(true)}
              onJoinTreeByCode={(code) => {
                showToast(`Đã gửi yêu cầu gia nhập mã ${code} đến Ban Trị Sự!`);
                navigateTo('home');
              }}
              onLoadSampleData={handleResetDemoData}
              onNavigate={navigateTo}
            />
          ) : currentScreen === 'home' ? (
            <HomeScreen
              tree={tree}
              members={members}
              memories={memories}
              currentUser={currentUser}
              onNavigate={navigateTo}
              onSelectMember={handleSelectMember}
              onSelectMemory={handleSelectMemory}
              onOpenAddMember={() => {
                setAddMemberTargetId(undefined);
                setAddMemberRelType('child');
                setIsAddMemberOpen(true);
              }}
              onOpenCreateMemory={() => setIsCreateMemoryOpen(true)}
              onOpenShare={() => setIsShareOpen(true)}
              onOpenManageMembers={() => setIsManageMembersOpen(true)}
              onOpenPrint={() => setIsPrintModalOpen(true)}
              onOpenEditGenealogy={() => setIsEditGenealogyOpen(true)}
            />
          ) : currentScreen === 'tree' ? (
            <FamilyTreeView
              tree={tree}
              members={members}
              onSelectMember={handleSelectMember}
              onOpenAddMember={(targetId, relType) => {
                setAddMemberTargetId(targetId);
                setAddMemberRelType((relType as RelationshipType) || 'child');
                setIsAddMemberOpen(true);
              }}
              onNavigate={navigateTo}
              onOpenPrint={() => setIsPrintModalOpen(true)}
            />
          ) : currentScreen === 'members' ? (
            <MembersListScreen
              tree={tree}
              members={members}
              currentUser={currentUser}
              onSelectMember={handleSelectMember}
              onOpenAddMember={() => {
                setAddMemberTargetId(undefined);
                setAddMemberRelType('child');
                setIsAddMemberOpen(true);
              }}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onBulkDeleteMembers={handleBulkDeleteMembers}
              onOpenRoleModal={handleOpenRoleModal}
              onOpenManageMembers={() => setIsManageMembersOpen(true)}
            />
          ) : currentScreen === 'member_detail' ? (
            <MemberDetailScreen
              memberId={selectedMemberId}
              members={members}
              tree={tree}
              onBack={handleBack}
              onSelectMember={handleSelectMember}
              onSelectRelative={handleSelectMember}
              onOpenAddRelative={(targetId) => {
                setAddMemberTargetId(targetId);
                setAddMemberRelType('child');
                setIsAddMemberOpen(true);
              }}
              onAddRelative={handleOpenAddRelative}
              onOpenEditMember={handleOpenEditMember}
              onEditMember={handleOpenEditMember}
              onDeleteMember={handleDeleteMember}
              onShare={() => setIsShareOpen(true)}
              onShareMember={() => setIsShareOpen(true)}
              onOpenRoleModal={handleOpenRoleModal}
              onUpdateMemberRole={handleUpdateMemberRole}
            />
          ) : currentScreen === 'memories' ? (
            <MemoriesScreen
              memories={memories}
              currentUser={currentUser}
              onSelectMemory={handleSelectMemory}
              onOpenCreateMemory={() => setIsCreateMemoryOpen(true)}
              onToggleLike={handleToggleLike}
              onBulkDeleteMemories={handleBulkDeleteMemories}
            />
          ) : currentScreen === 'memory_detail' ? (
            <MemoryDetailScreen
              memoryId={selectedMemoryId}
              memories={memories}
              currentUser={currentUser}
              onBack={handleBack}
              onToggleLike={handleToggleLike}
              onAddComment={handleAddComment}
              onShare={() => setIsShareOpen(true)}
              onDeleteMemory={(id) => handleBulkDeleteMemories([id])}
            />
          ) : currentScreen === 'notifications' ? (
            <NotificationsScreen
              notifications={notifications}
              onSelectNotification={handleSelectNotification}
              onMarkAllAsRead={handleMarkAllAsRead}
              onClearAll={() => setNotifications([])}
            />
          ) : currentScreen === 'profile' ? (
            <ProfileScreen
              user={currentUser}
              tree={tree}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(!darkMode)}
              onNavigate={navigateTo}
              onOpenCreateTree={() => setIsCreateTreeOpen(true)}
              onOpenManageMembers={() => setIsManageMembersOpen(true)}
              onOpenShare={() => setIsShareOpen(true)}
              onOpenPrint={() => setIsPrintModalOpen(true)}
              onOpenEditGenealogy={() => setIsEditGenealogyOpen(true)}
              onExportJson={handleExportJson}
              onResetDemoData={handleResetDemoData}
              onLogout={() => navigateTo('get_started')}
              onUpdateUserProfile={handleUpdateUserProfile}
              isDbConnected={isDbConnected}
              isDbSyncing={isDbSyncing}
              onForceSyncCloud={handleForceSyncCloud}
            />
          ) : null}
        </main>

        {/* Global Bottom Navigation */}
        {!isOnboarding && currentScreen !== 'splash' && (
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={navigateTo}
          />
        )}

        {/* --- Global Modals & Dialogs --- */}
        
        {/* Add Member Modal */}
        <AddMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          members={members}
          onAddMember={handleAddMember}
          initialParentId={addMemberTargetId}
          initialRelType={addMemberRelType}
        />

        {/* Import Members Modal */}
        <ImportMembersModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportMembers={handleImportMembers}
          currentMembers={members}
        />

        {/* Edit Member Modal */}
        <EditMemberModal
          isOpen={isEditMemberOpen}
          member={editTargetMember}
          onClose={() => {
            setIsEditMemberOpen(false);
            setEditTargetMember(null);
          }}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          members={members}
        />

        {/* Create Genealogy Modal */}
        <CreateGenealogyModal
          isOpen={isCreateTreeOpen}
          onClose={() => setIsCreateTreeOpen(false)}
          onCreateTree={handleCreateTree}
        />

        {/* Edit Genealogy & Clan Logo Modal */}
        <EditGenealogyModal
          isOpen={isEditGenealogyOpen}
          onClose={() => setIsEditGenealogyOpen(false)}
          tree={tree}
          onSaveTree={handleSaveTree}
        />

        {/* Create Memory / News Modal */}
        <CreateMemoryModal
          isOpen={isCreateMemoryOpen}
          onClose={() => setIsCreateMemoryOpen(false)}
          currentUser={currentUser}
          onCreateMemory={handleCreateMemory}
        />

        {/* Share Modal */}
        <ShareGenealogyModal
          isOpen={isShareOpen}
          tree={tree}
          onClose={() => setIsShareOpen(false)}
        />

        {/* Manage Clan Permissions Modal */}
        <ManageMembersModal
          isOpen={isManageMembersOpen}
          onClose={() => setIsManageMembersOpen(false)}
          members={members}
          currentUser={currentUser}
          onUpdateMemberRole={handleUpdateMemberRole}
          onOpenSpecificMemberRoleModal={handleOpenRoleModal}
          onUpdateMemberPassword={handleUpdateMemberPassword}
        />

        {/* Individual Member Role & Permissions Assignment Modal */}
        <MemberRoleModal
          isOpen={isRoleModalOpen}
          member={roleTargetMember}
          onClose={() => {
            setIsRoleModalOpen(false);
            setRoleTargetMember(null);
          }}
          onSaveRole={handleUpdateMemberRole}
        />

        {/* Print & PDF Export Modal */}
        <PrintGenealogyModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          tree={tree}
          members={members}
        />
      </div>
    </div>
  );
}
