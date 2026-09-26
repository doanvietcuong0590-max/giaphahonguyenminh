import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  ShieldCheck, 
  Download, 
  Share2, 
  Moon, 
  Sun, 
  Bell, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  BookOpen, 
  Layers, 
  PlusCircle,
  FileText,
  UserCheck,
  RefreshCw,
  Printer,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Building,
  KeyRound,
  Edit,
  Lock,
  Database,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, GenealogyTree, ScreenType } from '../types';
import { EditProfileModal } from './modals/EditProfileModal';

interface ProfileScreenProps {
  user: UserProfile;
  tree: GenealogyTree;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenCreateTree: () => void;
  onOpenManageMembers: () => void;
  onOpenShare: () => void;
  onOpenPrint: () => void;
  onOpenEditGenealogy?: () => void;
  onExportJson: () => void;
  onResetDemoData: () => void;
  onLogout: () => void;
  onUpdateUserProfile?: (updatedProfile: Partial<UserProfile>) => void;
  isDbConnected?: boolean;
  isDbSyncing?: boolean;
  onForceSyncCloud?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  tree,
  darkMode,
  onToggleDarkMode,
  onNavigate,
  onOpenCreateTree,
  onOpenManageMembers,
  onOpenShare,
  onOpenPrint,
  onOpenEditGenealogy,
  onExportJson,
  onResetDemoData,
  onLogout,
  onUpdateUserProfile,
  isDbConnected = false,
  isDbSyncing = false,
  onForceSyncCloud,
}) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const downloadAsset = async (url: string, filename: string) => {
    try {
      setDownloadingFile(filename);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        setDownloadingFile(null);
      }, 300);
    } catch (err) {
      console.warn('Tải qua Blob không thành công, mở liên kết trực tiếp:', err);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        setDownloadingFile(null);
      }, 300);
    }
  };
  return (
    <div className="pb-28 space-y-4">
      {/* Profile Header */}
      <div className="p-5 rounded-b-3xl bg-gradient-to-br from-amber-950 via-stone-900 to-amber-900 text-stone-100 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg shrink-0">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base sm:text-lg font-serif text-amber-100 truncate">
                {user.fullName}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-bold border border-amber-400/40">
                {user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {user.username && (
                <span className="font-mono text-amber-300 font-semibold bg-amber-900/70 px-2 py-0.5 rounded-md border border-amber-500/40 text-[11px]">
                  @{user.username}
                </span>
              )}
              <span className="text-xs text-amber-200/80 font-mono">{user.phone}</span>
            </div>
            <p className="text-[11px] text-amber-300/90 truncate flex items-center gap-1 mt-0.5">
              <span>{tree.name}</span>
              <span>•</span>
              <span>{user.branch}</span>
            </p>

            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="mt-2 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 active:scale-95 text-amber-200 hover:text-white text-[11px] font-semibold border border-amber-400/30 flex items-center gap-1.5 transition-all shadow-sm"
              title="Cập nhật họ tên, số điện thoại và đổi mật khẩu"
            >
              <KeyRound className="w-3 h-3 text-amber-300" />
              <span>Sửa thông tin & Đổi mật khẩu</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3.5">
        {/* Account & Security Section */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Tài Khoản Cá Nhân & Mật Khẩu
            </h3>
            {user.password ? (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" /> Đã có mật khẩu
              </span>
            ) : (
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                Chưa đặt mật khẩu
              </span>
            )}
          </div>

          <div className="space-y-1 text-xs">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="w-full p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 group-hover:scale-105 transition-transform">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block text-stone-900 dark:text-stone-100">
                    Sửa thông tin cá nhân & Đổi mật khẩu
                  </span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Cập nhật họ tên, số điện thoại, ảnh đại diện và mật khẩu đăng nhập
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Clan Logo & Genealogy Settings Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50/40 dark:from-stone-800 dark:to-amber-950/40 border-2 border-amber-300/70 dark:border-amber-900/60 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-13 h-13 rounded-2xl p-0.5 bg-gradient-to-br from-amber-400 to-amber-700 shadow-md shrink-0">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-900 border border-amber-300/30">
                {tree.avatarUrl ? (
                  <img
                    src={tree.avatarUrl}
                    alt={tree.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-amber-400 font-bold font-serif text-sm">
                    {tree.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-serif truncate">
                  {tree.name}
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 text-[9.5px] font-bold shrink-0">
                  {tree.establishedYear || 'Chính phái'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-400 truncate mt-0.5">
                {tree.branchName || tree.branch || 'Chi phái chính'} • {tree.generationCount} đời ({tree.memberCount} người)
              </p>
            </div>
          </div>

          {onOpenEditGenealogy && (
            <button
              onClick={onOpenEditGenealogy}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 shrink-0 transition-all"
              title="Đổi Logo và cập nhật cài đặt gia phả"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Đổi Logo</span>
            </button>
          )}
        </div>

        {/* Clan Management Section */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Quản Trị Gia Tộc
          </h3>

          <div className="space-y-1 text-xs">
            {onOpenEditGenealogy && (
              <button
                onClick={onOpenEditGenealogy}
                className="w-full p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold block">Cài đặt gia phả & Đổi Logo dòng họ</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">Tùy biến biểu tượng, từ đường, gia quy & quê quán</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </button>
            )}

            <button
              onClick={onOpenManageMembers}
              className="w-full p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">Quản lý & Phê duyệt thành viên</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Phân quyền, duyệt con cháu tham gia</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={onOpenShare}
              className="w-full p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">Mời người thân (Mã QR & Link)</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Mã tộc: {tree.code}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={onOpenCreateTree}
              className="w-full p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-400">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">Lập thêm chi nhánh / Gia phả mới</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Tạo cây phả đồ cho dòng họ khác</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Data & Backup Section */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Dữ Liệu & Bản In
          </h3>

          <div className="space-y-1 text-xs">
            <button
              onClick={onExportJson}
              className="w-full p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400">
                  <Download className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">Xuất dữ liệu sao lưu (JSON)</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Lưu trữ phả đồ an toàn vĩnh viễn</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>

            <button
              onClick={onOpenPrint}
              className="w-full p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                  <Printer className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">In ấn phả đồ / Xuất PDF</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Định dạng trang trọng treo tại từ đường</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Cloud Database (Firebase Firestore) Section */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-stone-50 to-teal-50/60 dark:from-stone-800 dark:via-stone-800 dark:to-emerald-950/40 border-2 border-emerald-400/80 dark:border-emerald-800/80 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Cơ Sở Dữ Liệu Đám Mây (Cloud Database)</span>
            </h3>
            {isDbConnected ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Đang Kết Nối & Lưu Trực Tuyến
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 text-[10px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Đang khởi tạo kết nối...
              </span>
            )}
          </div>

          <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
            Dữ liệu gia phả, thế hệ con cháu, bài viết kỷ niệm và mật khẩu thành viên hiện đã được kết nối trực tiếp với <span className="font-semibold text-emerald-700 dark:text-emerald-300">Google Firestore Database</span>. Khi bạn tải bản đóng gói bên dưới đưa lên <strong className="text-emerald-800 dark:text-emerald-200">Netlify Drop</strong>, toàn bộ dữ liệu vẫn được đồng bộ và lưu vĩnh viễn trên đám mây!
          </p>

          <div className="p-3 rounded-xl bg-white/80 dark:bg-stone-900/60 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">Dự án Firebase Cloud:</span>
              <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-300">planar-alchemy-g6ppv</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400">Trạng thái đồng bộ:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tự động lưu 2 chiều theo thời gian thực (Real-time)
              </span>
            </div>
            {onForceSyncCloud && (
              <div className="pt-2 border-t border-emerald-100 dark:border-stone-800 flex justify-end">
                <button
                  onClick={onForceSyncCloud}
                  disabled={isDbSyncing}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDbSyncing ? 'animate-spin' : ''}`} />
                  <span>{isDbSyncing ? 'Đang đồng bộ...' : 'Đồng bộ lại toàn bộ dữ liệu lên Cloud'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Source Code & Web Hosting Download Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-stone-50 to-blue-50/60 dark:from-stone-800 dark:via-stone-800 dark:to-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Tải Mã Nguồn Để Đưa Lên Hosting</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
              Tải Trực Tiếp
            </span>
          </div>

          <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
            Do liên kết GitHub tự động đang báo lỗi 404, bạn có thể tải trực tiếp file nén <span className="font-semibold text-indigo-600 dark:text-indigo-400">.ZIP</span> của ứng dụng về máy tính ngay bên dưới:
          </p>

          <div className="space-y-2">
            {/* Deploy ready package */}
            <button
              type="button"
              onClick={() => downloadAsset('/gia-pha-deploy-ready.zip', 'gia-pha-deploy-ready.zip')}
              disabled={downloadingFile !== null}
              className="w-full p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white flex items-center justify-between shadow-md transition-all group disabled:opacity-75 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20 text-white">
                  {downloadingFile === 'gia-pha-deploy-ready.zip' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs sm:text-sm block">1. Tải Bản Đóng Gói Sẵn (.ZIP)</span>
                  <span className="text-[11px] text-indigo-100 block">Định dạng chuẩn 1.2MB cho cả Windows & Netlify Drop. Tải về giải nén là chạy!</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* Deploy ready for Mac (ZIP with UNIX attributes) */}
            <button
              type="button"
              onClick={() => downloadAsset('/gia-pha-deploy-mac.zip', 'gia-pha-deploy-mac.zip')}
              disabled={downloadingFile !== null}
              className="w-full p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100/60 text-indigo-900 dark:text-indigo-200 flex items-center justify-between shadow-sm transition-all group disabled:opacity-75 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-600 text-white">
                  {downloadingFile === 'gia-pha-deploy-mac.zip' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block">2. Tải Bản Cho macOS (.ZIP Chuẩn Finder)</span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 block">Dành riêng cho MacBook: Định dạng Unix tương thích 100% Tiện ích lưu trữ Archive Mac</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* Alternative TAR archive for Mac */}
            <div className="flex items-center justify-end px-1">
              <button
                type="button"
                onClick={() => downloadAsset('/gia-pha-deploy-mac.tar', 'gia-pha-deploy-mac.tar')}
                disabled={downloadingFile !== null}
                className="text-[10px] text-stone-500 hover:text-indigo-600 dark:text-stone-400 dark:hover:text-indigo-300 underline cursor-pointer"
              >
                Hoặc tải bản .TAR (Không nén) cho Mac terminal nếu cần
              </button>
            </div>

            {/* Full source code */}
            <button
              type="button"
              onClick={() => downloadAsset('/gia-pha-source-code.zip', 'gia-pha-source-code.zip')}
              disabled={downloadingFile !== null}
              className="w-full p-3 rounded-xl bg-white dark:bg-stone-700/80 border border-indigo-300/80 dark:border-indigo-700/60 hover:bg-indigo-50/50 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 flex items-center justify-between shadow-sm transition-all group disabled:opacity-75 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  {downloadingFile === 'gia-pha-source-code.zip' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block">3. Tải Toàn Bộ Mã Nguồn (Source Code .ZIP)</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-300 block">Chứa toàn bộ code React + Vite + Tailwind để lập trình và sửa đổi</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>
        </div>

        {/* System Settings & Display Mode */}
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Cài Đặt Ứng Dụng
          </h3>

          <div className="space-y-1 text-xs">
            <div className="p-2.5 rounded-xl flex items-center justify-between text-stone-800 dark:text-stone-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                  {darkMode ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-amber-600" />}
                </div>
                <div>
                  <span className="font-semibold block">Giao diện tối (Dark Mode)</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Phong cách gỗ mun hoàng tộc</span>
                </div>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${darkMode ? 'bg-amber-600' : 'bg-stone-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <button
              onClick={onResetDemoData}
              className="w-full p-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/60 flex items-center justify-between transition-colors text-stone-800 dark:text-stone-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-400">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-semibold block">Khôi phục dữ liệu mẫu dòng họ</span>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">Tải lại 5 đời họ Nguyễn đầy đủ</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-400" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-semibold text-xs border border-red-200 dark:border-red-900/60 flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất / Chuyển tài khoản</span>
        </button>
      </div>

      {/* Edit Personal Profile & Change Password Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onSaveProfile={onUpdateUserProfile || (() => {})}
      />
    </div>
  );
};
