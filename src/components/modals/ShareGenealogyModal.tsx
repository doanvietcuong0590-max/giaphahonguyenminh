import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Users, 
  ShieldCheck, 
  Sparkles,
  Send
} from 'lucide-react';
import { GenealogyTree } from '../../types';

interface ShareGenealogyModalProps {
  isOpen: boolean;
  tree: GenealogyTree;
  onClose: () => void;
}

export const ShareGenealogyModal: React.FC<ShareGenealogyModalProps> = ({
  isOpen,
  tree,
  onClose,
}) => {
  if (!isOpen) return null;

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedToast, setSharedToast] = useState('');

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(tree.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const inviteLink = `https://coinguon.heritage.vn/join?code=${tree.code}`;
    navigator.clipboard?.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSimulateShare = (channel: string) => {
    setSharedToast(`Đã mở liên kết mời qua ${channel}!`);
    setTimeout(() => setSharedToast(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto text-center">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-50 flex items-center justify-between border-b border-amber-800/60">
          <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-full bg-amber-600/40 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm font-serif text-amber-100">
                Mời Người Thân Vào Gia Phả
              </h3>
              <p className="text-[11px] text-amber-300/80 truncate max-w-[200px]">
                {tree.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-stone-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* QR Code Frame */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/80 border-2 border-amber-500/40 inline-block shadow-inner space-y-2">
            <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-xl border border-amber-300 shadow-sm flex items-center justify-center relative group">
              {/* QR Pattern Representation */}
              <div className="w-full h-full bg-stone-900 rounded flex flex-col items-center justify-center p-2 text-amber-400">
                <QrCode className="w-24 h-24 stroke-[1.5]" />
              </div>
            </div>
            <p className="text-[11px] text-amber-900 dark:text-amber-300 font-serif font-bold">
              Quét mã QR để mở gia phả
            </p>
          </div>

          {/* Clan Code Box */}
          <div className="space-y-1.5 text-left">
            <label className="font-bold text-stone-700 dark:text-stone-300 block text-xs">
              Mã kết nối dòng tộc:
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700">
              <span className="font-mono text-base font-extrabold tracking-widest text-amber-800 dark:text-amber-400">
                {tree.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          {/* Share Channels */}
          <div className="space-y-2">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold block">
              Hoặc gửi trực tiếp cho người thân qua:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSimulateShare('Zalo')}
                className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100 transition-colors text-xs"
              >
                Zalo
              </button>
              <button
                onClick={() => handleSimulateShare('Messenger')}
                className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold hover:bg-indigo-100 transition-colors text-xs"
              >
                Messenger
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition-colors text-xs flex items-center justify-center gap-1"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Đã chép link' : 'Chép link'}</span>
              </button>
            </div>
          </div>

          {sharedToast && (
            <div className="p-2 rounded-lg bg-emerald-600 text-white font-bold text-xs animate-fade-in">
              {sharedToast}
            </div>
          )}

          <div className="pt-2 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800">
            🔒 Người thân khi tham gia sẽ được xếp đúng cành nhánh và cần Quản trị viên duyệt để bảo mật thông tin dòng họ.
          </div>
        </div>
      </div>
    </div>
  );
};
