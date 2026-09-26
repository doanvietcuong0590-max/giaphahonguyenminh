import React from 'react';
import { 
  Bell, 
  Search, 
  Share2, 
  ChevronDown, 
  Sparkles, 
  Layers
} from 'lucide-react';
import { GenealogyTree, ScreenType } from '../types';

interface HeaderProps {
  tree: GenealogyTree;
  unreadCount?: number;
  unreadNotifsCount?: number;
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onOpenShare?: () => void;
  onOpenTreeMenu?: () => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenTreeSelector?: () => void;
  isDbConnected?: boolean;
  isDbSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  tree,
  unreadCount = 0,
  unreadNotifsCount = 0,
  currentScreen,
  onNavigate,
  onOpenShare,
  onOpenTreeMenu,
  onOpenSearch,
  onOpenNotifications,
  onOpenTreeSelector,
  isDbConnected = false,
  isDbSyncing = false,
}) => {
  const actualUnread = unreadNotifsCount || unreadCount;
  const handleOpenShare = onOpenShare || onOpenTreeMenu || (() => {});
  const handleOpenNotifs = onOpenNotifications || (() => onNavigate('notifications'));
  const handleOpenSearch = onOpenSearch || (() => onNavigate('members'));
  const handleOpenTreeSelector = onOpenTreeSelector || onOpenTreeMenu || (() => {});

  return (
    <header className="sticky top-0 z-30 h-14 bg-amber-950 text-amber-50 border-b border-amber-900/60 shadow-md">
      <div className="h-full px-4 flex items-center justify-between gap-2">
        {/* Left: Clan info / Tree Switcher */}
        <div 
          onClick={handleOpenTreeSelector}
          className="flex items-center gap-2.5 cursor-pointer group flex-1 min-w-0 pr-2"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-sm shrink-0 flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-stone-900 flex items-center justify-center text-amber-300 font-bold text-xs font-serif">
              {tree.avatarUrl ? (
                <img
                  src={tree.avatarUrl}
                  alt={tree.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{tree.name.slice(0, 2).toUpperCase()}</span>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm sm:text-base text-amber-100 truncate group-hover:text-amber-300 transition-colors font-serif">
                {tree.name}
              </h1>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:translate-y-0.5 transition-transform" />
              {isDbConnected && (
                <span 
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[9px] font-semibold tracking-tight shrink-0"
                  title="Đã kết nối và lưu dữ liệu trên Cloud Database (Firestore)"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Cloud DB</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-300/80 truncate flex items-center gap-1">
              <span>{tree.branchName || tree.branch || 'Chính Chi'}</span>
              <span>•</span>
              <span className="text-amber-400 font-medium">{tree.generationCount} đời ({tree.memberCount || tree.totalMembers || 0} người)</span>
              {isDbSyncing && (
                <span className="text-[10px] text-amber-300 animate-pulse font-medium ml-1">
                  (Đang lưu Cloud...)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Actions (Search, Share, Notifications) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            onClick={handleOpenSearch}
            className="p-2 rounded-full hover:bg-amber-900/50 text-amber-200 hover:text-white transition-colors active:scale-95"
            title="Tìm kiếm thành viên"
            aria-label="Tìm kiếm"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenShare}
            className="p-2 rounded-full hover:bg-amber-900/50 text-amber-200 hover:text-white transition-colors active:scale-95"
            title="Mời người thân & Chia sẻ gia phả"
            aria-label="Chia sẻ"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleOpenNotifs}
            className={`p-2 rounded-full hover:bg-amber-900/50 transition-colors relative active:scale-95 ${
              currentScreen === 'notifications' ? 'bg-amber-800/80 text-amber-200' : 'text-amber-200 hover:text-white'
            }`}
            title="Thông báo dòng họ"
            aria-label="Thông báo"
          >
            <Bell className="w-4 h-4" />
            {actualUnread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center ring-2 ring-stone-900 animate-pulse">
                {actualUnread}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
