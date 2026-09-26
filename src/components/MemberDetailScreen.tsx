import React from 'react';
import { 
  ArrowLeft, 
  Edit3, 
  UserPlus, 
  Share2, 
  Heart, 
  MapPin, 
  Calendar, 
  Award, 
  Phone, 
  Mail, 
  BookOpen, 
  Users, 
  Flame, 
  Shield, 
  Clock,
  Sparkles,
  ExternalLink,
  Camera
} from 'lucide-react';
import { Member, GenealogyTree, MemberRole, MemberPermissions } from '../types';

interface MemberDetailScreenProps {
  memberId: string;
  members: Member[];
  tree?: GenealogyTree;
  onBack: () => void;
  onSelectMember?: (id: string) => void;
  onSelectRelative?: (id: string) => void;
  onOpenEditMember?: (member: Member) => void;
  onEditMember?: (member: Member) => void;
  onOpenAddRelative?: (memberId: string) => void;
  onAddRelative?: (memberId: string, relType?: any) => void;
  onShare?: () => void;
  onShareMember?: () => void;
  onDeleteMember?: (id: string) => void;
  onOpenRoleModal?: (member: Member) => void;
  onUpdateMemberRole?: (memberId: string, role: MemberRole, roleTitle?: string, permissions?: MemberPermissions) => void;
}

