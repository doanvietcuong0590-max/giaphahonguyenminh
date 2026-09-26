import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  UserPlus, 
  ChevronRight, 
  ArrowUpDown, 
  LayoutGrid, 
  List, 
  Phone, 
  Mail, 
  MapPin, 
  Award,
  Download, 
  Calendar,
  Trash2,
  CheckSquare,
  Square,
  Upload,
  FileSpreadsheet,
  AlertTriangle,
  Users,
  Shield,
  ShieldCheck,
  Edit,
  Eye,
  Sliders
} from 'lucide-react';
import { Member, GenealogyTree, MemberRank, Gender, UserProfile, MemberRole } from '../types';
import { toRoman } from '../utils/treeUtils';

interface MembersListScreenProps {
  tree: GenealogyTree;
  members: Member[];
  currentUser?: UserProfile;
  onSelectMember: (memberId: string) => void;
  onOpenAddMember: () => void;
  onOpenImportModal: () => void;
  onBulkDeleteMembers: (memberIds: string[]) => void;
  onOpenRoleModal?: (member: Member) => void;
  onOpenManageMembers?: () => void;
}

export const MembersListScreen: React.FC<MembersListScreenProps> = ({
  tree,
  members,
  currentUser,
  onSelectMember,
  onOpenAddMember,
  onOpenImportModal,
  onBulkDeleteMembers,
  onOpenRoleModal,
  onOpenManageMembers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'alive' | 'deceased'>('all');
  const [selectedRank, setSelectedRank] = useState<MemberRank | 'all'>('all');
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all');
  const [selectedRole, setSelectedRole] = useState<MemberRole | 'all'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'generation' | 'name' | 'birthYear'>('generation');

  // Bulk Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'moderator' || !currentUser;
  const canBulkDelete = currentUser?.role === 'admin' || !currentUser;

  // Filter and sort members
  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.courtesyName && m.courtesyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.phone && m.phone.includes(searchQuery)) ||
      (m.profession && m.profession.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.roleTitle && m.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchGender = selectedGender === 'all' || m.gender === selectedGender;
    const matchStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'alive' && m.isAlive) ||
      (selectedStatus === 'deceased' && !m.isAlive);
    const matchRank = selectedRank === 'all' || m.rank === selectedRank;
    const matchGen = selectedGen === 'all' || m.generation === selectedGen;
    const matchRole = selectedRole === 'all' || (m.role || 'member') === selectedRole;

    return matchSearch && matchGender && matchStatus && matchRank && matchGen && matchRole;
  }).sort((a, b) => {
    if (sortBy === 'generation') {
      return a.generation - b.generation;
    }
    if (sortBy === 'name') {
      return a.fullName.localeCompare(b.fullName, 'vi');
    }
    if (sortBy === 'birthYear') {
      return (Number(a.birthYear) || 0) - (Number(b.birthYear) || 0);
    }
    return 0;
  });

  const maxGen = Math.max(...members.map(m => m.generation), 1);
  const genList = Array.from({ length: maxGen }, (_, i) => i + 1);

  const handleToggleSelectMember = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedMemberIds.length === filteredMembers.length) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map(m => m.id));
    }
  };

  const handleExecuteDelete = () => {
    if (selectedMemberIds.length === 0) return;
    onBulkDeleteMembers(selectedMemberIds);
    setSelectedMemberIds([]);
    setIsSelectionMode(false);
    setShowDeleteConfirm(false);
  };

  const getRoleBadge = (role?: MemberRole, roleTitle?: string) => {
    const r = role || 'member';
    switch (r) {
      case 'admin':
        return (
          <span className="px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-[9.5px] border border-red-300 dark:border-red-800 flex items-center gap-0.5">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span>{roleTitle || 'Admin'}</span>
          </span>
        );
      case 'moderator':
        return (
          <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-[9.5px] border border-amber-300 dark:border-amber-800 flex items-center gap-0.5">
            <Edit className="w-2.5 h-2.5" />
            <span>{roleTitle || 'Mod'}</span>
          </span>
        );
      case 'viewer':
        return (
          <span className="px-1.5 py-0.2 rounded bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[9.5px]">
            {roleTitle || 'Viewer'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pb-32 sm:pb-36">
      {/* Top Header & Search Control */}
      <div className="bg-stone-900 text-stone-100 px-4 py-3 border-b border-stone-800 shadow-sm space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-base font-serif text-amber-200">
              Danh Sách Thành Viên Gia Tộc
            </h2>
            <p className="text-xs text-stone-400">
              Tổng số {filteredMembers.length} / {members.length} người trong gia phả
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-1.5">
            {canManage && (
              <>
                {/* Permissions Management Button */}
                {onOpenManageMembers && (
                  <button
                    onClick={onOpenManageMembers}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-300 text-xs font-semibold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                    title="Mở bảng phân quyền dòng tộc"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Phân quyền</span>
                  </button>
                )}

                {/* Import File Button */}
                <button
                  onClick={onOpenImportModal}
                  className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                  title="Nhập danh sách từ tệp Excel, CSV, JSON"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Nhập tệp</span>
                </button>

                {/* Bulk Delete Mode Toggle */}
                {canBulkDelete && (
                  <button
                    onClick={() => {
                      setIsSelectionMode(!isSelectionMode);
                      if (isSelectionMode) setSelectedMemberIds([]);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSelectionMode
                        ? 'bg-red-600 border-red-500 text-white shadow'
                        : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
                    }`}
                    title="Bật/Tắt chế độ chọn xóa hàng loạt"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isSelectionMode ? 'Hủy chọn' : 'Xóa nhiều'}</span>
                  </button>
                )}

                {/* Add Member Button */}
                <button
                  onClick={onOpenAddMember}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm mới</span>
                </button>
              </>
            )}

            <button
              onClick={() => setViewMode(prev => prev === 'list' ? 'grid' : 'list')}
              className="p-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 hover:text-white"
              title="Chuyển chế độ xem"
            >
              {viewMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, tên tự, số điện thoại, chức vụ, vai trò..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-inner"
          />
        </div>

        {/* Filter Scrollable Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg bg-stone-800 border border-amber-800/80 text-amber-300 text-xs font-medium focus:outline-none shrink-0"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">👑 Quản trị viên (Admin)</option>
            <option value="moderator">✍️ Biên tập viên (Mod)</option>
            <option value="member">👤 Thành viên họ</option>
            <option value="viewer">👁️ Khách xem</option>
          </select>

          {/* Generation filter */}
          <select
            value={selectedGen === 'all' ? 'all' : selectedGen}
            onChange={(e) => setSelectedGen(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-xs font-medium focus:outline-none shrink-0"
          >
            <option value="all">Tất cả đời (1-{maxGen})</option>
            {genList.map(g => (
              <option key={g} value={g}>Đời {toRoman(g)} (Đời {g})</option>
            ))}
          </select>

          {/* Gender filter */}
          <button
            onClick={() => setSelectedGender(selectedGender === 'all' ? 'male' : selectedGender === 'male' ? 'female' : 'all')}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
              selectedGender !== 'all' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            {selectedGender === 'all' ? 'Giới tính: Tất cả' : selectedGender === 'male' ? 'Nam' : 'Nữ'}
          </button>

          {/* Status filter */}
          <button
            onClick={() => setSelectedStatus(selectedStatus === 'all' ? 'alive' : selectedStatus === 'alive' ? 'deceased' : 'all')}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
              selectedStatus !== 'all' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            {selectedStatus === 'all' ? 'Trạng thái: Tất cả' : selectedStatus === 'alive' ? '🟢 Còn sống' : '⚪ Đã mất'}
          </button>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-stone-300 text-xs focus:outline-none shrink-0"
          >
            <option value="generation">Sắp xếp: Theo đời (I-V)</option>
            <option value="name">Theo tên (A-Z)</option>
            <option value="birthYear">Theo năm sinh</option>
          </select>
        </div>
      </div>

      {/* Floating Bulk Selection Action Banner */}
      {isSelectionMode && (
        <div className="sticky top-14 z-20 bg-amber-900 text-amber-50 px-4 py-2.5 border-b border-amber-800 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllFiltered}
              className="flex items-center gap-1 font-bold text-amber-200 hover:text-white"
            >
              {selectedMemberIds.length === filteredMembers.length ? (
                <CheckSquare className="w-4 h-4 text-amber-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>
                {selectedMemberIds.length === filteredMembers.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </span>
            </button>
            <span className="text-stone-300">|</span>
            <span className="font-semibold text-amber-300">
              Đã chọn: {selectedMemberIds.length} người
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedMemberIds([]);
              }}
              className="px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-stone-200"
            >
              Hủy
            </button>
            <button
              disabled={selectedMemberIds.length === 0}
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold flex items-center gap-1 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa {selectedMemberIds.length > 0 ? `(${selectedMemberIds.length})` : ''}</span>
            </button>
          </div>
        </div>
      )}

      {/* Members Output List */}
      <div className="px-4 mt-4">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">Không tìm thấy thành viên</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
              Không có thành viên nào khớp với bộ lọc "{searchQuery}". Bạn có thể thêm thành viên mới hoặc tải danh sách từ file.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={onOpenImportModal}
                className="px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>Nhập từ file</span>
              </button>
              <button
                onClick={onOpenAddMember}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm thành viên</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredMembers.map((member) => {
              const isSelected = selectedMemberIds.includes(member.id);

              return (
                <div
                  key={member.id}
                  onClick={() => {
                    if (isSelectionMode) {
                      setSelectedMemberIds(prev => 
                        prev.includes(member.id) ? prev.filter(i => i !== member.id) : [...prev, member.id]
                      );
                    } else {
                      onSelectMember(member.id);
                    }
                  }}
                  className={`p-3 rounded-xl bg-white dark:bg-stone-800 border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                    isSelected
                      ? 'border-red-500 bg-red-50/30 dark:bg-red-950/20 ring-1 ring-red-400'
                      : 'border-stone-200 dark:border-stone-700/80 hover:border-amber-500 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Selection Checkbox */}
                    {isSelectionMode && (
                      <div
                        onClick={(e) => handleToggleSelectMember(member.id, e)}
                        className="shrink-0 text-amber-600 cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-red-600 fill-red-100" />
                        ) : (
                          <Square className="w-5 h-5 text-stone-400 hover:text-stone-600" />
                        )}
                      </div>
                    )}

                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-600/70 shrink-0 shadow-sm">
                      <img
                        src={member.avatarUrl}
                        alt={member.fullName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-stone-900/90 text-amber-300 text-[8px] font-bold text-center">
                        Đời {member.generation}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {member.fullName}
                        </h4>
                        {getRoleBadge(member.role, member.roleTitle)}
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          member.rank === 'truong' 
                            ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-300' 
                            : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
                        }`}>
                          {member.rank === 'truong' ? 'Trưởng' : member.rank === 'dau' ? 'Dâu' : member.rank === 're' ? 'Rể' : 'Thứ'}
                        </span>
                      </div>

                      {member.courtesyName && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate">
                          Tên tự: {member.courtesyName}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[10.5px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                        <span>{member.birthYear} - {member.isAlive ? 'Hiện tại' : member.deathYear || '?'}</span>
                        <span>•</span>
                        <span>{member.branch}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Role assign button */}
                    {onOpenRoleModal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenRoleModal(member);
                        }}
                        className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 hover:bg-amber-100 text-stone-600 dark:text-stone-300 hover:text-amber-800 transition-colors"
                        title="Chỉ định phân quyền cho người này"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                      </button>
                    )}

                    <div className="text-right hidden sm:block">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        member.isAlive 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
                      }`}>
                        {member.isAlive ? 'Còn sống' : 'Đã khuất'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredMembers.map((member) => {
              const isSelected = selectedMemberIds.includes(member.id);

              return (
                <div
                  key={member.id}
                  onClick={() => {
                    if (isSelectionMode) {
                      setSelectedMemberIds(prev => 
                        prev.includes(member.id) ? prev.filter(i => i !== member.id) : [...prev, member.id]
                      );
                    } else {
                      onSelectMember(member.id);
                    }
                  }}
                  className={`relative p-3 rounded-xl bg-white dark:bg-stone-800 border cursor-pointer transition-all hover:shadow text-center group ${
                    isSelected
                      ? 'border-red-500 bg-red-50/40 ring-1 ring-red-400'
                      : 'border-stone-200 dark:border-stone-700 hover:border-amber-500'
                  }`}
                >
                  {isSelectionMode && (
                    <div className="absolute top-2 right-2 z-10">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-red-600 fill-red-100" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                  )}

                  <div className="relative w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-amber-600/70 mb-2 shadow-sm">
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-stone-900/90 text-amber-300 text-[8.5px] font-bold py-0.2">
                      Đời {member.generation}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-600">
                    {member.fullName}
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                    {member.birthYear} - {member.isAlive ? 'nay' : member.deathYear || '?'}
                  </p>
                  
                  <div className="mt-1 flex items-center justify-center gap-1">
                    {getRoleBadge(member.role, member.roleTitle) || (
                      <span className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                        {member.rank === 'truong' ? 'Trưởng chi' : member.rank === 'dau' ? 'Dâu họ' : 'Thành viên'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Xác nhận xóa hàng loạt?
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Bạn đang chuẩn bị xóa <strong>{selectedMemberIds.length}</strong> thành viên khỏi cây gia phả. Hành động này sẽ tự động cập nhật liên kết phả đồ.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
