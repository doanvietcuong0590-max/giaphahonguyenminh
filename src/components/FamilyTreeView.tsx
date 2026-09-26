import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Filter, 
  Search, 
  UserPlus, 
  ChevronDown, 
  ChevronRight, 
  ChevronUp,
  Sparkles, 
  Heart, 
  Award, 
  Crown, 
  Users, 
  Eye, 
  Info,
  GitFork,
  Layers,
  Maximize2,
  Minimize2,
  Plus,
  Compass,
  Move,
  MousePointer,
  HelpCircle,
  SlidersHorizontal,
  LayoutGrid,
  Printer
} from 'lucide-react';
import { Member, GenealogyTree, ScreenType } from '../types';
import { buildFamilyTree, TreeNode, toRoman, getGenerationTitle } from '../utils/treeUtils';

interface FamilyTreeViewProps {
  tree: GenealogyTree;
  members: Member[];
  onSelectMember: (memberId: string) => void;
  onOpenAddMember: (parentOrSpouseId?: string, relType?: 'child' | 'spouse' | 'parent') => void;
  onNavigate: (screen: ScreenType) => void;
  onOpenPrint?: () => void;
}

export const FamilyTreeView: React.FC<FamilyTreeViewProps> = ({
  tree,
  members,
  onSelectMember,
  onOpenAddMember,
  onNavigate,
  onOpenPrint,
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'generations'>('tree');
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [panPosition, setPanPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cardStyle, setCardStyle] = useState<'standard' | 'compact'>('standard');
  
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedGeneration, setSelectedGeneration] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [collapsedGenerations, setCollapsedGenerations] = useState<Record<number, boolean>>({});
  const [showGuideTip, setShowGuideTip] = useState<boolean>(true);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);

  // Dynamic max generation
  const maxGeneration = useMemo(() => {
    return Math.max(...members.map(m => m.generation || 1), 1);
  }, [members]);

  const generationsList = useMemo(() => {
    return Array.from({ length: maxGeneration }, (_, i) => i + 1);
  }, [maxGeneration]);

  // Extract all available branches from members
  const availableBranches = useMemo(() => {
    const branches = new Set<string>();
    members.forEach(m => {
      if (m.branch) branches.add(m.branch);
    });
    return Array.from(branches);
  }, [members]);

  // Build tree hierarchy
  const treeRoots = useMemo(() => {
    return buildFamilyTree(members);
  }, [members]);

  // Filter members for generation view
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchSearch = 
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.courtesyName && m.courtesyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.tabooName && m.tabooName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(m.birthYear).includes(searchQuery);
      const matchBranch = selectedBranch === 'all' || m.branch === selectedBranch || m.branch.includes(selectedBranch);
      const matchGen = selectedGeneration === 'all' || m.generation === selectedGeneration;
      return matchSearch && matchBranch && matchGen;
    });
  }, [members, searchQuery, selectedBranch, selectedGeneration]);

  // Handle Drag / Pan Mouse Events
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan on left click and when not clicking an interactive button/card
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle Touch Pan and Pinch-to-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX - panPosition.x,
        y: e.touches[0].clientY - panPosition.y,
      };
      lastTouchDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPanPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.hypot(dx, dy);
      if (lastTouchDistanceRef.current !== null) {
        const factor = currentDist / lastTouchDistanceRef.current;
        setZoomLevel(prev => Math.min(2.2, Math.max(0.3, Number((prev * factor).toFixed(2)))));
      }
      lastTouchDistanceRef.current = currentDist;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastTouchDistanceRef.current = null;
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent default scroll when zooming over canvas
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoomLevel(prev => Math.min(2.4, Math.max(0.3, Number((prev + zoomDelta).toFixed(2)))));
  };

  // Reset to Center
  const resetView = () => {
    setZoomLevel(0.9);
    setPanPosition({ x: 0, y: 0 });
  };

  const toggleNodeCollapse = (memberId: string) => {
    setCollapsedNodes(prev => ({
      ...prev,
      [memberId]: !prev[memberId]
    }));
  };

  const toggleGenCollapse = (gen: number) => {
    setCollapsedGenerations(prev => ({
      ...prev,
      [gen]: !prev[gen]
    }));
  };

  const expandAllNodes = () => {
    setCollapsedNodes({});
    setCollapsedGenerations({});
  };

  const collapseAllNodes = () => {
    const newCollapsed: Record<string, boolean> = {};
    members.forEach(m => {
      if (m.childIds && m.childIds.length > 0) {
        newCollapsed[m.id] = true;
      }
    });
    setCollapsedNodes(newCollapsed);
  };

  // Individual Member Node Component
  const MemberNodeCard: React.FC<{ member: Member; isSpouse?: boolean }> = ({ member, isSpouse = false }) => {
    const isHighlighted = searchQuery && (
      member.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.courtesyName && member.courtesyName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (cardStyle === 'compact') {
      return (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            onSelectMember(member.id);
          }}
          className={`relative w-36 sm:w-40 p-2 rounded-xl bg-white dark:bg-stone-900 border transition-all cursor-pointer shadow-sm hover:shadow-md select-none group text-left ${
            isHighlighted
              ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/70 dark:bg-amber-950/60'
              : isSpouse
              ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-400 bg-rose-50/20'
              : member.rank === 'truong'
              ? 'border-amber-400 dark:border-amber-600 hover:border-amber-500'
              : 'border-stone-200 dark:border-stone-700 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-600/70 shrink-0">
              <img 
                src={member.avatarUrl} 
                alt={member.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-[11px] text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-600">
                {member.fullName}
              </h4>
              <p className="text-[9px] text-stone-500 dark:text-stone-400 font-mono">
                Đời {toRoman(member.generation)} • {member.birthYear}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onSelectMember(member.id);
        }}
        className={`relative w-48 sm:w-52 p-2.5 rounded-2xl bg-white dark:bg-stone-900 border transition-all cursor-pointer shadow-md hover:shadow-xl select-none group text-left ${
          isHighlighted
            ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/70 dark:bg-amber-950/60'
            : isSpouse
            ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-400 bg-rose-50/10'
            : member.rank === 'truong'
            ? 'border-amber-400 dark:border-amber-600 hover:border-amber-500'
            : 'border-stone-200 dark:border-stone-700 hover:border-amber-400'
        }`}
      >
        {/* Top ribbon: Generation & Rank */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
            isSpouse
              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
          }`}>
            Đời {toRoman(member.generation)} ({member.generation})
          </span>

          <div className="flex items-center gap-1">
            <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full ${
              member.rank === 'truong'
                ? 'bg-amber-500 text-white'
                : member.rank === 'dau'
                ? 'bg-rose-500 text-white'
                : member.rank === 're'
                ? 'bg-blue-500 text-white'
                : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300'
            }`}>
              {member.rank === 'truong' ? 'Trưởng' : member.rank === 'dau' ? 'Dâu' : member.rank === 're' ? 'Rể' : 'Thứ'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${member.isAlive ? 'bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-950' : 'bg-stone-400'}`} />
          </div>
        </div>

        {/* Member info & avatar */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-600/70 shrink-0 shadow-sm">
            <img 
              src={member.avatarUrl} 
              alt={member.fullName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
              {member.fullName}
            </h4>
            {member.courtesyName && (
              <p className="text-[10px] text-amber-700 dark:text-amber-400 truncate">
                Tự: {member.courtesyName}
              </p>
            )}
            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
              {member.birthYear} - {member.isAlive ? 'Nay' : member.deathYear || '?'}
            </p>
          </div>
        </div>

        {/* Quick action buttons on card bottom */}
        <div className="mt-2 pt-1.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[10px]">
          <span className="text-stone-400 truncate max-w-[95px] text-[9.5px]">
            {member.branch || 'Chính nhánh'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAddMember(member.id, 'child');
              }}
              className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300 transition-colors"
              title="Thêm con"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectMember(member.id);
              }}
              className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200"
              title="Xem hồ sơ"
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Recursive Tree Node Renderer
  const RenderTreeNode: React.FC<{ node: TreeNode; isRoot?: boolean }> = ({ node, isRoot = false }) => {
    const isCollapsed = collapsedNodes[node.member.id] || false;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="flex flex-col items-center">
        {/* Couple Unit (Member + Spouses) */}
        <div className="flex items-center gap-2 relative z-10">
          <MemberNodeCard member={node.member} />

          {/* Spouses */}
          {node.spouses.map(spouse => (
            <React.Fragment key={spouse.id}>
              {/* Marriage Bridge Indicator */}
              <div className="flex flex-col items-center justify-center text-rose-500 px-0.5">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span className="text-[8px] font-semibold text-rose-600 dark:text-rose-400">Phối ngẫu</span>
              </div>
              <MemberNodeCard member={spouse} isSpouse />
            </React.Fragment>
          ))}
        </div>

        {/* Expand / Collapse Button if this node has children */}
        {hasChildren && (
          <div className="relative flex flex-col items-center my-1 z-20">
            {/* Trunk Line */}
            <div className="w-0.5 h-4 bg-amber-500 dark:bg-amber-600" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeCollapse(node.member.id);
              }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold shadow-md active:scale-95 transition-all"
              title={isCollapsed ? 'Mở rộng nhánh con' : 'Thu gọn nhánh con'}
            >
              <span>{node.children.length} nhánh</span>
              {isCollapsed ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronUp className="w-3 h-3" />
              )}
            </button>
            {!isCollapsed && <div className="w-0.5 h-4 bg-amber-500 dark:bg-amber-600" />}
          </div>
        )}

        {/* Children Subtree with horizontal branch connecting bar */}
        {hasChildren && !isCollapsed && (
          <div className="relative flex justify-center pt-2">
            {/* Horizontal Branch Connector Bar */}
            {node.children.length > 1 && (
              <div 
                className="absolute top-2 left-1/2 -translate-x-1/2 h-0.5 bg-amber-500 dark:bg-amber-600 rounded-full"
                style={{
                  width: `calc(100% - ${node.children.length > 2 ? '140px' : '70px'})`,
                  maxWidth: '96%'
                }}
              />
            )}

            {/* Child nodes */}
            <div className="flex gap-6 sm:gap-10 pt-2 items-start">
              {node.children.map((childNode) => (
                <div key={childNode.member.id} className="relative flex flex-col items-center">
                  {/* Vertical line dropping from horizontal bar to child */}
                  <div className="w-0.5 h-4 bg-amber-500 dark:bg-amber-600 -mt-4 mb-2" />
                  <RenderTreeNode node={childNode} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-stone-950 text-stone-100 overflow-hidden flex flex-col' : 'pb-32 sm:pb-36'}`}>
      {/* Top Header Controls */}
      <div className={`${isFullscreen ? 'bg-stone-900 p-3' : 'bg-stone-900 text-stone-100 px-3 sm:px-4 py-2.5'} border-b border-stone-800 shadow-sm space-y-2`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-stone-700">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'tree'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Xem dạng sơ đồ cây phân nhánh trực quan"
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Sơ Đồ Cây</span>
            </button>
            <button
              onClick={() => setViewMode('generations')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'generations'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
              title="Xem theo từng dải thế hệ / đời"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Phân Theo Đời</span>
            </button>
          </div>

          {/* Quick Toolbar: Pan/Zoom, Fit, Style, Fullscreen */}
          <div className="flex items-center gap-1 bg-stone-800 p-1 rounded-lg border border-stone-700">
            {viewMode === 'tree' && (
              <>
                <button
                  onClick={() => setCardStyle(prev => prev === 'standard' ? 'compact' : 'standard')}
                  className={`px-2 py-1 rounded text-[10.5px] font-medium transition-colors ${cardStyle === 'compact' ? 'bg-amber-700 text-white font-semibold' : 'text-stone-300 hover:bg-stone-700'}`}
                  title="Chuyển đổi kích thước thẻ (Rút gọn / Chuẩn)"
                >
                  {cardStyle === 'compact' ? 'Thẻ nhỏ' : 'Thẻ chuẩn'}
                </button>
                <div className="w-px h-4 bg-stone-700 mx-0.5" />
              </>
            )}

            <button
              onClick={() => setZoomLevel(prev => Math.max(0.3, Number((prev - 0.15).toFixed(2))))}
              className="p-1 rounded hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10.5px] font-mono px-1 text-amber-300 font-semibold min-w-[36px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.4, Number((prev + 0.15).toFixed(2))))}
              className="p-1 rounded hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetView}
              className="p-1 rounded hover:bg-stone-700 text-amber-300 hover:text-white transition-colors"
              title="Căn giữa & Đặt lại 90%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {viewMode === 'tree' && (
              <>
                <div className="w-px h-4 bg-stone-700 mx-0.5" />
                <button
                  onClick={expandAllNodes}
                  className="px-1.5 py-1 rounded hover:bg-stone-700 text-stone-300 text-[10.5px] font-medium transition-colors"
                  title="Mở rộng tất cả các nhánh"
                >
                  Mở hết
                </button>
                <button
                  onClick={collapseAllNodes}
                  className="px-1.5 py-1 rounded hover:bg-stone-700 text-stone-300 text-[10.5px] font-medium transition-colors"
                  title="Thu gọn các nhánh"
                >
                  Thu gọn
                </button>
              </>
            )}

            {onOpenPrint && (
              <>
                <div className="w-px h-4 bg-stone-700 mx-0.5" />
                <button
                  onClick={onOpenPrint}
                  className="px-2 py-1 rounded bg-amber-700/80 hover:bg-amber-600 active:scale-95 text-amber-100 hover:text-white text-[10.5px] font-semibold flex items-center gap-1 transition-all shadow-sm"
                  title="In ấn phả đồ / Xuất PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">In phả đồ</span>
                </button>
              </>
            )}

            <div className="w-px h-4 bg-stone-700 mx-0.5" />

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 rounded hover:bg-stone-700 text-amber-400 hover:text-white transition-colors"
              title={isFullscreen ? 'Thoát toàn màn hình' : 'Mở rộng toàn màn hình xem cây'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1 border-t border-stone-800">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, tên tự, năm sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-800/90 border border-stone-700 rounded-lg text-xs text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <select
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-2.5 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-semibold shrink-0"
            >
              <option value="all">Tất cả thế hệ (1-{maxGeneration})</option>
              {generationsList.map(g => (
                <option key={g} value={g}>
                  Đời {toRoman(g)} (Đời {g})
                </option>
              ))}
            </select>

            <button
              onClick={() => setSelectedBranch('all')}
              className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors shrink-0 ${
                selectedBranch === 'all'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              Tất cả chi
            </button>
            {availableBranches.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors shrink-0 ${
                  selectedBranch === b
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Interaction Guide */}
      {showGuideTip && viewMode === 'tree' && (
        <div className="px-3 sm:px-4 mt-2">
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-[11px] sm:text-xs">
              <Move className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                <strong>Thao tác:</strong> Giữ chuột hoặc ngón tay để <strong>kéo di chuyển</strong> • Lăn chuột hoặc chụm 2 ngón tay để <strong>phóng to / thu nhỏ</strong>.
              </span>
            </div>
            <button 
              onClick={() => setShowGuideTip(false)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs px-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: Interactive Pan & Zoom Tree Canvas */}
      {viewMode === 'tree' ? (
        <div className={`px-2 sm:px-4 ${isFullscreen ? 'flex-1 p-0 px-0' : 'mt-2'}`}>
          <div 
            ref={canvasContainerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            className={`relative w-full overflow-hidden ${
              isFullscreen 
                ? 'h-full rounded-none border-none' 
                : 'h-[calc(100vh-210px)] min-h-[480px] max-h-[720px] sm:h-[600px] rounded-2xl border border-stone-200 dark:border-stone-800'
            } bg-stone-100 dark:bg-stone-950 shadow-inner select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Background Blueprint / Parchment Grid */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
              style={{
                backgroundImage: 'radial-gradient(#b45309 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                backgroundPosition: `${panPosition.x % 24}px ${panPosition.y % 24}px`,
              }}
            />

            {/* Tree Nodes Canvas Layer with Pan & Zoom Transform */}
            <div 
              style={{ 
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
              }}
              className="absolute top-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-12 pointer-events-auto pb-16"
            >
              {treeRoots.length > 0 ? (
                <div className="flex gap-12 sm:gap-20 items-start justify-center p-8">
                  {treeRoots.map(rootNode => (
                    <RenderTreeNode key={rootNode.member.id} node={rootNode} isRoot />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-stone-500">
                  <Compass className="w-12 h-12 mx-auto text-amber-500/60 mb-2 animate-spin" />
                  <p className="text-sm font-semibold">Chưa có dữ liệu thành viên để dựng cây</p>
                  <button
                    onClick={() => onOpenAddMember()}
                    className="mt-3 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
                  >
                    Thêm Khởi Tổ đầu tiên
                  </button>
                </div>
              )}
            </div>

            {/* Floating Quick On-Canvas Zoom & Center Dock */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 bg-stone-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-stone-700/80 shadow-2xl text-stone-100">
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.4, Number((prev + 0.2).toFixed(2))))}
                className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-amber-600 flex items-center justify-center transition-colors text-white shadow-sm"
                title="Phóng to"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.3, Number((prev - 0.2).toFixed(2))))}
                className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-amber-600 flex items-center justify-center transition-colors text-white shadow-sm"
                title="Thu nhỏ"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetView}
                className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-amber-600 flex items-center justify-center transition-colors text-amber-300 hover:text-white shadow-sm"
                title="Căn giữa lại vị trí ban đầu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Top Left Compass badge */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none flex items-center gap-2 bg-stone-900/85 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-stone-700/60 text-[11px] text-stone-300 shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Chế độ kéo & lăn chuột</span>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: Generational Levels View */
        <div className="px-3 sm:px-4 mt-4 space-y-4 pb-12">
          <div className="space-y-4">
            {generationsList.map((genNumber) => {
              const genMembers = filteredMembers.filter(m => m.generation === genNumber);
              if (genMembers.length === 0 && selectedGeneration === 'all' && !searchQuery) return null;
              const isCollapsed = collapsedGenerations[genNumber] || false;

              return (
                <div 
                  key={genNumber} 
                  className="relative rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200 dark:border-stone-800 p-3 sm:p-4 shadow-sm overflow-hidden"
                >
                  {/* Generation Level Header Ribbon */}
                  <div 
                    onClick={() => toggleGenCollapse(genNumber)}
                    className="flex items-center justify-between cursor-pointer border-b border-stone-100 dark:border-stone-800 pb-2 mb-3 group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 text-white font-serif font-bold text-xs flex items-center justify-center shadow-sm">
                        {toRoman(genNumber)}
                      </span>
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm font-serif text-stone-900 dark:text-stone-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 flex items-center gap-1.5">
                          <span>Đời thứ {toRoman(genNumber)} (Thế hệ {genNumber})</span>
                          <span className="text-[11px] font-normal text-stone-500 dark:text-stone-400">
                            ({genMembers.length} thành viên)
                          </span>
                        </h3>
                        <p className="text-[10px] text-stone-500 dark:text-stone-400">
                          {getGenerationTitle(genNumber)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-stone-400">
                      <span className="text-[10px]">{isCollapsed ? 'Mở rộng' : 'Thu gọn'}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`} />
                    </div>
                  </div>

                  {/* Member Nodes in this Generation */}
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {genMembers.map((member) => {
                        const spouses = members.filter(m => member.spouseIds.includes(m.id));
                        const childrenCount = members.filter(m => m.parentIds.includes(member.id)).length;

                        return (
                          <div
                            key={member.id}
                            className="relative rounded-xl bg-stone-50/80 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/80 p-3 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                member.rank === 'truong'
                                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                  : member.rank === 'dau'
                                  ? 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                                  : 'bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-300'
                              }`}>
                                {member.rank === 'truong' ? 'Trưởng chi' : member.rank === 'dau' ? 'Dâu' : member.rank === 're' ? 'Rể' : 'Thứ'}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${member.isAlive ? 'bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900' : 'bg-stone-400'}`} />
                                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                                  {member.isAlive ? 'Còn sống' : 'Đã khuất'}
                                </span>
                              </div>
                            </div>

                            <div 
                              onClick={() => onSelectMember(member.id)}
                              className="flex items-start gap-3 cursor-pointer"
                            >
                              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-600/70 shrink-0 shadow-sm">
                                <img
                                  src={member.avatarUrl}
                                  alt={member.fullName}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                                  {member.fullName}
                                </h4>
                                {member.courtesyName && (
                                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium truncate">
                                    Tên tự: {member.courtesyName}
                                  </p>
                                )}
                                <p className="text-[10.5px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                                  {member.birthYear} - {member.isAlive ? 'Hiện tại' : member.deathYear || '?'}
                                </p>
                                {member.lunarDeathDate && (
                                  <p className="text-[10px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-0.5">
                                    <span>Giỗ: {member.lunarDeathDate}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {spouses.length > 0 && (
                              <div className="mt-2.5 pt-2 border-t border-stone-200 dark:border-stone-700/60 flex items-center gap-2">
                                <Heart className="w-3 h-3 text-rose-500 shrink-0" />
                                <div className="text-[10.5px] text-stone-600 dark:text-stone-300 truncate">
                                  <span>Phối ngẫu: </span>
                                  <span className="font-medium text-stone-800 dark:text-stone-200">
                                    {spouses.map(s => s.fullName).join(', ')}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="mt-2.5 pt-2 border-t border-stone-200 dark:border-stone-700/60 flex items-center justify-between text-xs">
                              <span className="text-[10.5px] text-stone-500 dark:text-stone-400 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{childrenCount} con</span>
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenAddMember(member.id, 'child');
                                  }}
                                  className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 hover:bg-amber-200 text-[10.5px] font-semibold flex items-center gap-0.5"
                                  title="Thêm con cho thành viên này"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>Thêm con</span>
                                </button>

                                <button
                                  onClick={() => onSelectMember(member.id)}
                                  className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                                  title="Xem chi tiết hồ sơ"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
