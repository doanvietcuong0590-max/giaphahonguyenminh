import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Calendar, 
  MapPin, 
  Send, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Newspaper, 
  User, 
  Clock,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { MemoryPost, UserProfile } from '../types';

interface MemoryDetailScreenProps {
  memoryId: string;
  memories: MemoryPost[];
  currentUser?: UserProfile;
  onBack: () => void;
  onToggleLike: (id: string) => void;
  onAddComment: (memoryId: string, content: string) => void;
  onShare: () => void;
  onDeleteMemory?: (id: string) => void;
}

export const MemoryDetailScreen: React.FC<MemoryDetailScreenProps> = ({
  memoryId,
  memories,
  currentUser,
  onBack,
  onToggleLike,
  onAddComment,
  onShare,
  onDeleteMemory,
}) => {
  const memory = memories.find(m => m.id === memoryId) || memories[0];
  const [commentText, setCommentText] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canDelete = currentUser?.role === 'admin' || !currentUser;

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(memory.id, commentText.trim());
    setCommentText('');
  };

  const handleConfirmDelete = () => {
    if (onDeleteMemory) {
      onDeleteMemory(memory.id);
      onBack();
    }
  };

  const images = memory.images || [];

  return (
    <div className="pb-32 space-y-4">
      {/* Top Header - News Reader Bar */}
      <div className="bg-stone-900 px-4 py-2.5 text-stone-100 flex items-center justify-between border-b border-stone-800 shadow-md">
        <button
          onClick={onBack}
          className="p-1.5 rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-1 text-amber-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-semibold">Tất cả bài viết</span>
        </button>

        <div className="flex items-center gap-1 text-xs text-amber-200/80 font-serif">
          <Newspaper className="w-3.5 h-3.5" />
          <span>Bản Tin Dòng Họ</span>
        </div>

        <div className="flex items-center gap-1">
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 rounded-xl hover:bg-red-900/60 text-red-300 hover:text-red-100 transition-colors"
              title="Xóa bài viết này"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onShare}
            className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
            title="Chia sẻ bài báo này"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Article Container */}
      <div className="px-4 space-y-4">
        {/* Article Editorial Card */}
        <article className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-4">
          {/* Metadata Byline */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-700/80 pb-3">
            <div className="flex items-center gap-3">
              <img
                src={memory.authorAvatar}
                alt={memory.authorName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-600/60 shadow-sm"
              />
              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {memory.authorName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{memory.date}</span>
                  </span>
                  {memory.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 truncate max-w-[150px]">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{memory.location}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-stone-900 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Bài Viết Dòng Họ</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif text-stone-900 dark:text-stone-100 leading-tight">
            {memory.title}
          </h1>

          {/* Sapo / Subtitle if available */}
          {memory.subtitle && (
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-stone-900/60 border-l-4 border-amber-600 text-xs sm:text-sm font-medium text-amber-950 dark:text-amber-200 italic leading-relaxed">
              {memory.subtitle}
            </div>
          )}

          {/* Featured Image in Article */}
          {images.length > 0 && (
            <div className="space-y-2 pt-1">
              <div 
                onClick={() => setLightboxOpen(true)}
                className="relative h-64 sm:h-96 rounded-2xl overflow-hidden bg-stone-950 border border-stone-200 dark:border-stone-700 shadow-md cursor-pointer group"
              >
                <img
                  src={images[activeImageIndex]}
                  alt="Post gallery photo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs flex items-center gap-1 hover:bg-black/80"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Phóng to</span>
                </button>
              </div>

              {/* Multi-image thumbnail bar */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {images.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-amber-600 ring-2 ring-amber-500/50 scale-105'
                          : 'border-stone-300 dark:border-stone-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Full Article Content */}
          <div className="pt-2 text-stone-800 dark:text-stone-200 text-sm sm:text-base leading-relaxed font-serif whitespace-pre-line">
            {memory.content}
          </div>

          {/* Engagement / Actions Bar */}
          <div className="pt-4 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between">
            <button
              onClick={() => onToggleLike(memory.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                memory.isLiked
                  ? 'bg-red-50 dark:bg-red-950/50 text-red-600 border border-red-200 dark:border-red-900'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              <Heart className={`w-4 h-4 ${memory.isLiked ? 'fill-red-600' : ''}`} />
              <span>{memory.likes} Lượt thích</span>
            </button>

            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-semibold"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <div className="p-5 rounded-3xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm space-y-4">
          <h3 className="font-bold text-sm font-serif text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-amber-600" />
            <span>Bình Luận Của Con Cháu ({memory.comments.length})</span>
          </h3>

          <div className="space-y-3">
            {memory.comments.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-3 text-center">
                Chưa có bình luận nào. Hãy gửi lời chúc đầu tiên!
              </p>
            ) : (
              memory.comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800 text-xs">
                  <img
                    src={comment.userAvatar}
                    alt={comment.userName}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-amber-600/40"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-stone-900 dark:text-stone-100 truncate">
                        {comment.userName}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-stone-700 dark:text-stone-300 mt-1 font-serif">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Comment Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 p-3 max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto shadow-2xl">
        <form onSubmit={handleSendComment} className="flex items-center gap-2">
          <img
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
            alt={currentUser?.fullName || 'User'}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover shrink-0 border border-amber-600/50"
          />
          <input
            type="text"
            placeholder="Viết cảm nghĩ, lời chúc hoặc bình luận..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="px-3.5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white font-semibold transition-transform active:scale-95 shrink-0 flex items-center gap-1 text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Gửi</span>
          </button>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl p-5 border border-stone-200 dark:border-stone-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Xác nhận xóa bài viết?
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Bạn có chắc chắn muốn xóa bài viết "<strong>{memory.title}</strong>"?
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Photo Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
        >
          <div className="relative max-w-4xl w-full max-h-[85vh] flex items-center justify-center">
            <img
              src={images[activeImageIndex]}
              alt="Enlarged memory photo"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
            />
          </div>

          {images.length > 1 && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-4 mt-4 text-white"
            >
              <button
                onClick={() => setActiveImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-xs font-mono">
                {activeImageIndex + 1} / {images.length}
              </span>
              <button
                onClick={() => setActiveImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
