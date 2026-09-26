import React, { useState } from 'react';
import { 
  GitFork, 
  PlusCircle, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { ScreenType } from '../types';

interface EmptyHomeScreenProps {
  onOpenCreateTree: () => void;
  onJoinTreeByCode: (code: string) => void;
  onLoadSampleData: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const EmptyHomeScreen: React.FC<EmptyHomeScreenProps> = ({
  onOpenCreateTree,
  onJoinTreeByCode,
  onLoadSampleData,
  onNavigate,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMsg('Vui lòng nhập mã gia tộc');
      return;
    }
    setErrorMsg('');
    onJoinTreeByCode(inputCode.trim().toUpperCase());
  };

  return (
    <div className="p-4 sm:p-6 pb-28 space-y-6 max-w-lg mx-auto text-center">
      {/* Hero Icon */}
      <div className="pt-6 space-y-3">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-1 shadow-xl flex items-center justify-center">
          <div className="w-full h-full rounded-[22px] bg-stone-900 flex items-center justify-center text-amber-400">
            <GitFork className="w-10 h-10 stroke-[2.5]" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800">
            Cội Nguồn Heritage
          </span>
          <h2 className="text-2xl font-bold font-serif text-stone-900 dark:text-stone-100">
            Chào Mừng Đến Với Cội Nguồn
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-sm mx-auto leading-relaxed">
            Bạn chưa tạo hoặc tham gia gia phả nào. Hãy bắt đầu lưu giữ truyền thống và kết nối các thế hệ ngay hôm nay.
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="space-y-3 text-left">
        {/* Option 1: Create New Genealogy Tree */}
        <div 
          onClick={onOpenCreateTree}
          className="p-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-amber-600/60 hover:border-amber-600 shadow-md hover:shadow-lg cursor-pointer transition-all flex items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-400">
                Lập Gia Phả Mới
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Khai sinh gia phả dòng họ, chi phái, ghi chép đời Cụ Tổ
              </p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform shrink-0" />
        </div>

        {/* Option 2: Join Existing Family Tree */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                Tham Gia Bằng Mã Gia Tộc
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Nhập mã gia tộc (ví dụ: <strong className="font-mono text-amber-700 dark:text-amber-400">NGUYEN-2026</strong>)
              </p>
            </div>
          </div>

          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã 6-10 ký tự..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="flex-1 px-3 py-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-mono uppercase text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 shadow-sm active:scale-95 transition-all"
            >
              Tham gia
            </button>
          </form>
          {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
        </div>

        {/* Option 3: Load Demo Sample Data */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-stone-800/80 border border-amber-200/80 dark:border-stone-700 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <RefreshCw className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>Khám phá ngay với dữ liệu mẫu 5 đời <strong>Họ Nguyễn Chi Ất</strong></span>
          </div>
          <button
            onClick={onLoadSampleData}
            className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-semibold shrink-0 shadow-sm active:scale-95 transition-all"
          >
            Tải mẫu
          </button>
        </div>
      </div>
    </div>
  );
};
