import React, { useState, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Upload, 
  Send,
  Plus,
  Trash2,
  Check,
  Eye,
  Edit3,
  Sparkles,
  Link as LinkIcon,
  Star,
  FileText,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { MemoryPost, UserProfile } from '../../types';
import { compressImageFile } from '../../utils/imageUtils';

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onCreateMemory: (post: Omit<MemoryPost, 'id' | 'likes' | 'comments' | 'isLiked'>) => Promise<void> | void;
}

export const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateMemory,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('Từ đường dòng họ');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedImages, setSelectedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200'
  ]);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>('');

  // Suggested clan photo library
  const presetPhotos = [
    { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200', title: 'Họp mặt đại gia đình' },
    { url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=1200', title: 'Bữa cơm sum vầy' },
    { url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=1200', title: 'Tết sum họp' },
    { url: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?auto=format&fit=crop&q=80&w=1200', title: 'Di tích từ đường cổ' },
    { url: 'https://images.unsplash.com/photo-1533727937480-da3a97967e11?auto=format&fit=crop&q=80&w=1200', title: 'Thắp hương tưởng nhớ' },
  ];

  // Handle local file uploads with automatic compression (avoids Firestore 1MB quota exceeded)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    setSaveError('');

    try {
      const compressedList: string[] = [];
      const fileArray = Array.from(files) as File[];
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) continue;
        const compressedBase64 = await compressImageFile(file, 800, 0.75);
        compressedList.push(compressedBase64);
      }
      if (compressedList.length > 0) {
        setSelectedImages((prev) => [...prev, ...compressedList]);
      }
    } catch (err: any) {
      console.error('Lỗi khi nén ảnh kỷ niệm:', err);
      setSaveError('Có lỗi khi xử lý tệp ảnh. Vui lòng thử lại với ảnh dung lượng nhỏ hơn.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    setSelectedImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (coverImageIndex >= next.length) {
        setCoverImageIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleSetCover = (index: number) => {
    setCoverImageIndex(index);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isSaving || isCompressing) return;

    setIsSaving(true);
    setSaveError('');

    try {
      // Sắp xếp ảnh: ảnh bìa lên đầu tiên
      let finalImages = [...selectedImages];
      if (selectedImages.length > 0 && coverImageIndex < selectedImages.length) {
        const cover = finalImages[coverImageIndex];
        finalImages = [cover, ...finalImages.filter((_, i) => i !== coverImageIndex)];
      }

      await onCreateMemory({
        title: title.trim(),
        subtitle: subtitle.trim() || '',
        content: content.trim(),
        authorName: currentUser.fullName || 'Thành viên dòng họ',
        authorAvatar: currentUser.avatarUrl || '',
        date: date || new Date().toISOString().split('T')[0],
        images: finalImages.filter((img) => Boolean(img && img.trim())),
        location: location.trim() || '',
        tags: [],
      });

      // Đóng modal sau khi xuất bản
      onClose();
    } catch (err: any) {
      console.error('Lỗi khi xuất bản bài viết:', err);
      setSaveError(err?.message || 'Có lỗi khi lưu bài viết lên hệ thống. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header - Editorial Style */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-50 flex items-center justify-between border-b border-amber-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base font-serif text-amber-100">
                  Tòa Soạn Bản Tin & Kỷ Niệm
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-800/80 text-amber-200 text-[10px] font-semibold uppercase tracking-wider">
                  Trang tin dòng họ
                </span>
              </div>
              <p className="text-[11px] text-amber-300/80">
                Đăng bài phóng sự, tin tức, hình ảnh sum họp cho gia tộc
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Preview Mode */}
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                previewMode
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-amber-200'
              }`}
              title="Chuyển chế độ xem trước bài báo"
            >
              {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{previewMode ? 'Sửa bài' : 'Xem trước'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {previewMode ? (
          /* PREVIEW AS A REAL NEWS ARTICLE */
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-stone-900 dark:text-stone-100">
            <div className="space-y-2 border-b border-stone-200 dark:border-stone-800 pb-4">
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 font-semibold uppercase tracking-wider">
                <span>Bản Tin Dòng Họ</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {date}
                </span>
                {location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {location}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold font-serif leading-tight text-stone-900 dark:text-stone-100">
                {title || 'Chưa nhập tiêu đề bài viết'}
              </h1>

              {subtitle && (
                <p className="text-sm font-medium text-stone-600 dark:text-stone-300 italic border-l-2 border-amber-600 pl-3">
                  {subtitle}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-amber-600"
                />
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Tác giả: {currentUser.fullName}
                </span>
              </div>
            </div>

            {/* Featured Image in Preview */}
            {selectedImages.length > 0 && (
              <div className="space-y-1.5">
                <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-stone-900 shadow-md">
                  <img
                    src={selectedImages[coverImageIndex] || selectedImages[0]}
                    alt="Ảnh bài viết"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-semibold backdrop-blur-sm">
                    Ảnh bìa bài báo
                  </div>
                </div>
                {selectedImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {selectedImages.map((img, i) => (
                      <div key={i} className="h-16 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700">
                        <img src={img} alt="Gallery item" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Article Content Preview */}
            <div className="text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line font-serif space-y-3 pt-2">
              {content || 'Chưa có nội dung bài viết.'}
            </div>
          </div>
        ) : (
          /* EDITORIAL FORM */
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs">
            {/* 1. Tiêu đề bài viết */}
            <div className="space-y-1.5">
              <label className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <span>Tiêu đề bài báo / Tin tức <span className="text-red-500">*</span></span>
                <span className="text-[10.5px] font-normal text-stone-400">Rõ ràng, trang trọng</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Đại lễ cầu siêu & Lễ khánh thành nhà thờ tổ họ Nguyễn năm 2026..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-serif font-bold text-sm sm:text-base focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all placeholder:font-sans placeholder:font-normal placeholder:text-xs"
              />
            </div>

            {/* 2. Đoạn mở đầu / Tóm tắt báo chí (Sapo) */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <span>Tóm tắt / Lời dẫn (Sapo ngắn)</span>
                <span className="text-[10px] text-stone-400">Không bắt buộc</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Hàng trăm con cháu từ khắp mọi miền tổ quốc đã tề tựu đông đủ trong không khí trang nghiêm..."
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-800 dark:text-stone-200 text-xs italic focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* 3. Ngày đăng & Địa điểm diễn ra (No category / Không có chủ đề) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ngày diễn ra sự kiện / ghi nhận</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Địa điểm ghi hình / tổ chức</span>
                </label>
                <input
                  type="text"
                  placeholder="Từ đường dòng họ, Huế..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-medium"
                />
              </div>
            </div>

            {/* 4. Quản lý Ảnh Tải Lên (1 hoặc nhiều ảnh) */}
            <div className="space-y-2.5 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Hình ảnh bài viết ({selectedImages.length} ảnh)</span>
                  </label>
                  <p className="text-[10.5px] text-stone-500 dark:text-stone-400">
                    Tải lên một hoặc nhiều bức ảnh từ thiết bị, hoặc chọn từ tư liệu có sẵn
                  </p>
                </div>

                {/* Upload Buttons */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all text-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh từ máy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="p-1.5 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-200 transition-colors"
                    title="Chèn ảnh qua đường link URL"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* URL Input Bar */}
              {showUrlInput && (
                <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                  <input
                    type="url"
                    placeholder="Dán đường dẫn link ảnh (https://...)..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-stone-800 text-white rounded-xl font-semibold"
                  >
                    Thêm link
                  </button>
                </div>
              )}

              {/* Compression loading indicator */}
              {isCompressing && (
                <div className="flex items-center gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-amber-600" />
                  <span>Đang tự động nén & tối ưu hóa ảnh để tương thích lưu trữ đám mây...</span>
                </div>
              )}

              {/* Selected Images Grid with Cover Star & Delete */}
              {selectedImages.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                  {selectedImages.map((imgUrl, idx) => {
                    const isCover = idx === coverImageIndex;
                    return (
                      <div
                        key={idx}
                        className={`group relative h-24 rounded-xl overflow-hidden border-2 transition-all ${
                          isCover
                            ? 'border-amber-600 ring-2 ring-amber-400 shadow-md'
                            : 'border-stone-200 dark:border-stone-700 hover:border-amber-400'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`Uploaded ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />

                        {/* Cover Image Badge / Action */}
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className={`absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 transition-all ${
                            isCover
                              ? 'bg-amber-600 text-white shadow'
                              : 'bg-black/60 text-stone-200 hover:bg-amber-600 hover:text-white backdrop-blur-sm'
                          }`}
                          title="Chọn làm ảnh bìa tiêu điểm của bài báo"
                        >
                          <Star className={`w-2.5 h-2.5 ${isCover ? 'fill-white' : ''}`} />
                          <span>{isCover ? 'Ảnh bìa' : 'Đặt bìa'}</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-600/90 text-white hover:bg-red-700 transition-colors shadow"
                          title="Xóa ảnh này"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/60 text-[9px] text-white font-mono">
                          #{idx + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-xl text-stone-400">
                  <ImageIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p className="text-[11px]">Chưa có hình ảnh nào. Bấm nút "Tải ảnh từ máy" phía trên.</p>
                </div>
              )}

              {/* Preset suggestion pill list */}
              <div className="pt-2 border-t border-stone-200 dark:border-stone-700/60">
                <span className="text-[10px] text-stone-500 font-medium block mb-1.5">
                  Gợi ý ảnh tư liệu mẫu:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {presetPhotos.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        if (!selectedImages.includes(preset.url)) {
                          setSelectedImages([...selectedImages, preset.url]);
                        }
                      }}
                      className="px-2 py-1 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-amber-500 text-[10.5px] text-stone-700 dark:text-stone-300 whitespace-nowrap flex items-center gap-1 transition-colors shrink-0"
                    >
                      <Plus className="w-3 h-3 text-amber-600" />
                      <span>{preset.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Phần Nội Dung Bài Báo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <span>Nội dung chi tiết bài viết</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="text-[10.5px] text-stone-400 font-mono">
                  {wordCount} từ • {content.length} ký tự
                </span>
              </div>

              <textarea
                rows={7}
                required
                placeholder="Nhập toàn bộ nội dung bài viết, phóng sự, diễn biến sự kiện, lời dặn dò của các bậc cao niên hoặc cảm xúc sum vầy của con cháu..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-2xl text-stone-900 dark:text-stone-100 font-serif leading-relaxed text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition-all placeholder:font-sans placeholder:text-xs"
              />
            </div>

            {/* Error Message */}
            {saveError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span className="flex-1">{saveError}</span>
              </div>
            )}
          </form>
        )}

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-amber-600"
            />
            <div className="text-[11px] leading-tight">
              <p className="font-bold text-stone-800 dark:text-stone-200">{currentUser.fullName}</p>
              <p className="text-[10px] text-stone-400">Đăng với tư cách Thành viên dòng họ</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 text-xs disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSaving || isCompressing}
              className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all text-xs"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu lên hệ thống...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Xuất bản bài báo</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
