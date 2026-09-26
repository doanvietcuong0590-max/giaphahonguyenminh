import React, { useState } from 'react';
import { 
  Bell, 
  Flame, 
  Image as ImageIcon, 
  UserPlus, 
  Info, 
  Check, 
  ChevronRight, 
  Clock,
  Trash2
} from 'lucide-react';
import { NotificationItem, ScreenType } from '../types';

interface NotificationsScreenProps {
  notifications: NotificationItem[];
  onSelectNotification: (item: NotificationItem) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications,
  onSelectNotification,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'event' | 'memory' | 'member'>('all');

  const filteredNotifs = notifications.filter((item) => {
    if (filter === 'unread') return !item.isRead;
    if (filter === 'event') return item.type === 'event';
    if (filter === 'memory') return item.type === 'memory';
    if (filter === 'member') return item.type === 'member';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Flame className="w-4 h-4 text-red-500 fill-red-500" />;
      case 'memory':
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'member':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="pb-32 sm:pb-36">
      {/* Top Header */}
      <div className="bg-stone-900 text-stone-100 px-4 py-3 border-b border-stone-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base font-serif text-amber-200">
              Thông Báo Dòng Họ
            </h2>
            <p className="text-xs text-stone-400">
              Nhắc nhở ngày giỗ, tin tức họp mặt và tương tác từ con cháu
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onMarkAllAsRead}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold flex items-center gap-1 border border-stone-700"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Đã đọc hết</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              filter === 'all' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            Tất cả ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              filter === 'unread' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            Chưa đọc ({notifications.filter(n => !n.isRead).length})
          </button>
          <button
            onClick={() => setFilter('event')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              filter === 'event' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            Tế giỗ
          </button>
          <button
            onClick={() => setFilter('memory')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              filter === 'memory' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            Kỷ niệm
          </button>
          <button
            onClick={() => setFilter('member')}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              filter === 'member' ? 'bg-amber-600 text-white font-semibold' : 'bg-stone-800 text-stone-300'
            }`}
          >
            Thành viên
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 mt-4 space-y-2">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 dark:bg-stone-700 text-stone-400 flex items-center justify-center mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">Không có thông báo nào</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Bạn đã xem hết các thông báo và nhắc nhở từ dòng tộc.
            </p>
          </div>
        ) : (
          filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectNotification(item)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group ${
                item.isRead
                  ? 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700/80 hover:border-amber-500'
                  : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-sm'
              }`}
            >
              <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-900 shrink-0 mt-0.5 border border-stone-200 dark:border-stone-700">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs sm:text-sm font-bold truncate ${item.isRead ? 'text-stone-900 dark:text-stone-100' : 'text-amber-950 dark:text-amber-200'}`}>
                    {item.title}
                  </h4>
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                  )}
                </div>

                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                  {item.message}
                </p>

                <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 mt-2 pt-1 border-t border-stone-100 dark:border-stone-700/50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.timestamp}</span>
                  </span>
                  <span className="text-amber-700 dark:text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Xem <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
