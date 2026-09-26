import React, { useState } from 'react';
import { 
  X, 
  GitFork, 
  MapPin, 
  ShieldCheck, 
  Building, 
  User, 
  BookOpen, 
  Sparkles,
  Check
} from 'lucide-react';
import { GenealogyTree } from '../../types';

interface CreateGenealogyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTree: (tree: Omit<GenealogyTree, 'id'>) => void;
}

export const CreateGenealogyModal: React.FC<CreateGenealogyModalProps> = ({
  isOpen,
  onClose,
  onCreateTree,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('Gia Phả Họ Nguyễn');
  const [branch, setBranch] = useState('Chi Phái Ất - Thừa Thiên Huế');
  const [ancestralHallAddress, setAncestralHallAddress] = useState('Thôn Kim Long, Huyện Hương Trà, Tỉnh Thừa Thiên Huế');
  const [originPlace, setOriginPlace] = useState('Kim Long, Hương Trà, Huế');
  const [patriarchName, setPatriarchName] = useState('Nguyễn Văn Khởi');
  const [clanRules, setClanRules] = useState('Uống nước nhớ nguồn - Kính trên nhường dưới - Hiếu nghĩa vẹn toàn');
  const [generationCount, setGenerationCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const randomCode = 'HONGUYEN-' + Math.floor(1000 + Math.random() * 9000);

    onCreateTree({
      name: name.trim(),
      branch: branch.trim(),
      ancestralHallAddress: ancestralHallAddress.trim(),
      originPlace: originPlace.trim(),
      patriarchName: patriarchName.trim(),
      clanRules: clanRules.trim(),
      generationCount: Number(generationCount) || 1,
      totalMembers: 1,
      livingMembers: 1,
      code: randomCode,
      avatarUrl: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=400',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-50 flex items-center justify-between border-b border-amber-800/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-600/40 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif text-amber-100">
                Tạo Mới Gia Phả Dòng Họ
              </h3>
              <p className="text-[11px] text-amber-300/80">
                Khởi tạo thông tin chung, từ đường & gia quy dòng tộc
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
          <div className="space-y-1">
            <label className="font-bold text-stone-700 dark:text-stone-300">
              Tên gia phả / Tên họ tộc <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Gia Phả Họ Nguyễn, Họ Trần..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-semibold focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-600 dark:text-stone-400">Chi phái / Nhánh tộc</label>
              <input
                type="text"
                placeholder="Ví dụ: Chi Ất - Nhánh Trưởng"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-600 dark:text-stone-400">Số đời ước tính</label>
              <select
                value={generationCount}
                onChange={(e) => setGenerationCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 font-semibold"
              >
                {[3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                  <option key={g} value={g}>{g} Thế hệ (Đời)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">
              Quê hương phát tích (Gốc tích tiên tổ)
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Ví dụ: Kim Long, Hương Trà, Huế"
                value={originPlace}
                onChange={(e) => setOriginPlace(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">
              Địa chỉ Nhà thờ họ (Từ đường)
            </label>
            <div className="relative">
              <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Thôn Kim Long, Huyện Hương Trà, Thừa Thiên Huế"
                value={ancestralHallAddress}
                onChange={(e) => setAncestralHallAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">
              Danh tính Cụ Tổ khởi dựng (Thủy Tổ)
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Ví dụ: Cụ Nguyễn Văn Khởi (Đời thứ 1)"
                value={patriarchName}
                onChange={(e) => setPatriarchName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700 dark:text-stone-300">
              Gia huấn & Lời răn dạy của dòng tộc (Tộc ước)
            </label>
            <textarea
              rows={3}
              placeholder="Lời răn dạy của tổ tông..."
              value={clanRules}
              onChange={(e) => setClanRules(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Khởi tạo gia phả</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
