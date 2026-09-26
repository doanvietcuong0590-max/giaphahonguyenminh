import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Users, 
  Check, 
  Search, 
  KeyRound,
  Sparkles,
  Shield,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Lock,
  Sliders,
  Award,
  RefreshCw
} from 'lucide-react';
import { Member, MemberRole, UserProfile, MemberPermissions } from '../../types';

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentUser?: UserProfile;
  onUpdateMemberRole?: (memberId: string, role: MemberRole, roleTitle?: string, permissions?: MemberPermissions) => void;
  onOpenSpecificMemberRoleModal?: (member: Member) => void;
  onUpdateMemberPassword?: (memberId: string, newPassword: string) => void;
}

export const ManageMembersModal: React.FC<ManageMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  currentUser,
  onUpdateMemberRole,
  onOpenSpecificMemberRoleModal,
  onUpdateMemberPassword,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'all_members' | 'role_matrix'>('all_members');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<MemberRole | 'all'>('all');
  
  // Admin Change Password Modal State
  const [passwordTargetMember, setPasswordTargetMember] = useState<Member | null>(null);
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [showMemberPassword, setShowMemberPassword] = useState(false);

  // Filter living/all members
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.phone && m.phone.includes(searchQuery)) ||
      (m.branch && m.branch.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.roleTitle && m.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const memberRole = m.role || 'member';
    const matchesRole = roleFilter === 'all' || memberRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const adminCount = members.filter(m => m.role === 'admin').length;
  const modCount = members.filter(m => m.role === 'moderator').length;
  const memberCount = members.filter(m => !m.role || m.role === 'member').length;
  const viewerCount = members.filter(m => m.role === 'viewer').length;

  const handleRoleQuickChange = (memberId: string, newRole: MemberRole) => {
    if (onUpdateMemberRole) {
      onUpdateMemberRole(memberId, newRole);
    }
  };

  const getRoleBadge = (role?: MemberRole, roleTitle?: string) => {
    const r = role || 'member';
    switch (r) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 font-bold text-[10px] border border-red-300 dark:border-red-800 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>{roleTitle || 'Quản trị viên'}</span>
          </span>
        );
      case 'moderator':
        return (
          <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold text-[10px] border border-amber-300 dark:border-amber-800 flex items-center gap-1">
            <Edit className="w-3 h-3" />
            <span>{roleTitle || 'Biên tập viên'}</span>
          </span>
        );
      case 'viewer':
        return (
          <span className="px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium text-[10px] border border-stone-300 dark:border-stone-700 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{roleTitle || 'Khách xem'}</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 font-medium text-[10px] border border-blue-300 dark:border-blue-800 flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{roleTitle || 'Thành viên họ'}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-50 flex items-center justify-between border-b border-amber-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-600/40 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif text-amber-100">
                Phân Quyền & Vai Trò Thành Viên Dòng Họ
              </h3>
              <p className="text-[11px] text-amber-300/80">
                Chỉ định vai trò và quyền hạn quản lý cho từng cá nhân
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar & Stats */}
        <div className="p-3 bg-stone-50 dark:bg-stone-900/80 border-b border-stone-100 dark:border-stone-800 space-y-2.5 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200 dark:bg-stone-800 rounded-2xl text-xs">
            <button
              onClick={() => setActiveTab('all_members')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'all_members'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Danh Sách Phân Quyền ({members.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('role_matrix')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'role_matrix'
                  ? 'bg-amber-700 text-white shadow-sm'
                  : 'text-stone-700 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Quy Định Các Cấp Quyền</span>
            </button>
          </div>

          {activeTab === 'all_members' && (
            <div className="space-y-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm thành viên theo tên, chi họ, số điện thoại hoặc chức danh..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Role filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                    roleFilter === 'all'
                      ? 'bg-amber-700 text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  Tất cả ({members.length})
                </button>
                <button
                  onClick={() => setRoleFilter('admin')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                    roleFilter === 'admin'
                      ? 'bg-red-700 text-white'
                      : 'bg-white dark:bg-stone-800 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900'
                  }`}
                >
                  👑 Admin ({adminCount})
                </button>
                <button
                  onClick={() => setRoleFilter('moderator')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                    roleFilter === 'moderator'
                      ? 'bg-amber-700 text-white'
                      : 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                  }`}
                >
                  ✍️ Biên tập ({modCount})
                </button>
                <button
                  onClick={() => setRoleFilter('member')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                    roleFilter === 'member'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white dark:bg-stone-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                  }`}
                >
                  👤 Thành viên ({memberCount})
                </button>
                <button
                  onClick={() => setRoleFilter('viewer')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all shrink-0 ${
                    roleFilter === 'viewer'
                      ? 'bg-stone-700 text-white'
                      : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                  }`}
                >
                  👁️ Khách ({viewerCount})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          {activeTab === 'role_matrix' ? (
            /* TAB MA TRẬN PHÂN QUYỀN */
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-stone-800 border border-amber-200 dark:border-amber-900/60 space-y-1">
                <h4 className="font-bold text-amber-950 dark:text-amber-200 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Quy Chế & Quyền Hạn Trong Dòng Họ</span>
                </h4>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                  Hệ thống thiết lập 4 cấp bậc phân quyền chuyên biệt giúp bảo vệ dữ liệu phả đồ, tránh chỉnh sửa nhầm lẫn và phân công rõ ràng cho Hội đồng gia tộc:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Admin Role */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border-2 border-red-200 dark:border-red-900/50 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold text-xs flex items-center gap-1">
                      👑 1. Quản Trị Viên (Admin / Trưởng Tộc)
                    </span>
                    <span className="text-[10px] text-red-600 font-semibold font-mono">Toàn Quyền</span>
                  </div>
                  <ul className="text-[11px] text-stone-600 dark:text-stone-300 list-disc list-inside space-y-1 leading-relaxed">
                    <li>Toàn quyền chỉnh sửa cây phả hệ, đổi tên, nhánh, ngày sinh/mất</li>
                    <li><strong>Nhập thành viên từ file Excel, CSV</strong> và <strong>xóa hàng loạt</strong></li>
                    <li><strong>Chỉ định và phân quyền</strong> cho bất kỳ thành viên nào trong họ</li>
                    <li>Kiểm duyệt và gỡ bỏ các bài viết kỷ niệm không phù hợp</li>
                  </ul>
                </div>

                {/* Moderator Role */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1">
                      ✍️ 2. Biên Tập Viên (Thư Ký / Ban Trị Sự)
                    </span>
                    <span className="text-[10px] text-amber-600 font-semibold font-mono">Moderator</span>
                  </div>
                  <ul className="text-[11px] text-stone-600 dark:text-stone-300 list-disc list-inside space-y-1 leading-relaxed">
                    <li>Thêm người thân, cập nhật tiểu sử, thành tựu, nơi an táng cụ tổ</li>
                    <li>Đăng tin tức kỷ niệm dòng họ, tải lên nhiều hình ảnh</li>
                    <li>Không có quyền xóa hàng loạt hay thay đổi phân quyền Admin</li>
                  </ul>
                </div>

                {/* Member Role */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-xs flex items-center gap-1">
                      👤 3. Thành Viên Dòng Họ (Con Cháu Trong Tộc)
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold font-mono">Member</span>
                  </div>
                  <ul className="text-[11px] text-stone-600 dark:text-stone-300 list-disc list-inside space-y-1 leading-relaxed">
                    <li>Tra cứu cây gia phả đầy đủ mọi đời, xem thông tin liên lạc con cháu</li>
                    <li>Đăng tải bài viết chia sẻ kỷ niệm gia đình, bấm thích và bình luận</li>
                  </ul>
                </div>

                {/* Viewer Role */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1">
                      👁️ 4. Khách Xem (Chỉ Xem)
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold font-mono">Viewer</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Chỉ được xem cây gia phả, không được quyền chỉnh sửa dữ liệu hay đăng bài viết.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* TAB DANH SÁCH THÀNH VIÊN VÀ CHỈ ĐỊNH PHÂN QUYỀN */
            <div className="space-y-2.5">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Users className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-500 italic">
                    Không tìm thấy thành viên nào khớp với tìm kiếm.
                  </p>
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const role = member.role || 'member';
                  return (
                    <div
                      key={member.id}
                      className="p-3 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-amber-400/60 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-600/70 shrink-0">
                          <img
                            src={member.avatarUrl}
                            alt={member.fullName}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[7.5px] font-bold text-center">
                            Đời {member.generation}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-stone-900 dark:text-stone-100 truncate text-xs sm:text-sm">
                              {member.fullName}
                            </h4>
                            {getRoleBadge(member.role, member.roleTitle)}
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                            {member.branch} {member.phone ? `• ${member.phone}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Role Actions */}
                      <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto">
                        {/* Quick Role Dropdown */}
                        <select
                          value={role}
                          onChange={(e) => handleRoleQuickChange(member.id, e.target.value as MemberRole)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold focus:outline-none transition-all cursor-pointer ${
                            role === 'admin'
                              ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                              : role === 'moderator'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : role === 'viewer'
                              ? 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                          }`}
                        >
                          <option value="admin">👑 Quản trị viên (Admin)</option>
                          <option value="moderator">✍️ Biên tập viên (Mod)</option>
                          <option value="member">👤 Thành viên họ (Member)</option>
                          <option value="viewer">👁️ Khách xem (Viewer)</option>
                        </select>

                        {/* Quick Change Password Button for Admin */}
                        <button
                          onClick={() => {
                            setPasswordTargetMember(member);
                            setNewMemberPassword(member.password || '');
                            setShowMemberPassword(false);
                          }}
                          className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 transition-colors"
                          title="Admin: Đổi mật khẩu đăng nhập cho thành viên"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Detailed Config Button */}
                        {onOpenSpecificMemberRoleModal && (
                          <button
                            onClick={() => onOpenSpecificMemberRoleModal(member)}
                            className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-amber-100 dark:hover:bg-amber-950 text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-300 border border-stone-200 dark:border-stone-600 transition-colors"
                            title="Tùy chỉnh quyền chi tiết & danh xưng"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-stone-500 text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Phân quyền có hiệu lực tức thì trên toàn hệ thống</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold shadow-sm"
          >
            Hoàn tất
          </button>
        </div>
      </div>

      {/* Admin Quick Member Password Reset Dialog */}
      {passwordTargetMember && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl p-4 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                    Admin Đổi Mật Khẩu Thành Viên
                  </h4>
                  <p className="text-[10.5px] text-stone-500 dark:text-stone-400 truncate max-w-[200px]">
                    {passwordTargetMember.fullName} (Đời {passwordTargetMember.generation})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPasswordTargetMember(null)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
              <span className="text-[11px] text-amber-900 dark:text-amber-300 font-medium">
                Trạng thái mật khẩu hiện tại:
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-200 dark:bg-amber-900 text-amber-950 dark:text-amber-200">
                {passwordTargetMember.password ? 'Đã có mật khẩu' : 'Chưa đặt'}
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                  Mật khẩu mới cho thành viên:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const rand = Math.floor(1000 + Math.random() * 9000);
                    setNewMemberPassword(`GiaPha@${rand}`);
                    setShowMemberPassword(true);
                  }}
                  className="text-[10.5px] text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tạo ngẫu nhiên</span>
                </button>
              </div>

              <div className="relative flex items-center">
                <input
                  type={showMemberPassword ? 'text' : 'password'}
                  value={newMemberPassword}
                  onChange={(e) => setNewMemberPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full pr-9 pl-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowMemberPassword(!showMemberPassword)}
                  className="absolute right-2.5 text-stone-400 hover:text-stone-600"
                >
                  {showMemberPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                Sau khi đổi, hãy gửi mật khẩu mới cho {passwordTargetMember.fullName} để đăng nhập.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setPasswordTargetMember(null)}
                className="px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (onUpdateMemberPassword) {
                    onUpdateMemberPassword(passwordTargetMember.id, newMemberPassword);
                  }
                  // Also update local copy in members list if needed
                  passwordTargetMember.password = newMemberPassword;
                  setPasswordTargetMember(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Lưu Mật Khẩu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