export const MemberDetailScreen: React.FC<MemberDetailScreenProps> = ({
  memberId,
  members,
  tree,
  onBack,
  onSelectMember,
  onSelectRelative,
  onOpenEditMember,
  onEditMember,
  onOpenAddRelative,
  onAddRelative,
  onShare,
  onShareMember,
  onDeleteMember,
  onOpenRoleModal,
  onUpdateMemberRole,
}) => {
  const member = members.find(m => m.id === memberId) || members[0];

  const handleSelect = (id: string) => {
    if (onSelectMember) onSelectMember(id);
    else if (onSelectRelative) onSelectRelative(id);
  };

  const handleEdit = (m: Member) => {
    if (onOpenEditMember) onOpenEditMember(m);
    else if (onEditMember) onEditMember(m);
  };

  const handleAddRel = (mid: string) => {
    if (onOpenAddRelative) onOpenAddRelative(mid);
    else if (onAddRelative) onAddRelative(mid, 'child');
  };

  const handleShareClick = () => {
    if (onShare) onShare();
    else if (onShareMember) onShareMember();
  };

  // Get relatives
  const parents = members.filter(m => member.parentIds.includes(m.id));
  const spouses = members.filter(m => member.spouseIds.includes(m.id));
  const children = members.filter(m => m.parentIds.includes(member.id));
  
  // Siblings (share same parents)
  const siblings = members.filter(m => 
    m.id !== member.id && 
    m.parentIds.length > 0 && 
    m.parentIds.some(pid => member.parentIds.includes(pid))
  );

  // Age calculation
  const birthYearNum = Number(member.birthYear) || 0;
  const deathYearNum = Number(member.deathYear) || (member.isAlive ? new Date().getFullYear() : 0);
  const lifespan = (birthYearNum && deathYearNum) ? deathYearNum - birthYearNum : null;

  return (
    <div className="pb-28 space-y-4">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-amber-950/95 backdrop-blur-md px-4 py-2.5 text-amber-50 flex items-center justify-between border-b border-amber-900 shadow-md">
        <button
          onClick={onBack}
          className="p-1.5 rounded-full hover:bg-amber-900/60 transition-colors flex items-center gap-1 text-amber-200 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-semibold">Quay lại</span>
        </button>

        <h3 className="font-bold text-xs sm:text-sm font-serif text-amber-100 truncate max-w-[50%]">
          Hồ Sơ Thành Viên
        </h3>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleEdit(member)}
            className="p-1.5 rounded-full hover:bg-amber-900/60 text-amber-200 hover:text-white transition-colors"
            title="Chỉnh sửa hồ sơ"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleShareClick}
            className="p-1.5 rounded-full hover:bg-amber-900/60 text-amber-200 hover:text-white transition-colors"
            title="Chia sẻ thông tin"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Cover & Avatar Profile Card */}
      <div className="px-4">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-amber-950 via-stone-900 to-stone-900 text-stone-100 p-5 border border-amber-800/40 shadow-md">
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left relative z-10">
            {/* Avatar with gold border */}
            <div 
              onClick={() => handleEdit(member)}
              className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-4 border-amber-500 shadow-xl shrink-0 transition-transform active:scale-95"
              title="Nhấn để đổi ảnh đại diện hoặc chỉnh sửa hồ sơ"
            >
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-200 text-[10px] font-bold gap-0.5">
                <Camera className="w-4 h-4 text-white" />
                <span>Đổi ảnh</span>
              </div>
              <span className="absolute bottom-0 inset-x-0 bg-stone-950/90 text-amber-300 text-[10px] font-bold text-center py-0.5 group-hover:opacity-0 transition-opacity">
                Đời thứ {member.generation}
              </span>
            </div>

            {/* Main Info */}
            <div className="space-y-1 min-w-0 flex-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-semibold">
                <Shield className="w-3 h-3" />
                <span>{member.generationTitle || `Đời thứ ${member.generation}`} • {member.branch}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 tracking-tight">
                {member.fullName}
              </h2>

              {(member.courtesyName || member.tabooName) && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-amber-300/90">
                  {member.courtesyName && <span>Tên tự: <strong>{member.courtesyName}</strong></span>}
                  {member.tabooName && <span>Tên húy: <strong>{member.tabooName}</strong></span>}
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  member.isAlive 
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' 
                    : 'bg-stone-800 text-stone-300 border border-stone-700'
                }`}>
                  {member.isAlive ? '🟢 Còn sống' : `⚪ Hưởng thọ: ${lifespan ? `${lifespan} tuổi` : 'Đã khuất'}`}
                </span>

                <span className="px-2.5 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/50 text-xs font-semibold">
                  {member.rank === 'truong' ? 'Trưởng Chi' : member.rank === 'dau' ? 'Dâu họ' : member.rank === 're' ? 'Rể họ' : 'Chi Thứ'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Life Details Row */}
          <div className="mt-5 pt-4 border-t border-amber-800/50 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-stone-400 text-[11px] block">Năm sinh - Năm mất</span>
              <span className="font-semibold text-amber-200 font-mono">
                {member.birthDate || member.birthYear} — {member.isAlive ? 'Hiện tại' : (member.deathDate || member.deathYear || '?')}
              </span>
            </div>

            {member.lunarDeathDate && (
              <div>
                <span className="text-stone-400 text-[11px] block">Ngày giỗ âm lịch</span>
                <span className="font-semibold text-red-400 flex items-center gap-1 font-serif">
                  <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  {member.lunarDeathDate}
                </span>
              </div>
            )}

            {member.profession && (
              <div>
                <span className="text-stone-400 text-[11px] block">Chức vụ / Nghề nghiệp</span>
                <span className="font-semibold text-stone-200 truncate block">{member.profession}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role & Permissions Card */}
      <div className="px-4">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/10 via-stone-900/5 to-amber-900/10 dark:from-stone-800 dark:to-stone-800 border border-amber-300 dark:border-amber-900/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif">
                  Phân Quyền & Vai Trò Dòng Tộc
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Cấp quyền quản trị dữ liệu gia phả & bài viết
                </p>
              </div>
            </div>

            {onOpenRoleModal && (
              <button
                onClick={() => onOpenRoleModal(member)}
                className="px-3 py-1 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-all active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chỉ định quyền</span>
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  member.role === 'admin'
                    ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800'
                    : member.role === 'moderator'
                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                    : member.role === 'viewer'
                    ? 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                    : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                }`}>
                  {member.role === 'admin'
                    ? '👑 Quản Trị Viên (Admin)'
                    : member.role === 'moderator'
                    ? '✍️ Biên Tập Viên (Moderator)'
                    : member.role === 'viewer'
                    ? '👁️ Khách Xem (Viewer)'
                    : '👤 Thành Viên Dòng Họ (Member)'}
                </span>
                {member.roleTitle && (
                  <span className="text-xs text-stone-600 dark:text-stone-300 font-semibold">
                    • {member.roleTitle}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Sửa phả đồ: {member.role === 'admin' || member.role === 'moderator' ? 'Được phép' : 'Không'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Xóa thành viên: {member.role === 'admin' ? 'Được phép' : 'Không'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Đăng kỷ niệm: {member.role !== 'viewer' ? 'Được phép' : 'Không'}</span>
                </span>
              </div>
            </div>

            {onUpdateMemberRole && (
              <select
                value={member.role || 'member'}
                onChange={(e) => onUpdateMemberRole(member.id, e.target.value as MemberRole)}
                className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200 focus:outline-none focus:border-amber-500 cursor-pointer shrink-0 self-end sm:self-center"
              >
                <option value="admin">Quản trị viên (Admin)</option>
                <option value="moderator">Biên tập viên (Mod)</option>
                <option value="member">Thành viên (Member)</option>
                <option value="viewer">Khách xem (Viewer)</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Burial Place / Resting Location if deceased */}
      {member.burialPlace && (
        <div className="px-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-stone-800/90 border border-amber-200 dark:border-stone-700 text-xs flex items-start gap-2.5 shadow-sm">
            <MapPin className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100">Nơi an táng / Mộ phần:</span>
              <p className="text-stone-700 dark:text-stone-300 mt-0.5">{member.burialPlace}</p>
            </div>
          </div>
        </div>
      )}

      {/* Contact info if alive */}
      {member.isAlive && (member.phone || member.address) && (
        <div className="px-4">
          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs space-y-2 shadow-sm">
            <h4 className="font-bold text-stone-900 dark:text-stone-100 font-serif flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Thông Tin Liên Lạc Hiện Tại</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600 dark:text-stone-300">
              {member.phone && (
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">SĐT:</span>
                  <a href={`tel:${member.phone}`} className="font-semibold text-amber-700 dark:text-amber-400 hover:underline font-mono">
                    {member.phone}
                  </a>
                </div>
              )}
              {member.address && (
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">Địa chỉ:</span>
                  <span>{member.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Direct Lineage Relationships Section */}
      <div className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base font-serif text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>Quan Hệ Trực Hệ Gia Đình</span>
          </h3>
          <button
            onClick={() => handleAddRel(member.id)}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Thêm thân nhân</span>
          </button>
        </div>

        {/* 1. Parents */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Thân Phụ & Thân Mẫu (Cha Mẹ)
          </h4>
          {parents.length === 0 ? (
            <p className="text-xs text-stone-400 italic">Bậc khởi thủy / Chưa ghi nhận trong phả đồ</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {parents.map((parent) => (
                <div
                  key={parent.id}
                  onClick={() => handleSelect(parent.id)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-500 cursor-pointer transition-all"
                >
                  <img
                    src={parent.avatarUrl}
                    alt={parent.fullName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-amber-600/50"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">{parent.fullName}</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {parent.gender === 'male' ? 'Thân phụ (Cha)' : 'Thân mẫu (Mẹ)'} • Đời {parent.generation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Spouses */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Phối Ngẫu (Vợ / Chồng)</span>
          </h4>
          {spouses.length === 0 ? (
            <p className="text-xs text-stone-400 italic">Chưa ghi nhận thông tin phối ngẫu</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {spouses.map((spouse) => (
                <div
                  key={spouse.id}
                  onClick={() => handleSelect(spouse.id)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-500 cursor-pointer transition-all"
                >
                  <img
                    src={spouse.avatarUrl}
                    alt={spouse.fullName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-rose-500/50"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">{spouse.fullName}</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {spouse.gender === 'female' ? 'Chính thất (Vợ)' : 'Phu quân (Chồng)'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Children */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Con Cái ({children.length} người)
          </h4>
          {children.length === 0 ? (
            <p className="text-xs text-stone-400 italic">Chưa ghi nhận con cái</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {children.map((child) => (
                <div
                  key={child.id}
                  onClick={() => handleSelect(child.id)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-500 cursor-pointer transition-all"
                >
                  <img
                    src={child.avatarUrl}
                    alt={child.fullName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-amber-600/50"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">{child.fullName}</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {child.gender === 'male' ? 'Con trai' : 'Con gái'} ({child.rank === 'truong' ? 'Trưởng' : 'Thứ'}) • Sinh {child.birthYear}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. Siblings */}
        {siblings.length > 0 && (
          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Anh Chị Em Ruột ({siblings.length} người)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {siblings.map((sibling) => (
                <div
                  key={sibling.id}
                  onClick={() => handleSelect(sibling.id)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-500 cursor-pointer transition-all"
                >
                  <img
                    src={sibling.avatarUrl}
                    alt={sibling.fullName}
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 rounded-full object-cover border border-stone-400"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">{sibling.fullName}</p>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">
                      {sibling.gender === 'male' ? 'Anh/Em trai' : 'Chị/Em gái'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Biography & Clan Merits */}
      {member.bio && (
        <div className="px-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-2">
            <h3 className="font-bold text-sm sm:text-base font-serif text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Tiểu Sử & Công Đức Dòng Họ</span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-serif">
              {member.bio}
            </p>
          </div>
        </div>
      )}

      {/* Achievements / Awards if any */}
      {member.achievements && member.achievements.length > 0 && (
        <div className="px-4">
          <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-stone-800 border border-amber-200 dark:border-amber-900/50 shadow-sm space-y-2">
            <h3 className="font-bold text-sm font-serif text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Công Đức & Khen Thưởng</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-stone-800 dark:text-stone-200">
              {member.achievements.map((ach, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <span>{ach}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Bottom Sticky Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 p-3 max-w-md mx-auto sm:max-w-none flex items-center justify-between gap-3 shadow-lg">
        <button
          onClick={() => handleAddRel(member.id)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Người Thân</span>
        </button>

        <button
          onClick={() => handleEdit(member)}
          className="py-2.5 px-4 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs border border-stone-300 dark:border-stone-600 flex items-center gap-1.5"
        >
          <Edit3 className="w-4 h-4" />
          <span>Sửa hồ sơ</span>
        </button>
      </div>
    </div>
  );
};
