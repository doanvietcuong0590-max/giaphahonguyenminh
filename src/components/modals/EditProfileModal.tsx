import React, { useState, useRef } from 'react';
import { 
  X, 
  Save, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Camera, 
  Upload, 
  Check, 
  ShieldCheck,
  AlertCircle,
  AtSign
} from 'lucide-react';
import { UserProfile } from '../../types';
import { compressImageFile } from '../../utils/imageUtils';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (updatedProfile: Partial<UserProfile>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user.fullName || '');
  const [username, setUsername] = useState(user.username || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [branch, setBranch] = useState(user.branch || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp tin hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)!');
      return;
    }

    setIsUploading(true);
    try {
      const compressed = await compressImageFile(file, 350, 0.85);
      setAvatarUrl(compressed);
    } catch (err) {
      console.error('Lỗi nén ảnh avatar:', err);
      alert('Có lỗi khi xử lý ảnh.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleGenerateRandomPassword = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const generated = `GiaPha@${rand}`;
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowNewPass(true);
    setShowConfirmPass(true);
    setPasswordError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!fullName.trim()) {
      alert('Vui lòng nhập họ và tên!');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    const updatedData: Partial<UserProfile> = {
      fullName: fullName.trim(),
      username: cleanUsername || undefined,
      phone: phone.trim(),
      email: email.trim(),
      branch: branch.trim(),
      avatarUrl,
    };

    // If changing password or entering new password
    if (isChangingPassword || newPassword) {
      // Check current password if user already has one
      if (user.password && currentPasswordInput !== user.password) {
        setPasswordError('Mật khẩu hiện tại không chính xác!');
        return;
      }

      if (newPassword.length < 4) {
        setPasswordError('Mật khẩu mới phải có ít nhất 4 ký tự!');
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('Xác nhận mật khẩu mới không khớp!');
        return;
      }

      updatedData.password = newPassword;
    }

    onSaveProfile(updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-50 flex items-center justify-between border-b border-amber-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-600/40 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif text-amber-100">
                Sửa Thông Tin Cá Nhân & Đổi Mật Khẩu
              </h3>
              <p className="text-[11px] text-amber-300/80">
                Cập nhật hồ sơ tài khoản và mật khẩu bảo mật
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Avatar Section */}
          <div className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Ảnh đại diện cá nhân</span>
              </label>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                Bấm vào ảnh để tải ảnh mới
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer w-16 h-16 rounded-full overflow-hidden border-2 border-amber-500 shadow-md shrink-0 bg-stone-200 dark:bg-stone-700"
                title="Nhấn để tải ảnh từ máy tính"
              >
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'}
                  alt={fullName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-semibold gap-0.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Đổi</span>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-medium text-stone-700 dark:text-stone-300">
                  Chọn ảnh mẫu nhanh:
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatarUrl(preset)}
                      className={`w-7 h-7 rounded-full overflow-hidden border transition-all ${
                        avatarUrl === preset
                          ? 'border-amber-500 ring-2 ring-amber-400 scale-110'
                          : 'border-stone-300 dark:border-stone-600 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Basic Info Fields */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 absolute left-3 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn Tuấn Dũng"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Tên đăng nhập (Username)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-stone-400 font-mono text-xs">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="tuandung"
                    className="w-full pl-7 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Số điện thoại
                </label>
                <div className="relative flex items-center">
                  <Phone className="w-4 h-4 absolute left-3 text-stone-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0988 776 655"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Email liên hệ
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                Chi phái / Nhánh trong gia phả
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Chi Ất - Nhánh Trưởng"
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Password Change Section */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-stone-800/90 border border-amber-300/70 dark:border-amber-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-amber-200/80 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  <KeyRound className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs">
                    Đổi Mật Khẩu Tài Khoản
                  </h4>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">
                    {user.password ? 'Tài khoản đã có mật khẩu' : 'Chưa thiết lập mật khẩu'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(!isChangingPassword);
                  setPasswordError('');
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all"
              >
                {isChangingPassword ? 'Hủy đổi mật khẩu' : 'Đổi mật khẩu'}
              </button>
            </div>

            {isChangingPassword && (
              <div className="space-y-3 pt-2 border-t border-amber-200/80 dark:border-stone-700">
                {/* Error Banner */}
                {passwordError && (
                  <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {/* Current password if user has one */}
                {user.password && (
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                      Mật khẩu hiện tại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại..."
                        className="w-full pr-10 pl-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-2.5 text-stone-400 hover:text-stone-600"
                      >
                        {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* New Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPassword}
                      className="text-[10px] text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Tạo ngẫu nhiên</span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full pr-10 pl-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Nhập lại mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError('');
                      }}
                      placeholder="Xác nhận lại mật khẩu mới..."
                      className="w-full pr-10 pl-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-2.5 text-stone-400 hover:text-stone-600"
                    >
                      {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white shadow-md flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
