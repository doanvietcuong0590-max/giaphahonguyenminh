import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  MapPin, 
  Building, 
  User, 
  BookOpen, 
  ShieldCheck, 
  Link as LinkIcon, 
  RefreshCw,
  Trash2,
  Sliders,
  Calendar
} from 'lucide-react';
import { GenealogyTree } from '../../types';
import { compressImageFile } from '../../utils/imageUtils';

interface EditGenealogyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tree: GenealogyTree;
  onSaveTree: (updatedTree: GenealogyTree) => void;
}

// Curated Traditional Vietnamese Clan Emblems & Logos
export const PRESET_CLAN_LOGOS = [
  {
    id: 'dong-son',
    title: 'Trống Đồng Đông Sơn',
    subtitle: 'Hào khí Lạc Hồng, cội nguồn ngàn năm',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=400',
    tag: 'Cổ truyền'
  },
  {
    id: 'lotus-gold',
    title: 'Hoa Sen Ngọc Hoàng Gia',
    subtitle: 'Thanh khiết, phúc trạch truyền gia',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400',
    tag: 'Trang nhã'
  },
  {
    id: 'ancient-temple',
    title: 'Nhà Thờ Họ Cổ Kính',
    subtitle: 'Mái ngói rêu phong, tôn nghiêm từ đường',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=400',
    tag: 'Từ đường'
  },
  {
    id: 'calligraphy-phuc',
    title: 'Đại Tự Chữ Phúc Kim Son',
    subtitle: 'Phúc đức tổ tông ngàn năm thịnh',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&q=80&w=400',
    tag: 'Thư pháp'
  },
  {
    id: 'dragon-crest',
    title: 'Lưỡng Long Triều Nguyệt',
    subtitle: 'Quy tụ vượng khí, linh thiêng tôn tộc',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=400',
    tag: 'Hoàng gia'
  },
  {
    id: 'heritage-wood',
    title: 'Mộc Bản Phả Ký Chạm Khắc',
    subtitle: 'Khắc ghi bia đá, lưu truyền muôn đời',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=400',
    tag: 'Mộc bản'
  }
];

