import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Image as ImageIcon,
  ChevronRight,
  Newspaper,
  BookOpen,
  TrendingUp,
  User,
  Trash2,
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { MemoryPost, UserProfile } from '../types';

interface MemoriesScreenProps {
  memories: MemoryPost[];
  currentUser?: UserProfile;
  onSelectMemory: (id: string) => void;
  onOpenCreateMemory: () => void;
  onToggleLike: (id: string) => void;
  onBulkDeleteMemories?: (memoryIds: string[]) => void;
}

export const MemoriesScreen: React.FC<MemoriesScreenProps> = ({
  memories,
  currentUser,
  onSelectMemory,
  onOpenCreateMemory,
  onToggleLike,
  onBulkDeleteMemories,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Bulk selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'moderator' || !currentUser;
  const canBulkDelete = currentUser?.role === 'admin' || !currentUser;

  const filteredMemories = memories.filter((mem) => {
    const query = searchQuery.toLowerCase();
    return (
      mem.title.toLowerCase().includes(query) ||
      mem.content.toLowerCase().includes(query) ||
      mem.authorName.toLowerCase().includes(query) ||
      (mem.location && mem.location.toLowerCase().includes(query)) ||
      (mem.subtitle && mem.subtitle.toLowerCase().includes(query))
    );
  });

  const featuredPost = filteredMemories.length > 0 ? filteredMemories[0] : null;
  const secondaryPosts = filteredMemories.length > 1 ? filteredMemories.slice(1) : [];

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredMemories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMemories.map(m => m.id));
    }
  };

  const handleExecuteDelete = () => {
    if (selectedIds.length === 0) return;
    if (onBulkDeleteMemories) {
      onBulkDeleteMemories(selectedIds);
    }
    setSelectedIds([]);
    setIsSelectionMode(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="pb-32 sm:pb-36">
      {/* Top Header - News Room Style */}
      <div className="bg-stone-900 text-stone-100 px-4 py-3 border-b border-stone-800 shadow-sm space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base font-serif text-amber-200">
                Bản Tin & Kỷ Niệm Dòng Họ
              </h2>
              <p className="text-xs text-stone-400">
                Trang tin tức, phóng sự hoạt động và ký ức của đại gia đình
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canBulkDelete && filteredMemories.length > 0 && (
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  if (isSelectionMode) setSelectedIds([]);
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
                  isSelectionMode
                    ? 'bg-red-600 border-red-500 text-white shadow'
                    : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
                }`}
                title="Bật/Tắt chế độ chọn xóa bài viết hàng loạt"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isSelectionMode ? 'Hủy chọn' : 'Xóa nhiều'}</span>
              </button>
            )}

            <button
              onClick={onOpenCreateMemory}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Viết bài mới</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm bài báo, phóng sự, tác giả, địa điểm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {isSelectionMode && (
        <div className="sticky top-14 z-20 bg-amber-900 text-amber-50 px-4 py-2.5 border-b border-amber-800 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1 font-bold text-amber-200 hover:text-white"
            >
              {selectedIds.length === filteredMemories.length ? (
                <CheckSquare className="w-4 h-4 text-amber-400" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>
                {selectedIds.length === filteredMemories.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </span>
            </button>
            <span className="text-stone-300">|</span>
            <span className="font-semibold text-amber-300">
              Đã chọn: {selectedIds.length} bài viết
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-stone-200"
            >
              Hủy
            </button>
            <button
              disabled={selectedIds.length === 0}
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold flex items-center gap-1 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa bài viết {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main News Content Area */}
      <div className="px-4 mt-4 space-y-4">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              {searchQuery ? 'Không tìm thấy bài viết nào phù hợp' : 'Chưa có bài viết nào được đăng'}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs mx-auto">
              {searchQuery ? 'Thử tìm với từ khóa khác hoặc xóa bộ lọc tìm kiếm.' : 'Hãy là người đầu tiên biên soạn phóng sự, tin tức hoặc chia sẻ hình ảnh dòng họ.'}
            </p>
            <button
              onClick={onOpenCreateMemory}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Soạn bài viết mới</span>
            </button>
          </div>
        ) : (
          <>
            {/* 1. FEATURED ARTICLE (TIÊU ĐIỂM) */}
            {featuredPost && (
              <div
                onClick={() => {
                  if (isSelectionMode) {
                    setSelectedIds(prev => 
                      prev.includes(featuredPost.id) ? prev.filter(i => i !== featuredPost.id) : [...prev, featuredPost.id]
                    );
                  } else {
                    onSelectMemory(featuredPost.id);
                  }
                }}
                className={`relative rounded-3xl bg-white dark:bg-stone-800 border shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group ${
                  selectedIds.includes(featuredPost.id)
                    ? 'border-red-500 ring-2 ring-red-400'
                    : 'border-amber-200/80 dark:border-amber-900/50'
                }`}
              >
                {/* Selection Checkbox on Featured */}
                {isSelectionMode && (
                  <div
                    onClick={(e) => handleToggleSelect(featuredPost.id, e)}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-black/60 backdrop-blur-md rounded-xl cursor-pointer"
                  >
                    {selectedIds.includes(featuredPost.id) ? (
                      <CheckSquare className="w-6 h-6 text-red-400 fill-white" />
                    ) : (
                      <Square className="w-6 h-6 text-white" />
                    )}
                  </div>
                )}

                {/* Large Featured Photo */}
                {featuredPost.images && featuredPost.images.length > 0 && (
                  <div className="relative h-60 sm:h-72 bg-stone-900 overflow-hidden">
                    <img
                      src={featuredPost.images[0]}
                      alt={featuredPost.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Badges on image */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Tiêu điểm</span>
                      </span>
                      {featuredPost.location && (
                        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span>{featuredPost.location}</span>
                        </span>
                      )}
                    </div>

                    {featuredPost.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-300" />
                        <span>+{featuredPost.images.length - 1} ảnh</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Headline & Abstract */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{featuredPost.authorName}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono">{featuredPost.date}</span>
                  </div>

                  <h3 className="font-bold font-serif text-lg sm:text-2xl text-stone-900 dark:text-stone-100 leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {featuredPost.title}
                  </h3>

                  {featuredPost.subtitle && (
                    <p className="text-xs sm:text-sm font-semibold text-stone-700 dark:text-stone-300 italic font-serif">
                      {featuredPost.subtitle}
                    </p>
                  )}

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 line-clamp-3 leading-relaxed font-serif">
                    {featuredPost.content}
                  </p>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike(featuredPost.id);
                        }}
                        className={`flex items-center gap-1 font-semibold transition-colors ${
                          featuredPost.isLiked ? 'text-red-600' : 'text-stone-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${featuredPost.isLiked ? 'fill-red-600' : ''}`} />
                        <span>{featuredPost.likes}</span>
                      </button>

                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{featuredPost.comments.length}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                      <span>Đọc tiếp</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. SECONDARY ARTICLES (DANH SÁCH BÀI BÁO) */}
            {secondaryPosts.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400 font-serif">
                  Tin tức & Phóng sự khác ({secondaryPosts.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {secondaryPosts.map((post) => {
                    const isSelected = selectedIds.includes(post.id);

                    return (
                      <div
                        key={post.id}
                        onClick={() => {
                          if (isSelectionMode) {
                            setSelectedIds(prev => 
                              prev.includes(post.id) ? prev.filter(i => i !== post.id) : [...prev, post.id]
                            );
                          } else {
                            onSelectMemory(post.id);
                          }
                        }}
                        className={`relative rounded-2xl bg-white dark:bg-stone-800 border p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
                          isSelected
                            ? 'border-red-500 ring-2 ring-red-400 bg-red-50/20'
                            : 'border-stone-200 dark:border-stone-700/80 hover:border-amber-500'
                        }`}
                      >
                        {/* Selection Checkbox */}
                        {isSelectionMode && (
                          <div
                            onClick={(e) => handleToggleSelect(post.id, e)}
                            className="absolute top-3 right-3 z-10 cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 text-red-600 fill-red-100" />
                            ) : (
                              <Square className="w-5 h-5 text-stone-400 hover:text-stone-600" />
                            )}
                          </div>
                        )}

                        <div className="space-y-2.5">
                          {/* Thumbnail if present */}
                          {post.images && post.images.length > 0 && (
                            <div className="relative h-40 rounded-xl overflow-hidden bg-stone-900">
                              <img
                                src={post.images[0]}
                                alt={post.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {post.images.length > 1 && (
                                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-white text-[10px] font-semibold flex items-center gap-1">
                                  <ImageIcon className="w-3 h-3 text-amber-300" />
                                  <span>+{post.images.length - 1}</span>
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-[11px] text-stone-500">
                            <span className="font-semibold text-amber-800 dark:text-amber-400">{post.authorName}</span>
                            <span>•</span>
                            <span className="font-mono">{post.date}</span>
                          </div>

                          <h4 className="font-bold font-serif text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-snug group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                            {post.title}
                          </h4>

                          <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 font-serif">
                            {post.subtitle || post.content}
                          </p>
                        </div>

                        {/* Article Footer */}
                        <div className="pt-3 mt-3 border-t border-stone-100 dark:border-stone-700/60 flex items-center justify-between text-xs text-stone-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                              <span>{post.likes}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{post.comments.length}</span>
                            </span>
                          </div>

                          <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center text-[11px]">
                            <span>Xem bài</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
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
                Bạn đang chuẩn bị xóa <strong>{selectedIds.length}</strong> bài viết / kỷ niệm khỏi dòng họ.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
