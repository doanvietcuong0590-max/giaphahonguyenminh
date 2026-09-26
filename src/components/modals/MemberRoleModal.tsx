import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Shield, 
  Edit3, 
  Eye, 
  Users, 
  Check, 
  Sparkles,
  Lock,
  UserCheck,
  Award
} from 'lucide-react';
import { Member, MemberRole, MemberPermissions } from '../../types';

interface MemberRoleModalProps {
  isOpen: boolean;
  member: Member | null;
  onClose: () => void;
  onSaveRole: (
    memberId: string, 
    role: MemberRole, 
    roleTitle?: string, 
    permissions?: MemberPermissions
  ) => void;
}

export const MemberRoleModal: React.FC<MemberRoleModalProps> = ({
  isOpen,
  member,
  onClose,
  onSaveRole,
}) => {
  if (!isOpen || !member) return null;

  const [selectedRole, setSelectedRole] = useState<MemberRole>(member.role || 'member');
  const [roleTitle, setRoleTitle] = useState<string>(member.roleTitle || '');
  const [permissions, setPermissions] = useState<MemberPermissions>({
    canEditTree: member.permissions?.canEditTree ?? (member.role === 'admin' || member.role === 'moderator'),
    canAddMembers: member.permissions?.canAddMembers ?? (member.role === 'admin' || member.role === 'moderator'),
    canDeleteMembers: member.permissions?.canDeleteMembers ?? (member.role === 'admin'),
    canPostMemories: member.permissions?.canPostMemories ?? (member.role !== 'viewer'),
    canManageRoles: member.permissions?.canManageRoles ?? (member.role === 'admin'),
  });

  useEffect(() => {
    if (member) {
      const currentRole = member.role || 'member';
      setSelectedRole(currentRole);
      setRoleTitle(member.roleTitle || '');
      setPermissions({
        canEditTree: member.permissions?.canEditTree ?? (currentRole === 'admin' || currentRole === 'moderator'),
        canAddMembers: member.permissions?.canAddMembers ?? (currentRole === 'admin' || currentRole === 'moderator'),
        canDeleteMembers: member.permissions?.canDeleteMembers ?? (currentRole === 'admin'),
        canPostMemories: member.permissions?.canPostMemories ?? (currentRole !== 'viewer'),
        canManageRoles: member.permissions?.canManageRoles ?? (currentRole === 'admin'),
      });
    }
  }, [member]);

  const handleSelectRolePreset = (role: MemberRole) => {
    setSelectedRole(role);
    if (role === 'admin') {
      setPermissions({
        canEditTree: true,
        canAddMembers: true,
        canDeleteMembers: true,
        canPostMemories: true,
        canManageRoles: true,
      });
      if (!roleTitle) setRoleTitle('Quản trị viên dòng tộc');
    } else if (role === 'moderator') {
      setPermissions({
        canEditTree: true,
        canAddMembers: true,
        canDeleteMembers: false,
        canPostMemories: true,
        canManageRoles: false,
      });
      if (!roleTitle) setRoleTitle('Biên tập viên gia phả');
    } else if (role === 'member') {
      setPermissions({
        canEditTree: false,
        canAddMembers: false,
        canDeleteMembers: false,
        canPostMemories: true,
        canManageRoles: false,
      });
    } else if (role === 'viewer') {
      setPermissions({
        canEditTree: false,
        canAddMembers: false,
        canDeleteMembers: false,
        canPostMemories: false,
        canManageRoles: false,
      });
    }
  };

  const handleTogglePermission = (key: keyof MemberPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRole(
      member.id,
      selectedRole,
      roleTitle.trim() || undefined,
      permissions
    );
    onClose();
  };

  const roleOptions: {
    role: MemberRole;
    title: string;
    badge: string;
    description: string;
    icon: any;
    color: string;
    bgSelected: string;
  }[] = [
    {
      role: 'admin',
      title: 'Quản Trị Viên (Admin)',
      badge: 'Toàn quyền',
      description: 'Toàn quyền quản trị cây gia phả, phân quyền thành viên, nhập/xóa dữ liệu dòng họ.',
      icon: ShieldCheck,
      color: 'text-red-700 dark:text-red-400',
      bgSelected: 'border-red-500 bg-red-50/70 dark:bg-red-950/30',
    },
    {
      role: 'moderator',
      title: 'Biên Tập Viên (Moderator)',
      badge: 'Biên tập & Duyệt',
      description: 'Được phép thêm và sửa thông tin thành viên phả đồ, tạo & duyệt bài viết kỷ niệm.',
      icon: Edit3,
      color: 'text-amber-700 dark:text-amber-400',
      bgSelected: 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30',
    },
    {
      role: 'member',
      title: 'Thành Viên Gia Tộc (Member)',
      badge: 'Thành viên',
      description: 'Được xem trọn vẹn gia phả dòng tộc, đăng bài kỷ niệm gia đình và bình luận.',
      icon: Users,
      color: 'text-blue-700 dark:text-blue-400',
      bgSelected: 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/30',
    },
    {
      role: 'viewer',
      title: 'Khách Xem (Viewer)',
      badge: 'Chỉ đọc',
      description: 'Chỉ có quyền xem cây gia phả, không được phép chỉnh sửa hay đăng tải bài viết.',
      icon: Eye,
      color: 'text-stone-700 dark:text-stone-300',
      bgSelected: 'border-stone-400 bg-stone-100 dark:bg-stone-800',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-50 flex items-center justify-between border-b border-amber-800/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif text-amber-100">
                Chỉ Định Phân Quyền Thành Viên
              </h3>
              <p className="text-[11px] text-amber-300/80">
                Thiết lập vai trò & quyền hạn cho cá nhân trong dòng họ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Preview Strip */}
        <div className="px-4 py-3 bg-amber-50/80 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700 flex items-center gap-3 shrink-0">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-600 shrink-0">
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                {member.fullName}
              </h4>
              <span className="text-[10.5px] px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-semibold shrink-0">
                Đời {member.generation}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              {member.branch} {member.phone ? `• ${member.phone}` : ''}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. Choose Main Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 block">
              1. Chọn Vai Trò Phân Quyền
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roleOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedRole === opt.role;
                return (
                  <div
                    key={opt.role}
                    onClick={() => handleSelectRolePreset(opt.role)}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected 
                        ? opt.bgSelected + ' shadow-sm'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg bg-white dark:bg-stone-700 shadow-sm ${opt.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                          {opt.title}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected 
                          ? 'border-amber-600 bg-amber-600 text-white' 
                          : 'border-stone-300 dark:border-stone-600'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Custom Role Title / Clan Position */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center justify-between">
              <span>2. Chức Vụ / Danh Xưng Trong Tộc (Tùy chọn)</span>
              <span className="text-[10px] text-stone-400 font-normal">Hiển thị cạnh tên</span>
            </label>
            <input
              type="text"
              placeholder="VD: Trưởng Tộc, Thư ký dòng họ, Ban Trị Sự, Thủ quỹ..."
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-medium"
            />
          </div>

          {/* 3. Granular Permission Toggles */}
          <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-800">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 block">
              3. Quyền Hạn Chi Tiết Cho Thành Viên
            </label>

            <div className="space-y-2 bg-stone-50 dark:bg-stone-800/60 p-3 rounded-2xl border border-stone-200 dark:border-stone-700">
              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700/50 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    🌳 Sửa phả đồ & mối quan hệ
                  </span>
                  <span className="text-[10.5px] text-stone-500 dark:text-stone-400">
                    Chỉnh sửa thông tin ngày sinh, mất, mộ phần, vợ chồng
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canEditTree || false}
                  onChange={() => handleTogglePermission('canEditTree')}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700/50 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    ➕ Thêm mới & Nhập tệp thành viên
                  </span>
                  <span className="text-[10.5px] text-stone-500 dark:text-stone-400">
                    Thêm từng người hoặc nạp dữ liệu từ tệp Excel/CSV
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canAddMembers || false}
                  onChange={() => handleTogglePermission('canAddMembers')}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700/50 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    🗑️ Xóa thành viên & dữ liệu dòng họ
                  </span>
                  <span className="text-[10.5px] text-stone-500 dark:text-stone-400">
                    Xóa cá nhân hoặc xóa hàng loạt thành viên
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canDeleteMembers || false}
                  onChange={() => handleTogglePermission('canDeleteMembers')}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700/50 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    📝 Đăng bài kỷ niệm & kiểm duyệt
                  </span>
                  <span className="text-[10.5px] text-stone-500 dark:text-stone-400">
                    Đăng tin tức, hình ảnh dòng họ và bình luận
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canPostMemories || false}
                  onChange={() => handleTogglePermission('canPostMemories')}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-stone-700/50 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    👑 Phân quyền cho thành viên khác
                  </span>
                  <span className="text-[10.5px] text-stone-500 dark:text-stone-400">
                    Cấp hoặc thay đổi quyền quản trị cho các con cháu
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={permissions.canManageRoles || false}
                  onChange={() => handleTogglePermission('canManageRoles')}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
              </label>
            </div>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white text-xs font-bold shadow-md hover:shadow transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Phân Quyền</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