export const EditGenealogyModal: React.FC<EditGenealogyModalProps> = ({
  isOpen,
  onClose,
  tree,
  onSaveTree,
}) => {
  if (!isOpen) return null;

  // Form State initialized from current tree
  const [name, setName] = useState(tree.name || '');
  const [branchName, setBranchName] = useState(tree.branchName || tree.branch || '');
  const [avatarUrl, setAvatarUrl] = useState(tree.avatarUrl || PRESET_CLAN_LOGOS[0].url);
  const [establishedYear, setEstablishedYear] = useState(String(tree.establishedYear || ''));
  const [origin, setOrigin] = useState(tree.origin || tree.originPlace || '');
  const [ancestralHallAddress, setAncestralHallAddress] = useState(tree.ancestralHallAddress || tree.ancestralHouseAddress || '');
  const [headPerson, setHeadPerson] = useState(tree.headPerson || '');
  const [patriarchName, setPatriarchName] = useState(tree.patriarchName || '');
  const [motto, setMotto] = useState(tree.motto || tree.clanRules || '');
  const [description, setDescription] = useState(tree.description || '');
  const [code, setCode] = useState(tree.code || '');

  // Tab & Upload mode state
  const [logoTab, setLogoTab] = useState<'presets' | 'upload' | 'url'>('presets');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler (Compressed & resized image for reliable Firestore/LocalStorage saving)
  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, SVG, WEBP).');
      return;
    }
    setUploadError(null);
    setIsProcessingImage(true);
    try {
      // Tự động thu nhỏ và nén ảnh (max 400x400) giúp dung lượng siêu nhẹ (<50KB)
      // Đảm bảo không bao giờ bị lỗi vượt quá dung lượng khi lưu Cloud Firestore hoặc LocalStorage
      const compressedDataUrl = await compressImageFile(file, 400, 0.85);
      setAvatarUrl(compressedDataUrl);
    } catch (err) {
      console.error('Lỗi khi nén ảnh logo:', err);
      setUploadError('Không thể xử lý hình ảnh này. Vui lòng thử lại với ảnh khác.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (customUrlInput.trim()) {
      setAvatarUrl(customUrlInput.trim());
      setCustomUrlInput('');
    }
  };

  const handleResetToDefaultLogo = () => {
    setAvatarUrl(PRESET_CLAN_LOGOS[0].url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedTree: GenealogyTree = {
      ...tree,
      name: name.trim(),
      branch: branchName.trim(),
      branchName: branchName.trim(),
      avatarUrl: avatarUrl.trim() || PRESET_CLAN_LOGOS[0].url,
      establishedYear: establishedYear.trim() || tree.establishedYear,
      origin: origin.trim(),
      originPlace: origin.trim(),
      ancestralHouseAddress: ancestralHallAddress.trim(),
      ancestralHallAddress: ancestralHallAddress.trim(),
      headPerson: headPerson.trim(),
      patriarchName: patriarchName.trim(),
      motto: motto.trim(),
      clanRules: motto.trim(),
      description: description.trim(),
      code: code.trim() || tree.code,
    };

    onSaveTree(updatedTree);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-amber-900/30 dark:border-stone-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-50 flex items-center justify-between border-b border-amber-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-2xl bg-stone-900 flex items-center justify-center text-amber-300">
                <Sliders className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg font-serif text-amber-100 flex items-center gap-2">
                <span>Cài Đặt Gia Phả & Đổi Logo Dòng Tộc</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 font-sans">
                  Họ Tộc
                </span>
              </h3>
              <p className="text-[11.5px] text-amber-300/80">
                Tùy chỉnh biểu tượng logo, tên phả đồ, quê quán & gia quy truyền thống
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs flex-1">
          
          {/* SECTION 1: LOGO GIA PHẢ / CLAN EMBLEM (PRIMARY FOCUS) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-stone-50 to-orange-50/50 dark:from-stone-800/90 dark:to-amber-950/40 border-2 border-amber-300/70 dark:border-amber-900/60 shadow-sm space-y-4">
            
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold font-serif text-amber-950 dark:text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Logo & Biểu Tượng Gia Phả</span>
                </h4>
                <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5">
                  Biểu tượng sẽ hiển thị trang trọng trên tiêu đề ứng dụng, đầu trang phả đồ và bản in PDF từ đường.
                </p>
              </div>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleResetToDefaultLogo}
                  className="px-2.5 py-1 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-200/60 dark:hover:bg-stone-700 text-[11px] text-stone-600 dark:text-stone-300 flex items-center gap-1 transition-colors"
                  title="Đặt lại ảnh mặc định"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Mặc định</span>
                </button>
              )}
            </div>

            {/* Live Logo Preview Box */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-3.5 bg-white dark:bg-stone-900 rounded-2xl border border-amber-200 dark:border-stone-700 shadow-inner">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-2xl p-1 bg-gradient-to-br from-amber-300 via-amber-600 to-amber-800 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-stone-900 relative">
                    <img
                      src={avatarUrl}
                      alt="Logo dòng họ"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-full bg-white/90 text-stone-900 shadow hover:scale-110 transition-transform"
                        title="Tải ảnh mới"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-600 text-white font-bold text-[9px] rounded-full uppercase tracking-wider shadow whitespace-nowrap">
                  Logo hiện tại
                </span>
              </div>

              <div className="flex-1 w-full space-y-2 text-left">
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
                  <button
                    type="button"
                    onClick={() => setLogoTab('presets')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      logoTab === 'presets'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bộ mẫu truyền thống</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoTab('upload')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      logoTab === 'upload'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh lên máy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLogoTab('url')}
                    className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      logoTab === 'url'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Nhập URL</span>
                  </button>
                </div>

                {/* TAB 1: PRESET LOGOS GALLERY */}
                {logoTab === 'presets' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Chọn nhanh biểu tượng mỹ thuật truyền thống phù hợp với gia phong:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {PRESET_CLAN_LOGOS.map((item) => {
                        const isSelected = avatarUrl === item.url;
                        return (
                          <div
                            key={item.id}
                            onClick={() => setAvatarUrl(item.url)}
                            className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center gap-2 relative ${
                              isSelected
                                ? 'border-amber-600 bg-amber-100/70 dark:bg-amber-950/70 ring-2 ring-amber-500/50'
                                : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/80 hover:border-amber-400'
                            }`}
                          >
                            <img
                              src={item.url}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded-lg object-cover border border-amber-400/40 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-bold text-[11px] block truncate text-stone-800 dark:text-stone-200 font-serif">
                                {item.title}
                              </span>
                              <span className="text-[9.5px] text-stone-500 dark:text-stone-400 block truncate">
                                {item.tag}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 2: FILE UPLOAD (DRAG & DROP + INPUT) */}
                {logoTab === 'upload' && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileChange(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-5 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-amber-600 bg-amber-100/50 dark:bg-amber-950/50 scale-[1.01]'
                          : 'border-stone-300 dark:border-stone-700 hover:border-amber-500 bg-stone-50/60 dark:bg-stone-800/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 mx-auto flex items-center justify-center mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="font-bold text-stone-800 dark:text-stone-200 text-xs">
                        Bấm để tải tệp hoặc kéo thả ảnh vào đây
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                        Hỗ trợ ảnh PNG, JPG, WebP, SVG (Khuyến nghị ảnh vuông, tự động nén dung lượng nhẹ để lưu Cloud)
                      </p>
                    </div>

                    {isProcessingImage && (
                      <div className="flex items-center justify-center gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tối ưu & nén ảnh logo...</span>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-[11px] text-red-500 font-semibold">{uploadError}</p>
                    )}
                  </div>
                )}

                {/* TAB 3: CUSTOM IMAGE URL */}
                {logoTab === 'url' && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="url"
                          placeholder="Dán đường dẫn ảnh trực tuyến (https://...)"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyUrl}
                        className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold active:scale-95 transition-all shrink-0"
                      >
                        Áp dụng
                      </button>
                    </div>
                    <p className="text-[10.5px] text-stone-500 dark:text-stone-400">
                      Đường dẫn ảnh trực tiếp trên mạng (Unsplash, Cloudinary, Imgur, v.v.)
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* SECTION 2: GENEALOGY GENERAL INFO */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-amber-600" />
              <span>Thông Tin Danh Xưng & Nguồn Cội</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 block">
                  Tên dòng họ / Gia phả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Gia Phả Họ Nguyễn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-bold focus:outline-none focus:border-amber-500 font-serif"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 block">
                  Chi phái / Nhánh họ
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chi Ất - Tiền Phúc"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                  Năm khởi lập / Niên hiệu
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Ví dụ: 1842, Thời Tự Đức"
                    value={establishedYear}
                    onChange={(e) => setEstablishedYear(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                  Mã tộc tham gia (Gia phả code)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: NGUYEN-2026"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-mono uppercase font-bold focus:outline-none focus:border-amber-500 text-amber-700 dark:text-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                Quê quán gốc / Nơi phát tích
              </label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Ví dụ: Làng Cổ Đông Ngạc, Bắc Từ Liêm, Hà Nội"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                Địa chỉ nhà thờ họ / Từ đường
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Ví dụ: Số 18 Đường Cổ Tự, Xã Phúc Thọ, TP. Hà Nội"
                  value={ancestralHallAddress}
                  onChange={(e) => setAncestralHallAddress(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                  Trưởng tộc / Đại diện hiện tại
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn Bảo (Đời thứ IV)"
                    value={headPerson}
                    onChange={(e) => setHeadPerson(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                  Cụ Thủy Tổ / Khởi Tổ
                </label>
                <div className="relative">
                  <ShieldCheck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Nguyễn Văn An (Khởi Tổ)"
                    value={patriarchName}
                    onChange={(e) => setPatriarchName(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Gia huấn tộc ước / Lời răn dạy tổ tông</span>
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Uống nước nhớ nguồn - Nhân nghĩa lễ trí tín - Khắc cốt ghi tâm công đức tổ tông..."
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 italic focus:outline-none focus:border-amber-500 font-serif"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 block">
                Mô tả lịch sử & truyền thống dòng họ
              </label>
              <textarea
                rows={2}
                placeholder="Tóm tắt quá trình lập nghiệp, công tích tiên tổ và định hướng phát triển dòng họ..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-bold shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Cài Đặt & Logo</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
