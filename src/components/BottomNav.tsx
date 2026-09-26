import React from 'react';
import { Home, GitFork, Users, Image, User } from 'lucide-react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    {
      id: 'home' as ScreenType,
      label: 'Trang chủ',
      icon: Home,
      isActive: currentScreen === 'home' || currentScreen === 'home_empty',
    },
    {
      id: 'tree' as ScreenType,
      label: 'Gia phả',
      icon: GitFork,
      isActive: currentScreen === 'tree',
    },
    {
      id: 'members' as ScreenType,
      label: 'Thành viên',
      icon: Users,
      isActive: currentScreen === 'members' || currentScreen === 'member_detail',
    },
    {
      id: 'memories' as ScreenType,
      label: 'Kỷ niệm',
      icon: Image,
      isActive: currentScreen === 'memories' || currentScreen === 'memory_detail',
    },
    {
      id: 'profile' as ScreenType,
      label: 'Cá nhân',
      icon: User,
      isActive: currentScreen === 'profile' || currentScreen === 'settings' || currentScreen === 'manage_members',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-2xl px-2 py-1.5 max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
                item.isActive
                  ? 'text-amber-800 dark:text-amber-400 font-semibold'
                  : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
              }`}
            >
              <div className={`relative p-1 rounded-lg transition-transform ${item.isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon className={`w-5 h-5 ${item.isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-700 dark:bg-amber-400 rounded-full" />
                )}
              </div>
              <span className="text-[10.5px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
