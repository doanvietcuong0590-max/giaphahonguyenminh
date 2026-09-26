import React from 'react';
import { 
  GitFork, 
  UserPlus, 
  ImagePlus, 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  Share2, 
  BookOpen,
  Users,
  Shield,
  Sliders,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { GenealogyTree, Member, MemoryPost, ScreenType, UserProfile } from '../types';

interface HomeScreenProps {
  tree: GenealogyTree;
  members: Member[];
  memories: MemoryPost[];
  currentUser?: UserProfile;
  onNavigate: (screen: ScreenType) => void;
  onSelectMember: (memberId: string) => void;
  onSelectMemory: (memoryId: string) => void;
  onOpenAddMember: () => void;
  onOpenCreateMemory: () => void;
  onOpenShare: () => void;
  onOpenManageMembers?: () => void;
  onOpenPrint?: () => void;
  onOpenEditGenealogy?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tree,
  members,
  memories,
  currentUser,
  onNavigate,
  onSelectMember,
  onSelectMemory,
  onOpenAddMember,
  onOpenCreateMemory,
  onOpenShare,
  onOpenManageMembers,
  onOpenPrint,
  onOpenEditGenealogy,
}) => {
  // Find primary ancestor (Generation 1)
  const ancestors = members.filter(m => m.generation === 1);
  const latestMemory = memories[0] || null;

  // Leaders / Admins / Moderators
  const clanLeaders = members.filter(m => m.role === 'admin' || m.role === 'moderator');
  const livingMembers = members.filter(m => m.isAlive);

  return (
    <div className="pb-32 sm:pb-36 space-y-4">
      {/* 1. Traditional Clan Hero Banner */}
      <div className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-amber-50 p-4 sm:p-6 shadow-md border-b border-amber-800/40">
        {/* Background Decorative Motifs */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gia phả chính thống • {tree.establishedYear || 'Lâu đời'}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] px-2 py-0.5 rounded bg-stone-800/80 text-amber-200/90 font-mono border border-amber-700/40">
                Mã họ: {tree.code}
              </span>
              {onOpenEditGenealogy && (
                <button
                  onClick={onOpenEditGenealogy}
                  className="p-1 rounded-lg bg-amber-800/60 hover:bg-amber-700 text-amber-200 hover:text-white transition-colors border border-amber-600/40"
                  title="Cài đặt gia phả & Đổi Logo dòng họ"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3.5 my-1">
            {/* Clan Logo with golden border */}
            <div 
              onClick={onOpenEditGenealogy}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-0.5 bg-gradient-to-br from-amber-300 via-amber-600 to-amber-800 shadow-xl shrink-0 ${
                onOpenEditGenealogy ? 'cursor-pointer group' : ''
              }`}
              title="Logo Gia phả - Bấm để thay đổi"
            >
              <div className="w-full h-full rounded-[14px] overflow-hidden bg-stone-900 border border-amber-300/40 relative">
                {tree.avatarUrl ? (
                  <img
                    src={tree.avatarUrl}
                    alt={tree.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-300 font-bold font-serif text-sm">
                    {tree.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {onOpenEditGenealogy && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Sliders className="w-4 h-4 text-amber-300" />
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 tracking-tight truncate">
                {tree.name}
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/90 mt-0.5 flex items-center gap-1">
                <span className="font-semibold text-amber-300">{tree.branchName || tree.branch}</span>
                <span>•</span>
                <span className="truncate">{tree.origin || tree.originPlace}</span>
              </p>
            </div>
          </div>

          {/* Clan Motto quote box */}
          <div className="mt-3.5 p-3 rounded-xl bg-amber-900/40 border border-amber-700/40 backdrop-blur-sm">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Gia Huấn Tộc Ước</p>
                <p className="text-xs text-amber-100 italic mt-0.5 leading-relaxed font-serif">
                  "{tree.motto || tree.clanRules}"
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mt-3.5 pt-3 border-t border-amber-800/50 text-center">
            <div 
              onClick={() => onNavigate('tree')} 
              className="bg-stone-900/60 p-2 rounded-lg border border-amber-900/40 hover:border-amber-500/50 transition-colors cursor-pointer"
            >
              <div className="text-base sm:text-lg font-bold text-amber-300 font-serif">{tree.generationCount}</div>
              <div className="text-[10px] text-amber-200/70 font-medium">Đời / Thế hệ</div>
            </div>
            <div 
              onClick={() => onNavigate('members')} 
              className="bg-stone-900/60 p-2 rounded-lg border border-amber-900/40 hover:border-amber-500/50 transition-colors cursor-pointer"
            >
              <div className="text-base sm:text-lg font-bold text-amber-300 font-serif">{members.length}</div>
              <div className="text-[10px] text-amber-200/70 font-medium">Thành viên</div>
            </div>
            <div 
              onClick={() => onNavigate('members')} 
              className="bg-stone-900/60 p-2 rounded-lg border border-amber-900/40 hover:border-amber-500/50 transition-colors cursor-pointer"
            >
              <div className="text-base sm:text-lg font-bold text-emerald-300 font-serif">{livingMembers.length}</div>
              <div className="text-[10px] text-amber-200/70 font-medium">Đang sinh sống</div>
            </div>
            <div 
              onClick={() => {
                if (onOpenManageMembers) onOpenManageMembers();
                else onNavigate('profile');
              }} 
              className="bg-stone-900/60 p-2 rounded-lg border border-amber-900/40 hover:border-amber-500/50 transition-colors cursor-pointer"
            >
              <div className="text-base sm:text-lg font-bold text-red-400 font-serif">{clanLeaders.length}</div>
              <div className="text-[10px] text-amber-200/70 font-medium">Ban Trị Sự</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* 2. Ban Quản Trị & Phân Quyền Dòng Họ Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white shadow-md border border-amber-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm font-serif text-amber-100">
                  Ban Quản Trị & Ban Trị Sự Dòng Họ
                </h3>
                <p className="text-[10.5px] text-amber-300/80">
                  Đã chỉ định phân quyền cho {clanLeaders.length} thành viên nòng cốt
                </p>
              </div>
            </div>
            {onOpenManageMembers && (
              <button
                onClick={onOpenManageMembers}
                className="px-2.5 py-1 rounded-xl bg-amber-700 hover:bg-amber-800 text-amber-100 text-xs font-semibold flex items-center gap-1 shadow-sm transition-all active:scale-95"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Phân quyền</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {clanLeaders.slice(0, 3).map((leader) => (
              <div
                key={leader.id}
                onClick={() => onSelectMember(leader.id)}
                className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 border border-amber-900/40 hover:border-amber-500/60 cursor-pointer transition-all flex items-center gap-2"
              >
                <img
                  src={leader.avatarUrl}
                  alt={leader.fullName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border-2 border-amber-500 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-xs text-amber-100 truncate">
                    {leader.fullName}
                  </h4>
                  <span className={`text-[9.5px] font-semibold px-1.5 py-0.2 rounded-md inline-block truncate ${
                    leader.role === 'admin'
                      ? 'bg-red-950/80 text-red-300'
                      : 'bg-amber-950/80 text-amber-300'
                  }`}>
                    {leader.roleTitle || (leader.role === 'admin' ? 'Quản trị viên' : 'Biên tập viên')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Quick Action Buttons Grid */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2.5 px-1">
            Tính Năng Nhanh
          </h3>
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={() => onNavigate('tree')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm hover:border-amber-500 hover:shadow-md transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <GitFork className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-stone-700 dark:text-stone-200 text-center">Cây gia phả</span>
            </button>

            <button
              onClick={onOpenAddMember}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm hover:border-amber-500 hover:shadow-md transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <UserPlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-stone-700 dark:text-stone-200 text-center">Thêm người</span>
            </button>

            <button
              onClick={onOpenCreateMemory}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm hover:border-amber-500 hover:shadow-md transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <ImagePlus className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-stone-700 dark:text-stone-200 text-center">Đăng kỷ niệm</span>
            </button>

            <button
              onClick={() => {
                if (onOpenManageMembers) onOpenManageMembers();
                else onNavigate('profile');
              }}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm hover:border-amber-500 hover:shadow-md transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-stone-700 dark:text-stone-200 text-center">Phân quyền</span>
            </button>
          </div>
        </div>

        {/* 4. Ancestor & Direct Branch Snapshot */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Bậc Tiền Nhân Khởi Tổ</span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Các bậc khai sinh chi họ & các nhánh</p>
            </div>
            <button
              onClick={() => onNavigate('tree')}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5"
            >
              <span>Xem toàn cây</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {ancestors.map((ancestor) => (
              <div
                key={ancestor.id}
                onClick={() => onSelectMember(ancestor.id)}
                className="p-3 rounded-xl bg-amber-50/70 dark:bg-stone-900/80 border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-500 cursor-pointer transition-all hover:shadow group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-600/60 shrink-0">
                    <img
                      src={ancestor.avatarUrl}
                      alt={ancestor.fullName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-amber-800/90 text-amber-200 text-[8px] font-bold text-center py-0.2">
                      Đời 1
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400">
                      {ancestor.fullName}
                    </h4>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                      {ancestor.birthYear} - {ancestor.deathYear || '?'}
                    </p>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate mt-0.5">
                      {ancestor.courtesyName ? `Tự: ${ancestor.courtesyName}` : ancestor.generationTitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Add Node Card */}
            <div
              onClick={onOpenAddMember}
              className="p-3 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-amber-500/70 flex items-center justify-center gap-2 cursor-pointer transition-all bg-stone-50/50 dark:bg-stone-900/40 text-stone-600 dark:text-stone-300"
            >
              <UserPlus className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-medium">Thêm thành viên</span>
            </div>
          </div>
        </div>

        {/* 5. Recent Family Memory Highlights */}
        {latestMemory && (
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base font-serif text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Kỷ Niệm Nổi Bật</span>
              </h3>
              <button
                onClick={() => onNavigate('memories')}
                className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5"
              >
                <span>Tất cả ({memories.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div 
              onClick={() => onSelectMemory(latestMemory.id)}
              className="cursor-pointer group space-y-2.5"
            >
              {latestMemory.images && latestMemory.images.length > 0 && (
                <div className="relative h-44 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                  <img
                    src={latestMemory.images[0]}
                    alt={latestMemory.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-amber-700/80 backdrop-blur-sm text-white text-[10.5px] font-semibold flex items-center gap-1">
                    <span>Tin mới</span>
                  </div>
                  {latestMemory.images.length > 1 && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                      +{latestMemory.images.length - 1} ảnh
                    </div>
                  )}
                </div>
              )}

              <div>
                <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                  {latestMemory.title}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 mt-1 leading-relaxed">
                  {latestMemory.content}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-700">
                <div className="flex items-center gap-1.5">
                  <img
                    src={latestMemory.authorAvatar}
                    alt={latestMemory.authorName}
                    referrerPolicy="no-referrer"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="truncate">{latestMemory.authorName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                    <span>{latestMemory.likes}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{latestMemory.comments.length}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. Print & PDF Export Banner */}
        {onOpenPrint && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white border border-amber-800/60 flex items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <Printer className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs sm:text-sm text-amber-100 font-serif">
                  In Ấn Phả Đồ & Xuất PDF Trang Trọng
                </h4>
                <p className="text-[11px] text-amber-300/80">
                  Chuẩn khổ giấy A4/A3, câu đối hoành phi treo tại từ đường.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenPrint}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shrink-0 shadow-md flex items-center gap-1 active:scale-95 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / PDF</span>
            </button>
          </div>
        )}

        {/* 7. Invite & Share Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 dark:from-stone-800 dark:to-amber-950/60 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="font-bold text-xs sm:text-sm text-amber-950 dark:text-amber-200 font-serif">
              Mời Con Cháu Vào Dòng Tộc
            </h4>
            <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80">
              Chia sẻ mã gia tộc <strong className="font-mono">{tree.code}</strong> để người thân cùng xem & đóng góp.
            </p>
          </div>
          <button
            onClick={onOpenShare}
            className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold shrink-0 shadow-sm flex items-center gap-1 active:scale-95 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Mời ngay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
