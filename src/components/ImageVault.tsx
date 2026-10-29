import React, { useState, useRef } from 'react';
import {
  Upload,
  Images,
  Trash2,
  Plus,
  Eye,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  FolderDown,
  X,
  FileImage,
} from 'lucide-react';
import { VaultImage, fileToOptimizedDataUrl, urlToOptimizedDataUrl } from '../utils/storage';
import { STARTER_IMAGES } from '../data/starterData';

interface ImageVaultProps {
  images: VaultImage[];
  onAddImages: (newImages: VaultImage[]) => void;
  onDeleteImage: (id: string) => void;
  onClearAll: () => void;
  onLoadStarterPack: () => Promise<void>;
  isLoadingStarter: boolean;
  onStartPlaying: () => void;
}

export const ImageVault: React.FC<ImageVaultProps> = ({
  images,
  onAddImages,
  onDeleteImage,
  onClearAll,
  onLoadStarterPack,
  isLoadingStarter,
  onStartPlaying,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState<VaultImage | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadStatus(`กำลังบีบอัดและประมวลผล ${files.length} รูปภาพ...`);
    const processed: VaultImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const { dataUrl, mimeType, size } = await fileToOptimizedDataUrl(file);
        processed.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          name: file.name.replace(/\.[^/.]+$/, ''),
          dataUrl,
          mimeType,
          size,
          addedAt: Date.now(),
        });
      } catch (err) {
        console.error('Failed to process image:', file.name, err);
      }
    }

    if (processed.length > 0) {
      onAddImages(processed);
      setUploadStatus(`เพิ่มสำเร็จ ${processed.length} รูปภาพ!`);
      setTimeout(() => setUploadStatus(null), 3000);
    } else {
      setUploadStatus('ไม่พบไฟล์รูปภาพที่ถูกต้อง');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleImportUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      setIsImportingUrl(true);
      setUploadStatus('กำลังดาวน์โหลดและประมวลผลรูปภาพจาก URL...');
      const { dataUrl, mimeType, size } = await urlToOptimizedDataUrl(urlInput.trim());

      const newImage: VaultImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        name: `ภาพจากเว็บ (${new Date().toLocaleTimeString('th-TH')})`,
        dataUrl,
        mimeType,
        size,
        addedAt: Date.now(),
      };

      onAddImages([newImage]);
      setUrlInput('');
      setUploadStatus('นำเข้ารูปภาพจาก URL สำเร็จ!');
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: any) {
      console.error('Failed to import url:', err);
      alert('ไม่สามารถดาวน์โหลดรูปภาพจาก URL นี้ได้ อาจติดการอนุญาต CORS กรุณาดาวน์โหลดแล้วอัพโหลดไฟล์แทน');
    } finally {
      setIsImportingUrl(false);
    }
  };

  const totalBytes = images.reduce((acc, img) => acc + (img.size || 0), 0);
  const formattedStorage = (totalBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-violet-950/40 to-slate-900 border border-violet-500/20 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
                <Images className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                คลังรูปภาพสำหรับ AI วิเคราะห์จับคู่
              </h2>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              อัพโหลดรูปภาพกิจกรรม การกระทำ หรือสิ่งของต่างๆ เข้าคลัง เมื่อกดสุ่มคำศัพท์ AI จะสแกนรูปภาพในคลังนี้ทีละรูปอย่างละเอียด เพื่อหารูปที่สะท้อนคำศัพท์นั้นได้ตรงที่สุด
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={onLoadStarterPack}
              disabled={isLoadingStarter}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-2 transition"
            >
              <FolderDown className="w-4 h-4 text-violet-400" />
              <span>{isLoadingStarter ? 'กำลังโหลดรูปตัวอย่าง...' : 'โหลดรูปภาพตัวอย่าง 10 ภาพ'}</span>
            </button>

            <button
              onClick={onStartPlaying}
              disabled={images.length === 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-violet-500/25 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>พร้อมแล้ว! เริ่มสุ่ม ({images.length} รูป)</span>
            </button>
          </div>
        </div>

        {/* Status / feedback */}
        {uploadStatus && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>{uploadStatus}</span>
          </div>
        )}
      </div>

      {/* Upload Zone & URL Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Drag & drop box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`md:col-span-8 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? 'border-violet-500 bg-violet-500/10 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900/80'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            multiple
            accept="image/*"
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3 group-hover:scale-110 transition-transform">
            <Upload className="w-7 h-7" />
          </div>
          <p className="font-bold text-white text-base mb-1">
            ลากและวางรูปภาพที่นี่ หรือ <span className="text-violet-400 underline">คลิกเพื่อเลือกไฟล์</span>
          </p>
          <p className="text-xs text-slate-400 text-center max-w-sm">
            รองรับ JPG, PNG, WEBP (เลือกได้พร้อมกันหลายรูป ระบบจะปรับความละเอียดและขนาดให้เหมาะกับ AI อัตโนมัติ)
          </p>
        </div>

        {/* URL Input Box & Stats */}
        <div className="md:col-span-4 flex flex-col justify-between bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div>
            <h3 className="font-semibold text-white text-sm flex items-center gap-2 mb-2">
              <LinkIcon className="w-4 h-4 text-violet-400" />
              <span>เพิ่มรูปภาพด้วยลิงก์ URL</span>
            </h3>
            <p className="text-xs text-slate-400 mb-3">
              วางลิงก์รูปภาพโดยตรงจากอินเทอร์เน็ตเพื่อดึงเข้าคลัง
            </p>
            <form onSubmit={handleImportUrl} className="space-y-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <button
                type="submit"
                disabled={!urlInput.trim() || isImportingUrl}
                className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                {isImportingUrl ? 'กำลังดาวน์โหลด...' : 'นำเข้าจาก URL'}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              <span>รูปภาพในคลัง: </span>
              <strong className="text-white font-mono">{images.length} รูป</strong>
            </div>
            <div>
              <span>ขนาดโดยประมาณ: </span>
              <strong className="text-violet-300 font-mono">{formattedStorage} MB</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base">รายการรูปภาพในคลัง ({images.length})</h3>
            <span className="text-xs text-slate-400">AI จะตรวจดูทีละภาพเมื่อเริ่มสุ่มคำ</span>
          </div>

          {images.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพทั้งหมดออกจากคลัง?')) {
                  onClearAll();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              ลบรูปภาพทั้งหมด
            </button>
          )}
        </div>

        {images.length === 0 ? (
          <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            <FileImage className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <h4 className="font-semibold text-slate-300 text-sm mb-1">ยังไม่มีรูปภาพในคลัง</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
              คุณสามารถลากรูปภาพเข้ามา หรือกดปุ่ม "โหลดรูปภาพตัวอย่าง 10 ภาพ" ด้านบน เพื่อเริ่มเล่นได้ทันที!
            </p>
            <button
              onClick={onLoadStarterPack}
              disabled={isLoadingStarter}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs inline-flex items-center gap-2 shadow"
            >
              <FolderDown className="w-4 h-4" />
              {isLoadingStarter ? 'กำลังโหลดรูปตัวอย่าง...' : 'โหลดรูปภาพตัวอย่าง 10 ภาพทันที'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 hover:border-violet-500/50 transition-all shadow-md flex flex-col"
              >
                {/* Thumbnail */}
                <div className="aspect-square w-full overflow-hidden bg-slate-900 relative">
                  <img
                    src={img.dataUrl}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Overlay buttons */}
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewModalImage(img)}
                      className="p-2 rounded-full bg-slate-800/90 text-white hover:bg-violet-600 transition shadow"
                      title="ดูภาพขนาดใหญ่"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteImage(img.id)}
                      className="p-2 rounded-full bg-slate-800/90 text-rose-400 hover:bg-rose-600 hover:text-white transition shadow"
                      title="ลบรูปภาพนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Index badge */}
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[10px] font-mono text-slate-300 border border-slate-800">
                    #{idx + 1}
                  </span>
                </div>

                {/* Caption / Label */}
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-slate-200 truncate" title={img.name}>
                    {img.name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {Math.round((img.size || 0) / 1024)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for full preview */}
      {previewModalImage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h4 className="font-bold text-white text-sm truncate">{previewModalImage.name}</h4>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40">
              <img
                src={previewModalImage.dataUrl}
                alt={previewModalImage.name}
                className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
