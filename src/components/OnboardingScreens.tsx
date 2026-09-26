import React, { useState } from 'react';
import { 
  GitFork, 
  Users, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Phone, 
  User, 
  Eye, 
  EyeOff,
  ChevronLeft,
  AtSign,
  AlertCircle,
  RefreshCw,
  KeyRound
} from 'lucide-react';
import { Member, ScreenType } from '../types';

interface OnboardingScreensProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onCompleteAuth: (name: string, phone: string, email: string, username?: string, matchedMember?: Member) => void;
  members?: Member[];
}

export const OnboardingScreens: React.FC<OnboardingScreensProps> = ({
  currentScreen,
  onNavigate,
  onCompleteAuth,
  members = [],
}) => {
  // Login form state - supports username, phone, or email
  const [loginIdentifier, setLoginIdentifier] = useState('tuandung');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('Nguyễn Văn Tuấn Dũng');
  const [regUsername, setRegUsername] = useState('tuandung');
  const [regPhone, setRegPhone] = useState('0988 776 655');
  const [regEmail, setRegEmail] = useState('tuandung.nguyen@gmail.com');
  const [regPassword, setRegPassword] = useState('123456');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Helper to generate username from name
  const generateUsernameFromName = (nameStr: string) => {
    if (!nameStr.trim()) return '';
    const clean = nameStr
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '';
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(p => p[0]).join('');
    return `${lastName}${initials}`;
  };

  // 1. Splash Screen
  if (currentScreen === 'splash') {
    return (
      <div 
        onClick={() => onNavigate('onboarding_1')}
        className="min-h-[85vh] flex flex-col items-center justify-between p-6 bg-gradient-to-b from-amber-950 via-stone-900 to-black text-amber-50 cursor-pointer select-none"
      >
        <div className="w-full" />
        
        <div className="flex flex-col items-center text-center space-y-4 max-w-xs animate-fade-in">
          {/* Royal Logo Icon */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-1 shadow-2xl animate-pulse">
            <div className="w-full h-full rounded-[22px] bg-stone-900 flex items-center justify-center text-amber-400">
              <GitFork className="w-12 h-12 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold font-serif text-amber-100 tracking-wider">
              CỘI NGUỒN
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-amber-400 font-medium">
              Gia Phả & Kỷ Niệm Gia Tộc
            </p>
          </div>

          <p className="text-xs text-amber-200/80 italic font-serif pt-2 border-t border-amber-900/60 leading-relaxed">
            "Cây có gốc mới nở ngành xanh ngọn,<br/>Nước có nguồn mới bể rộng sông sâu."
          </p>
        </div>

        <div className="w-full text-center space-y-2 pb-4">
          <p className="text-[11px] text-amber-400/80 animate-bounce">
            Chạm vào màn hình để bắt đầu
          </p>
          <div className="flex justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Onboarding 1: Lưu Giữ Cội Nguồn
  if (currentScreen === 'onboarding_1') {
    return (
      <div className="min-h-[85vh] flex flex-col justify-between p-6 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
        <div className="flex justify-end">
          <button
            onClick={() => onNavigate('get_started')}
            className="text-xs font-semibold text-stone-400 hover:text-amber-600 dark:hover:text-amber-400"
          >
            Bỏ qua
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-6 max-w-sm mx-auto">
          <div className="relative w-64 h-64 rounded-3xl overflow-hidden bg-gradient-to-b from-amber-100 to-amber-50 dark:from-stone-800 dark:to-stone-900 border border-amber-200 dark:border-stone-700 flex items-center justify-center p-6 shadow-lg">
            <div className="w-28 h-28 rounded-full bg-amber-700 text-white flex items-center justify-center shadow-xl">
              <GitFork className="w-16 h-16 stroke-[2.5]" />
            </div>
            <div className="absolute top-4 right-4 p-2 rounded-xl bg-amber-600 text-white shadow">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-amber-950 dark:text-amber-200">
              Lưu Giữ Cội Nguồn
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Số hóa gia phả, phân định từng thế hệ rõ ràng, lưu giữ công đức tổ tông cho con cháu muôn đời sau mãi khắc ghi.
            </p>
          </div>

          {/* Dots indicator */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-2 rounded-full bg-amber-600" />
            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700" />
          </div>
        </div>

        <button
          onClick={() => onNavigate('onboarding_2')}
          className="w-full py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 3. Onboarding 2: Kết Nối Các Thế Hệ
  if (currentScreen === 'onboarding_2') {
    return (
      <div className="min-h-[85vh] flex flex-col justify-between p-6 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
        <div className="flex justify-between items-center">
          <button
            onClick={() => onNavigate('onboarding_1')}
            className="text-xs text-stone-400 hover:text-stone-600"
          >
            Quay lại
          </button>
          <button
            onClick={() => onNavigate('get_started')}
            className="text-xs font-semibold text-stone-400 hover:text-amber-600"
          >
            Bỏ qua
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-6 max-w-sm mx-auto">
          <div className="relative w-64 h-64 rounded-3xl overflow-hidden bg-gradient-to-b from-amber-100 to-amber-50 dark:from-stone-800 dark:to-stone-900 border border-amber-200 dark:border-stone-700 flex items-center justify-center p-6 shadow-lg">
            <div className="w-28 h-28 rounded-full bg-red-700 text-white flex items-center justify-center shadow-xl">
              <Users className="w-16 h-16 stroke-[2.5]" />
            </div>
            <div className="absolute top-4 left-4 p-2 rounded-xl bg-amber-600 text-white shadow">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-amber-950 dark:text-amber-200">
              Kết Nối Các Thế Hệ
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Gắn kết mọi con cháu trong dòng tộc ở khắp bốn phương, nhận biết thứ bậc vai vế, cùng nhau hướng về nguồn cội.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="w-6 h-2 rounded-full bg-amber-600" />
            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700" />
          </div>
        </div>

        <button
          onClick={() => onNavigate('onboarding_3')}
          className="w-full py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 4. Onboarding 3: Lưu Giữ Những Câu Chuyện
  if (currentScreen === 'onboarding_3') {
    return (
      <div className="min-h-[85vh] flex flex-col justify-between p-6 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100">
        <div className="flex justify-between items-center">
          <button
            onClick={() => onNavigate('onboarding_2')}
            className="text-xs text-stone-400 hover:text-stone-600"
          >
            Quay lại
          </button>
          <div />
        </div>

        <div className="flex flex-col items-center text-center space-y-6 max-w-sm mx-auto">
          <div className="relative w-64 h-64 rounded-3xl overflow-hidden bg-gradient-to-b from-amber-100 to-amber-50 dark:from-stone-800 dark:to-stone-900 border border-amber-200 dark:border-stone-700 flex items-center justify-center p-6 shadow-lg">
            <div className="w-28 h-28 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center shadow-xl border-2 border-amber-500">
              <BookOpen className="w-16 h-16 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-serif text-amber-950 dark:text-amber-200">
              Lưu Giữ Những Câu Chuyện
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Lưu lại những tấm ảnh sum vầy, câu chuyện cảm động, sự kiện họp mặt và ngày giỗ tổ trang trọng của dòng họ.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="w-2 h-2 rounded-full bg-stone-300 dark:bg-stone-700" />
            <span className="w-6 h-2 rounded-full bg-amber-600" />
          </div>
        </div>

        <button
          onClick={() => onNavigate('get_started')}
          className="w-full py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <span>Bắt đầu ngay</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // 5. Get Started Welcome Screen (b_t_u_v_i_c_i_ngu_n)
  if (currentScreen === 'get_started') {
    return (
      <div className="min-h-[85vh] flex flex-col justify-between p-6 bg-gradient-to-b from-stone-900 via-amber-950 to-stone-950 text-white">
        <div className="pt-8 text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-2xl">
            <div className="w-full h-full rounded-[22px] bg-stone-900 flex items-center justify-center text-amber-400">
              <GitFork className="w-10 h-10 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-amber-100">
              Bắt Đầu Với Cội Nguồn
            </h2>
            <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-xs mx-auto">
              Nền tảng quản lý gia phả và kết nối dòng họ hàng đầu Việt Nam
            </p>
          </div>
        </div>

        <div className="space-y-3 max-w-sm w-full mx-auto">
          <button
            onClick={() => onNavigate('login')}
            className="w-full py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
          >
            Đăng nhập tài khoản
          </button>

          <button
            onClick={() => onNavigate('register')}
            className="w-full py-3.5 rounded-2xl bg-stone-800/80 hover:bg-stone-800 text-amber-200 font-bold text-sm border border-amber-800/50 shadow-md active:scale-95 transition-all"
          >
            Đăng ký thành viên mới
          </button>

          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-xs text-amber-400/90 hover:underline inline-flex items-center gap-1"
            >
              <span>Vào thẳng trang chủ khám phá</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="text-center text-[11px] text-stone-500">
          Cội Nguồn Heritage System • Phiên bản 2026
        </div>
      </div>
    );
  }

  // 6. Login Screen (ng_nh_p_c_i_ngu_n)
  if (currentScreen === 'login') {
    const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setLoginError('');

      const rawInput = loginIdentifier.trim();
      if (!rawInput) {
        setLoginError('Vui lòng nhập Tên đăng nhập, Số điện thoại hoặc Email!');
        return;
      }

      const cleanInput = rawInput.toLowerCase().replace(/^@/, '');

      // Check if matches a member in the clan
      const matched = members.find(m => {
        const uMatch = m.username && m.username.toLowerCase() === cleanInput;
        const pMatch = m.phone && m.phone.replace(/[\s.-]/g, '') === rawInput.replace(/[\s.-]/g, '');
        const eMatch = m.email && m.email.toLowerCase() === cleanInput;
        return uMatch || pMatch || eMatch;
      });

      if (matched) {
        // If member has password set, verify it
        if (matched.password && matched.password.trim()) {
          if (loginPassword !== matched.password) {
            setLoginError(`Mật khẩu không đúng cho tài khoản @${matched.username || matched.fullName}. Vui lòng thử lại!`);
            return;
          }
        }
        onCompleteAuth(matched.fullName, matched.phone || '', matched.email || '', matched.username, matched);
      } else {
        // Allow login with entered credentials
        const fallbackName = rawInput.startsWith('0') || /^\d+$/.test(rawInput) ? `Thành viên ${rawInput.slice(-4)}` : rawInput;
        const isEmail = rawInput.includes('@');
        onCompleteAuth(
          fallbackName,
          isEmail ? '' : rawInput,
          isEmail ? rawInput : '',
          cleanInput
        );
      }
    };

    return (
      <div className="min-h-[85vh] p-6 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col justify-between max-w-md mx-auto">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('get_started')}
              className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-base font-serif">Đăng Nhập Gia Phả</h3>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold font-serif text-amber-950 dark:text-amber-200">
              Chào mừng trở lại
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Đăng nhập bằng Tên đăng nhập (Username), Số điện thoại hoặc Email
            </p>
          </div>

          {/* Quick Demo Logins Pill Box */}
          <div className="p-3 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-amber-950 dark:text-amber-200">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Tài khoản mẫu thử nghiệm:</span>
              </span>
              <span className="text-[10px] text-amber-700/80 dark:text-amber-400">MK: 123456</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier('tuandung');
                  setLoginPassword('123456');
                  setLoginError('');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  loginIdentifier === 'tuandung'
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 border border-amber-300/80 hover:bg-amber-100/70'
                }`}
              >
                👑 @tuandung (Admin)
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier('cuongdv');
                  setLoginPassword('123456');
                  setLoginError('');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                  loginIdentifier === 'cuongdv'
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'bg-white dark:bg-stone-800 text-amber-900 dark:text-amber-200 border border-amber-300/80 hover:bg-amber-100/70'
                }`}
              >
                👤 @cuongdv (Thành viên)
              </button>
            </div>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Tên đăng nhập / SĐT / Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <span>Tên đăng nhập (Username) / SĐT / Email</span>
                <span className="text-[10px] text-amber-600 font-normal">Hỗ trợ viết liền @</span>
              </label>
              <div className="relative">
                <AtSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => {
                    setLoginIdentifier(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="tuandung hoặc 0988 776 655..."
                  className="w-full pl-9 pr-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-medium"
                  required
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Mật khẩu
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Thông tin tài khoản đã được hỗ trợ. Vui lòng liên hệ Trưởng ban quản trị họ tộc để cấp lại mật khẩu!`);
                  }}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    setLoginError('');
                  }}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-9 pr-10 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm shadow-md active:scale-95 transition-all mt-2 flex items-center justify-center gap-2"
            >
              <span>Đăng nhập</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="pt-6 text-center text-xs text-stone-500">
          Chưa có tài khoản?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
          >
            Đăng ký ngay
          </button>
        </div>
      </div>
    );
  }

  // 7. Register Screen (t_o_t_i_kho_n_c_i_ngu_n)
  if (currentScreen === 'register') {
    return (
      <div className="min-h-[85vh] p-6 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 flex flex-col justify-between max-w-md mx-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('get_started')}
              className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-base font-serif">Đăng Ký Tài Khoản</h3>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-950 dark:text-amber-200">
              Tạo tài khoản Cội Nguồn
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Nhập tên đăng nhập và thông tin cá nhân để tham gia hoặc tạo mới phả đồ
            </p>
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const cleanUsername = regUsername.trim().toLowerCase().replace(/^@/, '');
              onCompleteAuth(regName, regPhone, regEmail, cleanUsername);
            }}
            className="space-y-3"
          >
            {/* Họ và tên */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Họ và tên đầy đủ
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (!regUsername || regUsername === 'tuandung') {
                      setRegUsername(generateUsernameFromName(e.target.value));
                    }
                  }}
                  placeholder="Ví dụ: Nguyễn Văn Tuấn Dũng"
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Tên đăng nhập (Username) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <AtSign className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tên đăng nhập (Username)</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const generated = generateUsernameFromName(regName);
                    if (generated) setRegUsername(generated);
                  }}
                  className="text-[10.5px] text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Tạo từ họ tên</span>
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-stone-400 text-xs">@</span>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="tuandung, namnguyen..."
                  className="w-full pl-7 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-mono font-medium"
                  required
                />
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                Dùng để đăng nhập nhanh chóng vào ứng dụng (viết liền, không dấu).
              </p>
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0988 776 655"
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="tuandung.nguyen@gmail.com"
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-9 pr-10 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="terms" className="text-[11px] text-stone-600 dark:text-stone-300 cursor-pointer">
                Tôi đồng ý với <strong>Điều khoản sử dụng</strong> & <strong>Bảo mật gia tộc</strong>
              </label>
            </div>

            <button
              type="submit"
              disabled={!agreeTerms}
              className="w-full py-3 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white font-bold text-sm shadow-md active:scale-95 transition-all mt-2"
            >
              Đăng ký & Vào ứng dụng
            </button>
          </form>
        </div>

        <div className="pt-4 text-center text-xs text-stone-500">
          Đã có tài khoản?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-amber-700 dark:text-amber-400 hover:underline"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return null;
};
