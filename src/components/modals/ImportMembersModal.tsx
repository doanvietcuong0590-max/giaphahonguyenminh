import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Users, 
  Info,
  HelpCircle
} from 'lucide-react';
import { Member, Gender, MemberRank } from '../../types';

interface ImportMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportMembers: (newMembers: Omit<Member, 'id'>[]) => void;
  currentMembers: Member[];
}

export const ImportMembersModal: React.FC<ImportMembersModalProps> = ({
  isOpen,
  onClose,
  onImportMembers,
  currentMembers,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedMembers, setParsedMembers] = useState<Omit<Member, 'id'>[]>([]);
  const [parseError, setParseError] = useState<string>('');
  const [step, setStep] = useState<'upload' | 'preview'>('upload');

  // Download template CSV
  const handleDownloadSample = () => {
    const csvHeader = 'Họ và tên,Tên chữ/tự,Giới tính(Nam/Nữ),Đời thứ(1,2,3...),Chi nhánh,Năm sinh,Còn sống(Có/Không),Năm mất,Ngày giỗ ÂL,Số điện thoại,Nghề nghiệp,Vai vế(Trưởng/Thứ/Dâu/Rể)\n';
    const csvRows = [
      'Nguyễn Văn An,Văn Phúc,Nam,5,Chi Ất - Nhánh Trưởng,1980,Có,,,0912345678,Kỹ sư,Trưởng',
      'Trần Thị Bích,,Nữ,5,Chi Ất - Nhánh Trưởng,1982,Có,,,0987654321,Giáo viên,Dâu',
      'Nguyễn Văn Bình,Hữu Đức,Nam,4,Chi Ất - Nhánh Trưởng,1950,Không,2020,15/07 ÂL,,Cán bộ hưu trí,Trưởng',
      'Nguyễn Minh Khôi,,Nam,6,Chi Ất - Nhánh Trưởng,2010,Có,,,0901234567,Học sinh,Thứ'
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_danh_sach_gia_pha.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process CSV/JSON text into Member objects
  const parseData = (rawText: string, name: string) => {
    setParseError('');
    try {
      if (name.endsWith('.json')) {
        const json = JSON.parse(rawText);
        let list: any[] = [];
        if (Array.isArray(json)) {
          list = json;
        } else if (json.members && Array.isArray(json.members)) {
          list = json.members;
        } else {
          throw new Error('Định dạng JSON không hợp lệ. Cần một mảng danh sách thành viên.');
        }

        const formatted: Omit<Member, 'id'>[] = list.map((item, idx) => ({
          fullName: item.fullName || `Thành viên ${idx + 1}`,
          courtesyName: item.courtesyName || '',
          tabooName: item.tabooName || '',
          gender: item.gender === 'female' || item.gender === 'Nữ' || item.gender === 'nu' ? 'female' : 'male',
          generation: Number(item.generation) || 5,
          branch: item.branch || 'Chi Ất',
          birthYear: Number(item.birthYear) || 1990,
          birthDate: item.birthDate || '',
          isAlive: item.isAlive !== undefined ? Boolean(item.isAlive) : true,
          deathYear: item.deathYear ? Number(item.deathYear) : undefined,
          deathDate: item.deathDate || '',
          lunarDeathDate: item.lunarDeathDate || '',
          burialPlace: item.burialPlace || '',
          rank: (item.rank as MemberRank) || 'truong',
          parentIds: Array.isArray(item.parentIds) ? item.parentIds : [],
          childIds: Array.isArray(item.childIds) ? item.childIds : [],
          spouseIds: Array.isArray(item.spouseIds) ? item.spouseIds : [],
          avatarUrl: item.avatarUrl || (item.gender === 'female' 
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'),
          bio: item.bio || '',
          phone: item.phone || '',
          profession: item.profession || '',
          address: item.address || '',
        }));

        setParsedMembers(formatted);
        setStep('preview');
        return;
      }

      // Default Parse CSV / Text lines
      const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length <= 1 && (lines[0]?.includes(',') || lines[0]?.includes(';'))) {
        throw new Error('Tệp không có dữ liệu thành viên hoặc chỉ có dòng tiêu đề.');
      }

      // Detect separator (comma or semicolon)
      const firstLine = lines[0];
      const sep = firstLine.includes(';') ? ';' : ',';

      // Skip header if it contains words like 'Họ' or 'Name'
      const startIdx = (lines[0].toLowerCase().includes('họ') || lines[0].toLowerCase().includes('name')) ? 1 : 0;
      const dataLines = lines.slice(startIdx);

      const formatted: Omit<Member, 'id'>[] = dataLines.map((line, idx) => {
        const parts = line.split(sep).map(p => p.trim().replace(/^["']|["']$/g, ''));
        const fullName = parts[0] || `Thành viên ${idx + 1}`;
        const courtesyName = parts[1] || '';
        const genderStr = (parts[2] || '').toLowerCase();
        const gender: Gender = (genderStr === 'nữ' || genderStr === 'female' || genderStr === 'nu') ? 'female' : 'male';
        const generation = Number(parts[3]) || 5;
        const branch = parts[4] || 'Chi Ất - Nhánh Trưởng';
        const birthYear = Number(parts[5]) || 1990;
        const isAliveStr = (parts[6] || '').toLowerCase();
        const isAlive = isAliveStr === 'không' || isAliveStr === 'false' || isAliveStr === 'mat' || isAliveStr === 'mất' ? false : true;
        const deathYear = parts[7] ? Number(parts[7]) : undefined;
        const lunarDeathDate = parts[8] || '';
        const phone = parts[9] || '';
        const profession = parts[10] || '';
        const rankStr = (parts[11] || '').toLowerCase();
        
        let rank: MemberRank = 'truong';
        if (rankStr.includes('thứ') || rankStr.includes('thu')) rank = 'thu';
        else if (rankStr.includes('dâu') || rankStr.includes('dau')) rank = 'dau';
        else if (rankStr.includes('rể') || rankStr.includes('re')) rank = 're';

        return {
          fullName,
          courtesyName,
          gender,
          generation,
          branch,
          birthYear,
          isAlive,
          deathYear,
          lunarDeathDate,
          phone,
          profession,
          rank,
          parentIds: [],
          childIds: [],
          spouseIds: [],
          avatarUrl: gender === 'female' 
            ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
        };
      });

      if (formatted.length === 0) {
        throw new Error('Không đọc được thành viên nào từ tệp đã chọn.');
      }

      setParsedMembers(formatted);
      setStep('preview');
    } catch (err: any) {
      setParseError(err.message || 'Lỗi đọc tệp tin. Vui lòng kiểm tra lại định dạng CSV / Excel / JSON.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      parseData(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (parsedMembers.length === 0) return;
    onImportMembers(parsedMembers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-amber-50 flex items-center justify-between border-b border-amber-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-600/30 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base font-serif text-amber-100">
                Thêm Thành Viên Hàng Loạt Bằng Tệp Tin
              </h3>
              <p className="text-[11px] text-amber-300/80">
                Hỗ trợ tệp bảng tính CSV, Excel (xuất CSV) hoặc tệp sao lưu JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 text-stone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {step === 'upload' ? (
            <div className="space-y-4">
              {/* Template Download Prompt */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-stone-800/80 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-stone-900 dark:text-stone-100">
                      Chưa có tệp mẫu theo chuẩn?
                    </h5>
                    <p className="text-[11px] text-stone-600 dark:text-stone-300">
                      Tải tệp mẫu CSV (Excel) đã được điền sẵn các cột họ tên, đời thứ, ngày giỗ, năm sinh.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải tệp mẫu (.CSV)</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-amber-600/40 hover:border-amber-600 dark:border-stone-700 hover:bg-amber-50/40 dark:hover:bg-stone-800/40 rounded-3xl text-center cursor-pointer transition-all space-y-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  Nhấn để chọn tệp tin từ máy tính / điện thoại
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                  Hỗ trợ định dạng <strong>.CSV</strong> (từ Microsoft Excel / Google Sheets) hoặc <strong>.JSON</strong> sao lưu
                </p>
              </div>

              {parseError && (
                <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}
            </div>
          ) : (
            /* Step Preview */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h5 className="font-bold text-stone-900 dark:text-stone-100">
                      Đã đọc thành công {parsedMembers.length} thành viên từ tệp:
                    </h5>
                    <p className="text-[11px] text-stone-500 font-mono">{fileName}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="text-xs text-amber-600 hover:underline font-semibold"
                >
                  Chọn tệp khác
                </button>
              </div>

              {/* Members Preview Table */}
              <div className="border border-stone-200 dark:border-stone-700 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold sticky top-0">
                    <tr>
                      <th className="p-2 border-b border-stone-200 dark:border-stone-700">#</th>
                      <th className="p-2 border-b border-stone-200 dark:border-stone-700">Họ và tên</th>
                      <th className="p-2 border-b border-stone-200 dark:border-stone-700">Giới tính</th>
                      <th className="p-2 border-b border-stone-200 dark:border-stone-700">Đời thứ</th>
                      <th className="p-2 border-b border-stone-200 dark:border-stone-700">Năm sinh</th>
                      <th className="p-2 border-b border-stone-200 dark:border-stone-700">Trạng thái</th>
                      <th className="p-2 border-b border-stone-200 dark:border-stone-700">Chi nhánh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {parsedMembers.map((m, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/40 dark:hover:bg-stone-800/40">
                        <td className="p-2 font-mono text-stone-400">{idx + 1}</td>
                        <td className="p-2 font-bold text-stone-900 dark:text-stone-100">{m.fullName}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            m.gender === 'male' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {m.gender === 'male' ? 'Nam' : 'Nữ'}
                          </span>
                        </td>
                        <td className="p-2 font-bold text-amber-700 dark:text-amber-400">Đời {m.generation}</td>
                        <td className="p-2 font-mono">{m.birthYear}</td>
                        <td className="p-2">
                          {m.isAlive ? (
                            <span className="text-emerald-600 font-medium">Còn sống</span>
                          ) : (
                            <span className="text-stone-400">Đã mất ({m.deathYear || 'K rõ'})</span>
                          )}
                        </td>
                        <td className="p-2 text-stone-500 truncate max-w-[120px]">{m.branch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800"
          >
            Hủy bỏ
          </button>

          {step === 'preview' && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Users className="w-4 h-4" />
              <span>Nhập {parsedMembers.length} thành viên vào cây gia phả</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
