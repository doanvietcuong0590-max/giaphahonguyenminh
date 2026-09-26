import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  UserPlus, 
  Upload, 
  Calendar, 
  Heart, 
  Users, 
  ShieldCheck, 
  MapPin, 
  Award,
  Sparkles,
  ChevronDown,
  PlusCircle,
  HelpCircle,
  Camera,
  Link,
  Check,
  RotateCcw,
  Image as ImageIcon,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { Member, Gender, MemberRank, RelationshipType } from '../../types';
import { getAvailableGenerations, toRoman, getGenerationTitle } from '../../utils/treeUtils';
import { compressImageFile } from '../../utils/imageUtils';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddMember: (newMember: Omit<Member, 'id'>) => void;
  initialParentId?: string;
  initialRelType?: RelationshipType;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  members,
  onAddMember,
  initialParentId,
  initialRelType = 'child',
}) => {
  if (!isOpen) return null;

  const targetRelative = members.find(m => m.id === initialParentId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [courtesyName, setCourtesyName] = useState('');
  const [tabooName, setTabooName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  
  // Calculate initial generation dynamically
  const initialGenCalculated = targetRelative 
    ? (initialRelType === 'child' ? targetRelative.generation + 1 : initialRelType === 'parent' ? Math.max(1, targetRelative.generation - 1) : targetRelative.generation)
    : 5;

  const [generation, setGeneration] = useState<number>(initialGenCalculated);
  const [isCustomGen, setIsCustomGen] = useState<boolean>(false);
  const [branch, setBranch] = useState(targetRelative ? targetRelative.branch : 'Chi Ất - Nhánh Trưởng');
  const [birthYear, setBirthYear] = useState<number | string>(1995);
  const [birthDate, setBirthDate] = useState('');
  const [isAlive, setIsAlive] = useState(true);
  const [deathYear, setDeathYear] = useState<number | string>('');
  const [lunarDeathDate, setLunarDeathDate] = useState('');
  const [burialPlace, setBurialPlace] = useState('');
  const [rank, setRank] = useState<MemberRank>('truong');
  const [selectedParentId, setSelectedParentId] = useState<string>(
    initialRelType === 'child' && initialParentId ? initialParentId : ''
  );
  const [selectedSpouseId, setSelectedSpouseId] = useState<string>(
    initialRelType === 'spouse' && initialParentId ? initialParentId : ''
  );
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profession, setProfession] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300');
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Dynamic available generations: automatically includes existing generations + future generations
  const availableGenerations = getAvailableGenerations(members);

  // Auto update generation when parent is selected
  const handleParentChange = (parentId: string) => {
    setSelectedParentId(parentId);
    if (parentId) {
      const parent = members.find(m => m.id === parentId);
      if (parent) {
        setGeneration(parent.generation + 1);
        if (parent.branch) setBranch(parent.branch);
      }
    }
  };

  // Auto update generation when spouse is selected
  const handleSpouseChange = (spouseId: string) => {
    setSelectedSpouseId(spouseId);
    if (spouseId) {
      const spouse = members.find(m => m.id === spouseId);
      if (spouse) {
        setGeneration(spouse.generation);
        if (spouse.branch) setBranch(spouse.branch);
      }
    }
  };

  const presetAvatarsMale = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
  ];

  const presetAvatarsFemale = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
  ];

  const currentPresets = gender === 'female' ? presetAvatarsFemale : presetAvatarsMale;

  // Handle uploading avatar from computer/device with image compression
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
      console.error(err);
      alert('Không thể nén tệp ảnh này.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Drag & drop file
  const handleDropFile = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      try {
        const compressed = await compressImageFile(file, 350, 0.85);
        setAvatarUrl(compressed);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setAvatarUrl(customUrl.trim());
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  const autoGenerateUsername = () => {
    if (!fullName.trim()) return;
    const clean = fullName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .toLowerCase()
      .trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return;
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(p => p[0]).join('');
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    setUsername(`${lastName}${initials}${randomSuffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const parentIds = selectedParentId ? [selectedParentId] : [];
    const spouseIds = selectedSpouseId ? [selectedSpouseId] : [];
    const finalGen = Math.max(1, Number(generation) || 1);

    onAddMember({
      fullName: fullName.trim(),
      courtesyName: courtesyName.trim() || undefined,
      tabooName: tabooName.trim() || undefined,
      gender,
      generation: finalGen,
      branch,
      birthDate: birthDate || undefined,
      birthYear: birthYear || 1990,
      deathDate: !isAlive ? (deathYear ? `${deathYear}` : undefined) : undefined,
      deathYear: !isAlive ? deathYear : undefined,
      lunarDeathDate: !isAlive && lunarDeathDate ? lunarDeathDate : undefined,
      isAlive,
      spouseIds,
      parentIds,
      childIds: [],
      avatarUrl,
      bio: bio.trim() || undefined,
      burialPlace: !isAlive && burialPlace.trim() ? burialPlace.trim() : undefined,
      rank,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      username: username.trim().toLowerCase() || undefined,
      password: password.trim() || undefined,
      address: address.trim() || undefined,
      profession: profession.trim() || undefined,
      generationTitle: getGenerationTitle(finalGen),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-50 flex items-center justify-between border-b border-amber-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-600/40 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif text-amber-100">
                Thêm Thành Viên Vào Gia Phả
              </h3>
              {targetRelative && (
                <p className="text-[11px] text-amber-300/80 truncate">
                  Quan hệ: {initialRelType === 'child' ? 'Con của' : initialRelType === 'spouse' ? 'Phối ngẫu của' : 'Thân phụ/mẫu của'} {targetRelative.fullName} (Đời {targetRelative.generation})
                </p>
              )}
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Avatar Selector Section */}
          <div className="p-3.5 rounded-2xl bg-stone-100/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Ảnh đại diện thành viên</span>
              </label>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                Tải ảnh hoặc chọn mẫu
              </span>
            </div>

            {/* Avatar Preview & Main Action */}
            <div className="flex items-center gap-4">
              {/* Preview Circle with Drop Area */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDropFile}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all flex items-center justify-center bg-stone-200 dark:bg-stone-700 ${
                  isDragOver 
                    ? 'border-amber-500 ring-4 ring-amber-400/40 scale-105' 
                    : 'border-amber-600/60 dark:border-amber-500/60 shadow-md'
                }`}
                title="Nhấn để tải ảnh từ máy tính hoặc kéo thả ảnh vào đây"
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Member Avatar Preview" 
                    referrerPolicy="no-referrer" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-stone-400" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-semibold gap-0.5">
                  <Upload className="w-4 h-4" />
                  <span>Đổi ảnh</span>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Upload Action Buttons */}
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn ảnh từ máy tính</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Link className="w-3.5 h-3.5 text-stone-500" />
                    <span>{showUrlInput ? 'Đóng link' : 'Chèn link'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                  Hỗ trợ định dạng JPG, PNG, WEBP. Kéo & thả trực tiếp vào ô ảnh.
                </p>
              </div>
            </div>

            {/* URL input field if opened */}
            {showUrlInput && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="url"
                  placeholder="Dán đường dẫn ảnh trực tuyến (https://...)"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  disabled={!customUrl.trim()}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold shrink-0"
                >
                  Áp dụng
                </button>
              </div>
            )}

            {/* Preset Avatars Carousel */}
            <div className="space-y-1 pt-1 border-t border-stone-200/70 dark:border-stone-700/60">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 block">
                Hoặc chọn ảnh chân dung mẫu:
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                {currentPresets.map((url, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setAvatarUrl(url)}
                    className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      avatarUrl === url
                        ? 'border-amber-600 ring-2 ring-amber-400 scale-105 shadow-sm'
                        : 'border-stone-200 dark:border-stone-700 opacity-70 hover:opacity-100 hover:scale-102'
                    }`}
                  >
                    <img src={url} alt="Preset avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    {avatarUrl === url && (
                      <div className="absolute inset-0 bg-amber-900/30 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Nguyễn Văn Bảo"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Courtesy Name & Taboo Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                Tên tự (Tên chữ)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Đức Thành"
                value={courtesyName}
                onChange={(e) => setCourtesyName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                Tên húy
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Phúc An"
                value={tabooName}
                onChange={(e) => setTabooName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Gender & Status & Rank */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Đời thứ</label>
                <button
                  type="button"
                  onClick={() => setIsCustomGen(!isCustomGen)}
                  className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline"
                >
                  {isCustomGen ? 'Chọn từ danh sách' : 'Tùy chỉnh số'}
                </button>
              </div>

              {!isCustomGen ? (
                <select
                  value={generation}
                  onChange={(e) => setGeneration(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  {availableGenerations.map(g => (
                    <option key={g} value={g}>
                      Đời {g} ({toRoman(g)})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Nhập số đời (VD: 8, 9, 12...)"
                  value={generation}
                  onChange={(e) => setGeneration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-amber-400 rounded-xl text-xs text-stone-900 dark:text-stone-100 font-bold focus:outline-none"
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Vai vế</label>
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as MemberRank)}
                className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="truong">Trưởng</option>
                <option value="thu">Thứ</option>
                <option value="dau">Dâu</option>
                <option value="re">Rể</option>
              </select>
            </div>
          </div>

          {/* Life Status (Alive / Deceased) */}
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-stone-800/80 border border-amber-200 dark:border-stone-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                Tình trạng hiện tại:
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="radio"
                    name="isAlive"
                    checked={isAlive}
                    onChange={() => setIsAlive(true)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>🟢 Còn sống</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                  <input
                    type="radio"
                    name="isAlive"
                    checked={!isAlive}
                    onChange={() => setIsAlive(false)}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>⚪ Đã khuất</span>
                </label>
              </div>
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-0.5">
                  Năm sinh
                </label>
                <input
                  type="number"
                  placeholder="1990"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                />
              </div>

              {!isAlive ? (
                <div>
                  <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-0.5">
                    Năm mất
                  </label>
                  <input
                    type="number"
                    placeholder="2010"
                    value={deathYear}
                    onChange={(e) => setDeathYear(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-0.5">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="0988..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>

            {!isAlive && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="text-[11px] text-red-600 dark:text-red-400 font-semibold block mb-0.5">
                    Ngày giỗ âm lịch
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 15 tháng 03 ÂL"
                    value={lunarDeathDate}
                    onChange={(e) => setLunarDeathDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-red-200 dark:border-red-900/50 rounded-lg text-xs text-red-700 dark:text-red-300 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-600 dark:text-stone-400 block mb-0.5">
                    Nơi an táng / Mộ phần
                  </label>
                  <input
                    type="text"
                    placeholder="Khu lăng mộ tổ..."
                    value={burialPlace}
                    onChange={(e) => setBurialPlace(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Account & Login Section (for living members) */}
          {isAlive && (
            <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Tài khoản & Tên đăng nhập của thành viên</span>
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-200/70 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300">
                  Dành cho con cháu đăng nhập
                </span>
              </div>

              {/* Tên đăng nhập (Username) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tên đăng nhập (Username)</span>
                  </label>
                  <button
                    type="button"
                    onClick={autoGenerateUsername}
                    className="text-[10.5px] text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                    title="Tự động tạo tên đăng nhập từ họ tên"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Tạo từ họ tên</span>
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-stone-400 text-xs">@</span>
                  <input
                    type="text"
                    placeholder="ví dụ: namnguyen, tuandung, cuongdv..."
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full pl-7 pr-3 py-2 bg-white dark:bg-stone-800 border border-amber-300/80 dark:border-amber-800/80 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">
                  Thành viên có thể dùng Tên đăng nhập này để đăng nhập vào ứng dụng gia phả.
                </p>
              </div>

              {/* Mật khẩu đăng nhập */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mật khẩu đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.floor(1000 + Math.random() * 9000);
                      setPassword(`GiaPha@${rand}`);
                      setShowPassword(true);
                    }}
                    className="text-[10.5px] text-amber-700 dark:text-amber-300 hover:underline flex items-center gap-1 font-semibold"
                    title="Tạo mật khẩu tự động"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Tạo ngẫu nhiên</span>
                  </button>
                </div>

                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu (ví dụ: GiaPha@2026)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 bg-white dark:bg-stone-800 border border-amber-300/80 dark:border-amber-800/80 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Email thành viên */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>Email nhận tin tức dòng họ (nếu có)</span>
                </label>
                <input
                  type="email"
                  placeholder="thanhvien@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-amber-300/80 dark:border-amber-800/80 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Relatives selector (Parent / Spouse) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <span>Thân phụ / Thân mẫu (Cha Mẹ)</span>
                {selectedParentId && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">
                    Tự động tạo đời sau
                  </span>
                )}
              </label>
              <select
                value={selectedParentId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Không chọn / Khởi tổ --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} (Đời {m.generation} - {m.branch})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Phối ngẫu (Vợ / Chồng)
              </label>
              <select
                value={selectedSpouseId}
                onChange={(e) => handleSpouseChange(e.target.value)}
                className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Chưa có / Không chọn --</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} (Đời {m.generation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Profession & Address */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Nghề nghiệp</label>
              <input
                type="text"
                placeholder="Bác sĩ, Kỹ sư..."
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Chi phái / Nhánh</label>
              <input
                type="text"
                placeholder="Chi Ất - Nhánh Trưởng"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Tiểu sử & Công đức dòng họ
            </label>
            <textarea
              rows={3}
              placeholder="Ghi chép công tích, đức hạnh, học vấn hoặc kỷ niệm đáng nhớ..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Lưu vào gia phả</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
