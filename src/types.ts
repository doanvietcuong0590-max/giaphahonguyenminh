export type ScreenType =
  | 'splash'
  | 'onboarding_1'
  | 'onboarding_2'
  | 'onboarding_3'
  | 'get_started'
  | 'login'
  | 'register'
  | 'home'
  | 'empty_home'
  | 'home_empty'
  | 'tree'
  | 'members'
  | 'member_detail'
  | 'memories'
  | 'memory_detail'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'manage_members';

export type Gender = 'male' | 'female';
export type MemberRank = 'truong' | 'thu' | 'dau' | 're' | 'khac';
export type MemberRole = 'admin' | 'moderator' | 'member' | 'viewer';
export type UserRole = MemberRole;
export type RelationshipType = 'parent' | 'spouse' | 'child' | 'sibling';

export interface MemberPermissions {
  canEditTree?: boolean;
  canAddMembers?: boolean;
  canDeleteMembers?: boolean;
  canPostMemories?: boolean;
  canManageRoles?: boolean;
}

export interface Member {
  id: string;
  fullName: string;
  courtesyName?: string; // Tên chữ / tự
  tabooName?: string; // Tên húy
  gender: Gender;
  generation: number; // 1 = Cụ Tổ, 2 = Đời 2, etc.
  branch: string; // Chi 1, Chi 2, Chi Ất...
  birthDate?: string;
  birthYear: number | string;
  deathDate?: string;
  deathYear?: number | string;
  lunarDeathDate?: string; // Ngày giỗ âm lịch (e.g. "15 tháng 3 ÂL")
  isAlive: boolean;
  spouseIds: string[];
  parentIds: string[];
  childIds: string[];
  avatarUrl: string;
  bio?: string;
  burialPlace?: string; // Nơi an táng
  rank: MemberRank;
  role?: MemberRole; // Quản trị viên, Biên tập viên, Thành viên họ, Khách xem
  roleTitle?: string; // e.g. "Trưởng Tộc", "Thư ký dòng họ", "Trưởng Ban Trị Sự"
  permissions?: MemberPermissions;
  phone?: string;
  email?: string;
  username?: string; // Tên đăng nhập của thành viên (dùng để đăng nhập vào ứng dụng)
  password?: string; // Mật khẩu đăng nhập của thành viên
  address?: string;
  profession?: string;
  achievements?: string[];
  generationTitle?: string; // "Đời thứ I - Khởi tổ", "Đời thứ III"
}

export interface GenealogyTree {
  id: string;
  name: string;
  branch?: string;
  branchName?: string;
  origin?: string; // Quê quán gốc
  originPlace?: string;
  ancestralHouseAddress?: string; // Địa chỉ nhà thờ họ
  ancestralHallAddress?: string;
  headPerson?: string; // Trưởng tộc / Đại diện
  patriarchName?: string;
  motto?: string; // Gia huấn
  clanRules?: string;
  establishedYear?: number | string;
  memberCount?: number;
  totalMembers: number;
  livingMembers: number;
  generationCount: number;
  code: string; // Mã tham gia ví dụ "NGUYEN-2026"
  description?: string;
  avatarUrl?: string;
}

export interface MemoryComment {
  id: string;
  userId?: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
}

export interface MemoryPost {
  id: string;
  title: string;
  content: string;
  authorId?: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  category?: 'truyen_thong' | 'hop_mat' | 'tu_bo' | 'hinh_anh' | 'khac' | string;
  images: string[];
  likes: number;
  isLiked?: boolean;
  comments: MemoryComment[];
  tags: string[];
  isPinned?: boolean;
  location?: string;
  subtitle?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'memory' | 'member' | 'role' | 'system';
  isRead: boolean;
  actionScreen?: ScreenType;
  actionId?: string;
  targetId?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  username?: string; // Tên đăng nhập
  email: string;
  phone: string;
  avatarUrl: string;
  role: MemberRole;
  currentTreeId?: string;
  memberIdInTree?: string;
  branch: string;
  password?: string; // Mật khẩu tài khoản cá nhân
}

