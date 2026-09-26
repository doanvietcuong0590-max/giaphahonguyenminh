import React, { useState, useRef, useMemo } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  GitFork, 
  BookOpen, 
  SlidersHorizontal, 
  Eye, 
  Check, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Palette,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Award
} from 'lucide-react';
import { GenealogyTree, Member } from '../../types';
import { buildFamilyTree, TreeNode, toRoman, getGenerationTitle } from '../../utils/treeUtils';

interface PrintGenealogyModalProps {
  isOpen: boolean;
  onClose: () => void;
  tree: GenealogyTree;
  members: Member[];
}

type PrintTemplate = 'poster' | 'ledger' | 'branch_tree';
type PaperSize = 'a4_landscape' | 'a4_portrait' | 'a3_landscape' | 'poster_large';
type ColorTheme = 'heritage' | 'monochrome';

export const PrintGenealogyModal: React.FC<PrintGenealogyModalProps> = ({
  isOpen,
  onClose,
  tree,
  members,
}) => {
  if (!isOpen) return null;

  // Options State
  const [template, setTemplate] = useState<PrintTemplate>('poster');
  const [paperSize, setPaperSize] = useState<PaperSize>('a4_landscape');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('heritage');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [maxGenFilter, setMaxGenFilter] = useState<number>(10);

  // Detail toggles
  const [showAvatars, setShowAvatars] = useState<boolean>(true);
  const [showCourtesyNames, setShowCourtesyNames] = useState<boolean>(true);
  const [showLunarDates, setShowLunarDates] = useState<boolean>(true);
  const [showSpouses, setShowSpouses] = useState<boolean>(true);
  const [showCouplets, setShowCouplets] = useState<boolean>(true);
  const [showMotto, setShowMotto] = useState<boolean>(true);

  // Preview zoom & full preview
  const [previewZoom, setPreviewZoom] = useState<number>(0.85);
  const [isFullPreview, setIsFullPreview] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [printSuccessMsg, setPrintSuccessMsg] = useState<string>('');

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Filtered members based on options
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchBranch = selectedBranch === 'all' || m.branch === selectedBranch || m.branch.includes(selectedBranch);
      const matchGen = m.generation <= maxGenFilter;
      return matchBranch && matchGen;
    });
  }, [members, selectedBranch, maxGenFilter]);

  // Build tree from filtered members
  const treeRoots = useMemo(() => {
    return buildFamilyTree(filteredMembers);
  }, [filteredMembers]);

  // Extract available branches
  const availableBranches = useMemo(() => {
    const branches = new Set<string>();
    members.forEach(m => {
      if (m.branch) branches.add(m.branch);
    });
    return Array.from(branches);
  }, [members]);

  const maxGenerationInTree = useMemo(() => {
    return Math.max(...members.map(m => m.generation || 1), 1);
  }, [members]);

  // Group members by generation for Ledger template
  const membersByGeneration = useMemo(() => {
    const grouped: Record<number, Member[]> = {};
    filteredMembers.forEach(m => {
      if (!grouped[m.generation]) grouped[m.generation] = [];
      grouped[m.generation].push(m);
    });
    // Sort each generation
    Object.keys(grouped).forEach(genStr => {
      const g = Number(genStr);
      grouped[g].sort((a, b) => {
        const rankOrder: Record<string, number> = { truong: 1, thu: 2, dau: 3, re: 4, khac: 5 };
        const rA = rankOrder[a.rank] || 99;
        const rB = rankOrder[b.rank] || 99;
        if (rA !== rB) return rA - rB;
        return Number(a.birthYear) - Number(b.birthYear);
      });
    });
    return grouped;
  }, [filteredMembers]);

  // Direct Print handler using hidden iframe for 100% reliable printing
  const handlePrint = () => {
    setIsPrinting(true);
    const printContent = printAreaRef.current;
    if (!printContent) {
      setIsPrinting(false);
      return;
    }

    // Create an iframe to print cleanly without UI interference
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      setIsPrinting(false);
      window.print();
      return;
    }

    const isLandscape = paperSize.includes('landscape') || paperSize === 'poster_large';
    const isMonochrome = colorTheme === 'monochrome';

    const pageOrientationCSS = isLandscape 
      ? '@page { size: landscape; margin: 8mm; }' 
      : '@page { size: portrait; margin: 10mm; }';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${tree.name} - Phả Đồ Bản In Trang Trọng</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            ${pageOrientationCSS}
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 10px;
              color: #1c1917;
              background-color: #ffffff;
            }
            .font-serif { font-family: 'Playfair Display', Georgia, serif; }
            .font-display { font-family: 'Cinzel', serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid ${isMonochrome ? '#333' : '#b45309'}; padding: 6px 8px; text-align: left; }
            th { background-color: ${isMonochrome ? '#f0f0f0' : '#fef3c7'}; }
            img { max-width: 100%; height: auto; }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setIsPrinting(false);
      setPrintSuccessMsg('Lệnh in / Lưu PDF đã được gửi tới hệ thống!');
      setTimeout(() => setPrintSuccessMsg(''), 4000);
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 500);
  };

  // Export standalone HTML file for archiving or opening in any browser to print
  const handleExportHtml = () => {
    const printContent = printAreaRef.current;
    if (!printContent) return;

    const isLandscape = paperSize.includes('landscape') || paperSize === 'poster_large';
    const isMonochrome = colorTheme === 'monochrome';

    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${tree.name} - Phả Đồ Bản In Trang Trọng</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: ${isLandscape ? 'landscape' : 'portrait'}; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 24px;
      background: #fafaf9;
      color: #1c1917;
    }
    .font-serif { font-family: 'Playfair Display', Georgia, serif; }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #b45309;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    }
    @media print {
      .print-button { display: none !important; }
      body { background: white; padding: 0; }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">In hoặc Lưu PDF (Ctrl + P)</button>
  <div style="max-width: 1200px; margin: 0 auto; background: white; padding: 24px; box-shadow: 0 0 20px rgba(0,0,0,0.05);">
    ${printContent.innerHTML}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `PhaDo_${tree.name.replace(/\s+/g, '_')}_Print_Export.html`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    setPrintSuccessMsg('Đã xuất tệp HTML in ấn! Bạn có thể mở tệp và nhấn Ctrl+P để lưu PDF bất kỳ lúc nào.');
    setTimeout(() => setPrintSuccessMsg(''), 4500);
  };

  // Render tree node in Poster view
  const renderPosterNode = (node: TreeNode) => {
    const isHeritage = colorTheme === 'heritage';
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.member.id} className="flex flex-col items-center">
        {/* Member Box */}
        <div 
          className="relative px-3 py-2 rounded-xl text-center shadow-sm"
          style={{
            minWidth: '150px',
            maxWidth: '180px',
            border: `2px solid ${isHeritage ? (node.member.rank === 'truong' ? '#d97706' : '#92400e') : '#444'}`,
            backgroundColor: isHeritage 
              ? (node.member.rank === 'truong' ? '#fffbeb' : '#ffffff') 
              : '#ffffff',
          }}
        >
          {/* Header generation badge */}
          <div 
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mb-1"
            style={{
              backgroundColor: isHeritage ? '#92400e' : '#333',
              color: '#ffffff',
            }}
          >
            Đời thứ {toRoman(node.member.generation)} ({node.member.generation})
          </div>

          {/* Avatar if enabled */}
          {showAvatars && (
            <div className="w-10 h-10 rounded-full mx-auto my-1 overflow-hidden border border-amber-600/60">
              <img 
                src={node.member.avatarUrl} 
                alt={node.member.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Member Name */}
          <div className="font-serif font-bold text-xs leading-tight text-stone-950">
            {node.member.fullName}
          </div>

          {/* Courtesy / Taboo Name */}
          {showCourtesyNames && node.member.courtesyName && (
            <div className="text-[10px] text-amber-900 italic">
              Tự: {node.member.courtesyName}
            </div>
          )}

          {/* Life span */}
          <div className="text-[9.5px] font-mono text-stone-700 mt-0.5">
            ({node.member.birthYear} - {node.member.isAlive ? 'Nay' : (node.member.deathYear || '?')})
          </div>

          {/* Lunar Death Date & Burial */}
          {showLunarDates && !node.member.isAlive && (node.member.lunarDeathDate || node.member.burialPlace) && (
            <div className="text-[8.5px] text-stone-600 mt-0.5 border-t border-stone-200 pt-0.5">
              {node.member.lunarDeathDate && <div>Kỵ: {node.member.lunarDeathDate}</div>}
              {node.member.burialPlace && <div className="truncate">Mộ: {node.member.burialPlace}</div>}
            </div>
          )}

          {/* Spouse tag if enabled */}
          {showSpouses && node.spouses && node.spouses.length > 0 && (
            <div className="mt-1 pt-1 border-t border-amber-200 text-[9px] text-rose-800 font-medium">
              Phối: {node.spouses.map(s => s.fullName).join(', ')}
            </div>
          )}
        </div>

        {/* Children Branching lines */}
        {hasChildren && (
          <div className="flex flex-col items-center w-full mt-2">
            {/* Vertical connector down */}
            <div 
              style={{ width: '2px', height: '16px', backgroundColor: isHeritage ? '#b45309' : '#555' }} 
            />

            {/* Horizontal distributor bar */}
            {node.children.length > 1 && (
              <div 
                style={{
                  height: '2px',
                  backgroundColor: isHeritage ? '#b45309' : '#555',
                  width: 'calc(100% - 60px)',
                  maxWidth: '96%',
                  marginBottom: '10px'
                }}
              />
            )}

            {/* Sub-children */}
            <div className="flex gap-4 items-start pt-1">
              {node.children.map(childNode => renderPosterNode(childNode))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const isHeritage = colorTheme === 'heritage';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[95vh]">
        
        {/* 1. Modal Top Bar */}
        <div className="p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-50 flex items-center justify-between border-b border-amber-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-600/40 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif text-amber-100 flex items-center gap-2">
                <span>In Ấn Phả Đồ & Xuất Tệp PDF Dòng Họ</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans border border-amber-500/30">
                  Chuẩn Nghi Lễ
                </span>
              </h3>
              <p className="text-[11px] text-amber-300/80">
                {tree.name} • {tree.branchName || tree.branch}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success toast inside modal */}
        {printSuccessMsg && (
          <div className="bg-emerald-700 text-white text-xs font-semibold px-4 py-2 flex items-center gap-2 animate-fade-in shadow-inner">
            <Check className="w-4 h-4 text-emerald-200" />
            <span>{printSuccessMsg}</span>
          </div>
        )}

        {/* 2. Main Content Split: Options Panel (Left) & Live HD Print Preview (Right) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-stone-200 dark:divide-stone-800">
          
          {/* Left Column: Print Settings & Customizations (4 cols) */}
          <div className="lg:col-span-4 p-4 sm:p-5 space-y-4 bg-stone-50/80 dark:bg-stone-900/50 text-xs overflow-y-auto">
            
            {/* Template Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                <span>Mẫu Trình Bày Bản In</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTemplate('poster');
                    setPaperSize('a4_landscape');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    template === 'poster'
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-500/30'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${template === 'poster' ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-stone-900 dark:text-stone-100">1. Phả Đồ Toàn Cảnh (Heritage Tree)</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">Khung viền trang trọng, hoành phi câu đối, sơ đồ nhánh treo từ đường</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTemplate('ledger');
                    setPaperSize('a4_portrait');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    template === 'ledger'
                      ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-500/30'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${template === 'ledger' ? 'bg-amber-600 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block text-stone-900 dark:text-stone-100">2. Tộc Phả Ký (Genealogy Book / Sổ Kê Khai)</span>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400">Bảng biểu chi tiết từng đời: thế thứ, tự húy, ngày giỗ, mộ phần</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Paper Size & Color Mode */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 block">Khổ giấy in:</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value as PaperSize)}
                  className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="a4_landscape">A4 Ngang (Phổ biến)</option>
                  <option value="a4_portrait">A4 Dọc (Sổ phả ký)</option>
                  <option value="a3_landscape">A3 Ngang (Khổ to rõ)</option>
                  <option value="poster_large">Khổ Lớn Poster (Từ đường)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 block">Màu sắc bản in:</label>
                <select
                  value={colorTheme}
                  onChange={(e) => setColorTheme(e.target.value as ColorTheme)}
                  className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="heritage">Hoàng Gia (Vàng son cổ)</option>
                  <option value="monochrome">Đen Trắng (Tiết kiệm mực)</option>
                </select>
              </div>
            </div>

            {/* Filter by Branch & Generations */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 block">Chi / Nhánh in:</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Toàn bộ dòng họ</option>
                  {availableBranches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-stone-300 block">Đến đời thứ:</label>
                <select
                  value={maxGenFilter}
                  onChange={(e) => setMaxGenFilter(Number(e.target.value))}
                  className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
                >
                  {Array.from({ length: maxGenerationInTree }, (_, i) => i + 1).map(g => (
                    <option key={g} value={g}>Đời {toRoman(g)} (Thế hệ {g})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Display Toggles */}
            <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-stone-700">
              <span className="font-bold text-stone-800 dark:text-stone-200 block">
                Tùy chọn hiển thị chi tiết:
              </span>
              
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={showAvatars}
                    onChange={(e) => setShowAvatars(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Ảnh chân dung</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={showCourtesyNames}
                    onChange={(e) => setShowCourtesyNames(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Tên tự / Tên húy</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={showLunarDates}
                    onChange={(e) => setShowLunarDates(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Ngày Âm & Mộ phần</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={showSpouses}
                    onChange={(e) => setShowSpouses(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Dâu / Rể (Phối ngẫu)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={showCouplets}
                    onChange={(e) => setShowCouplets(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Câu đối hoành phi</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={showMotto}
                    onChange={(e) => setShowMotto(e.target.checked)}
                    className="rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Gia huấn tộc ước</span>
                </label>
              </div>
            </div>

            {/* Action Buttons Box */}
            <div className="pt-3 border-t border-stone-200 dark:border-stone-700 space-y-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>{isPrinting ? 'Đang chuẩn bị bản in...' : 'In Ngay / Lưu PDF (Print)'}</span>
              </button>

              <button
                type="button"
                onClick={handleExportHtml}
                className="w-full py-2 px-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-600" />
                <span>Tải Tệp HTML In Ấn Sắc Nét</span>
              </button>
              
              <p className="text-[10.5px] text-stone-500 dark:text-stone-400 text-center leading-relaxed">
                💡 Trong cửa sổ in của trình duyệt, chọn <b>"Save as PDF"</b> tại mục Destination để lưu thành tệp PDF trên máy.
              </p>
            </div>
          </div>

          {/* Right Column: Live HD Print Preview (8 cols) */}
          <div className="lg:col-span-8 bg-stone-200/80 dark:bg-stone-950 p-3 sm:p-5 flex flex-col items-center overflow-y-auto">
            {/* Preview Toolbar */}
            <div className="w-full flex items-center justify-between gap-2 pb-3 max-w-3xl">
              <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-300 font-medium">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>Xem trước trực quan ({filteredMembers.length} thành viên)</span>
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-1 rounded-xl border border-stone-300 dark:border-stone-700 shadow-sm">
                <button
                  type="button"
                  onClick={() => setPreviewZoom(prev => Math.max(0.4, Number((prev - 0.1).toFixed(2))))}
                  className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300"
                  title="Thu nhỏ xem trước"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 px-1.5">
                  {Math.round(previewZoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(prev => Math.min(1.4, Number((prev + 0.1).toFixed(2))))}
                  className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300"
                  title="Phóng to xem trước"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(0.85)}
                  className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500"
                  title="Khôi phục kích thước xem trước"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Preview Paper Canvas */}
            <div className="w-full overflow-auto flex justify-center py-2 scrollbar-thin">
              <div 
                style={{ 
                  transform: `scale(${previewZoom})`, 
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out'
                }}
              >
                {/* Paper Container - Bound with ID for extraction */}
                <div 
                  ref={printAreaRef}
                  id="print-genealogy-canvas"
                  className={`bg-white text-stone-900 shadow-2xl p-6 sm:p-8 rounded-lg border-2 ${
                    isHeritage ? 'border-amber-700' : 'border-stone-800'
                  }`}
                  style={{
                    width: paperSize.includes('landscape') || paperSize === 'poster_large' ? '1080px' : '790px',
                    minHeight: '650px',
                    boxSizing: 'border-box',
                    backgroundColor: isHeritage ? '#fffdfa' : '#ffffff'
                  }}
                >
                  {/* Outer Ornamental Frame */}
                  <div 
                    className="p-4 sm:p-6 rounded border-2 border-dashed"
                    style={{
                      borderColor: isHeritage ? '#b45309' : '#444'
                    }}
                  >
                    {/* Header: Hoành phi, Quốc hiệu, Tiêu đề Gia tộc */}
                    <div className="text-center space-y-2 mb-6 pb-4 border-b-2" style={{ borderColor: isHeritage ? '#b45309' : '#333' }}>
                      {/* Traditional Couplets / Hoành phi */}
                      {showCouplets && (
                        <div className="flex items-center justify-center gap-4 text-xs font-serif font-bold uppercase tracking-widest text-amber-900">
                          <span style={{ color: isHeritage ? '#92400e' : '#333' }}>❖ ẨM HÀ TƯ NGUYÊN ❖</span>
                          <span style={{ color: isHeritage ? '#b45309' : '#555' }}>•</span>
                          <span style={{ color: isHeritage ? '#92400e' : '#333' }}>❖ MỘC BẢN THỦY NGUYÊN ❖</span>
                        </div>
                      )}

                      {/* Clan Logo if available */}
                      {tree.avatarUrl && (
                        <div className="flex justify-center my-1">
                          <div 
                            className="w-14 h-14 rounded-full p-0.5 shadow-sm border-2 overflow-hidden"
                            style={{ borderColor: isHeritage ? '#b45309' : '#333' }}
                          >
                            <img
                              src={tree.avatarUrl}
                              alt="Logo dòng họ"
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      {/* Main Title */}
                      <h1 
                        className="text-2xl sm:text-3xl font-extrabold font-serif tracking-wide uppercase"
                        style={{ color: isHeritage ? '#78350f' : '#111' }}
                      >
                        GIA PHẢ ĐỒ - {tree.name}
                      </h1>
                      
                      <div className="text-xs font-medium text-stone-700 flex items-center justify-center gap-2">
                        <span>Chi phái: <b>{tree.branchName || tree.branch || 'Chính Chi'}</b></span>
                        <span>•</span>
                        <span>Khởi thủy: <b>{tree.establishedYear || 'Tiền Triều'}</b></span>
                        <span>•</span>
                        <span>Nguyên quán: <b>{tree.origin || tree.originPlace || 'Việt Nam'}</b></span>
                      </div>

                      {/* Motto / Tộc ước */}
                      {showMotto && tree.motto && (
                        <div 
                          className="max-w-xl mx-auto mt-2 p-2 rounded text-xs italic font-serif"
                          style={{
                            backgroundColor: isHeritage ? '#fef3c7' : '#f5f5f4',
                            border: `1px solid ${isHeritage ? '#fde68a' : '#e7e5e4'}`,
                            color: isHeritage ? '#92400e' : '#333'
                          }}
                        >
                          "{tree.motto}"
                        </div>
                      )}
                    </div>

                    {/* Template 1: Poster Visual Tree */}
                    {template === 'poster' && (
                      <div className="py-4 overflow-x-auto flex justify-center">
                        <div className="flex flex-col items-center gap-6">
                          {treeRoots.map(rootNode => renderPosterNode(rootNode))}
                        </div>
                      </div>
                    )}

                    {/* Template 2: Detailed Ledger (Tộc Phả Ký) */}
                    {template === 'ledger' && (
                      <div className="space-y-6">
                        {Object.keys(membersByGeneration).map(genStr => {
                          const genNumber = Number(genStr);
                          const genMembers = membersByGeneration[genNumber];

                          return (
                            <div key={genNumber} className="space-y-2">
                              <div 
                                className="px-3 py-1.5 font-serif font-bold text-xs sm:text-sm rounded flex items-center justify-between"
                                style={{
                                  backgroundColor: isHeritage ? '#fef3c7' : '#f5f5f4',
                                  color: isHeritage ? '#92400e' : '#111',
                                  borderLeft: `4px solid ${isHeritage ? '#b45309' : '#333'}`
                                }}
                              >
                                <span>{getGenerationTitle(genNumber)} ({genMembers.length} vị)</span>
                                <span className="text-[11px] font-sans font-medium">Đời thứ {toRoman(genNumber)}</span>
                              </div>

                              <table className="w-full text-[11px] border-collapse">
                                <thead>
                                  <tr style={{ backgroundColor: isHeritage ? '#fffbeb' : '#f0f0f0' }}>
                                    <th className="p-1.5 border border-stone-300 w-10 text-center">STT</th>
                                    {showAvatars && <th className="p-1.5 border border-stone-300 w-12 text-center">Ảnh</th>}
                                    <th className="p-1.5 border border-stone-300">Họ và Tên</th>
                                    {showCourtesyNames && <th className="p-1.5 border border-stone-300">Tên Tự / Húy</th>}
                                    <th className="p-1.5 border border-stone-300 w-24">Năm sinh - mất</th>
                                    <th className="p-1.5 border border-stone-300 w-16 text-center">Thứ bậc</th>
                                    {showLunarDates && <th className="p-1.5 border border-stone-300">Ngày Kỵ & Mộ Phần</th>}
                                    {showSpouses && <th className="p-1.5 border border-stone-300">Phối Ngẫu (Vợ/Chồng)</th>}
                                  </tr>
                                </thead>
                                <tbody>
                                  {genMembers.map((m, idx) => {
                                    const spouseNames = (m.spouseIds || [])
                                      .map(id => members.find(mem => mem.id === id)?.fullName)
                                      .filter(Boolean)
                                      .join(', ');

                                    return (
                                      <tr key={m.id} className="hover:bg-amber-50/50">
                                        <td className="p-1.5 border border-stone-300 text-center font-mono">{idx + 1}</td>
                                        {showAvatars && (
                                          <td className="p-1 border border-stone-300 text-center">
                                            <img 
                                              src={m.avatarUrl} 
                                              alt={m.fullName}
                                              referrerPolicy="no-referrer"
                                              className="w-8 h-8 rounded-full object-cover mx-auto border"
                                            />
                                          </td>
                                        )}
                                        <td className="p-1.5 border border-stone-300 font-serif font-bold text-stone-900">
                                          {m.fullName}
                                          {m.isAlive && <span className="ml-1 text-[9px] text-emerald-700 font-sans font-normal">(Đang sinh sống)</span>}
                                        </td>
                                        {showCourtesyNames && (
                                          <td className="p-1.5 border border-stone-300 italic text-stone-700">
                                            {m.courtesyName || m.tabooName || '-'}
                                          </td>
                                        )}
                                        <td className="p-1.5 border border-stone-300 font-mono text-stone-800">
                                          {m.birthYear} - {m.isAlive ? 'Nay' : (m.deathYear || '?')}
                                        </td>
                                        <td className="p-1.5 border border-stone-300 text-center">
                                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-semibold bg-stone-100 border">
                                            {m.rank === 'truong' ? 'Trưởng' : m.rank === 'dau' ? 'Dâu' : m.rank === 're' ? 'Rể' : 'Thứ'}
                                          </span>
                                        </td>
                                        {showLunarDates && (
                                          <td className="p-1.5 border border-stone-300 text-stone-700 text-[10px]">
                                            {m.lunarDeathDate && <div>Giỗ: {m.lunarDeathDate}</div>}
                                            {m.burialPlace && <div>Mộ: {m.burialPlace}</div>}
                                            {!m.lunarDeathDate && !m.burialPlace && '-'}
                                          </td>
                                        )}
                                        {showSpouses && (
                                          <td className="p-1.5 border border-stone-300 text-rose-900 font-medium">
                                            {spouseNames || '-'}
                                          </td>
                                        )}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Footer: Nghi thức Phụng Lập & Chữ ký Tộc Trưởng */}
                    <div 
                      className="mt-8 pt-4 border-t-2 grid grid-cols-2 text-center text-xs font-serif"
                      style={{ borderColor: isHeritage ? '#b45309' : '#333' }}
                    >
                      <div className="space-y-1">
                        <p className="font-bold uppercase tracking-wider text-amber-900" style={{ color: isHeritage ? '#92400e' : '#333' }}>
                          BAN TRỊ SỰ TỘC BIÊN SOẠN
                        </p>
                        <p className="text-[10px] text-stone-500 italic">Chứng thực thông tin phả hệ</p>
                        <div className="h-12 flex items-center justify-center text-stone-400 italic text-[11px]">
                          (Ký & Đóng dấu dòng họ)
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-[11px] text-stone-600">
                          Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                        </p>
                        <p className="font-bold uppercase tracking-wider text-amber-900" style={{ color: isHeritage ? '#92400e' : '#333' }}>
                          TRƯỞNG TỘC PHỤNG LẬP
                        </p>
                        <div className="h-12 flex items-center justify-center text-stone-400 italic text-[11px]">
                          (Ký tên & Điểm chỉ)
                        </div>
                      </div>
                    </div>

                    <div className="text-center mt-4 text-[9.5px] text-stone-400 font-mono">
                      Phần mềm Cội Nguồn • Bản in lưu truyền từ đường vĩnh cửu
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
