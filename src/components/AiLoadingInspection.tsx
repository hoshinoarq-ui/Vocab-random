import React, { useEffect, useState } from 'react';
import { Eye, Sparkles, Scan, Search, Brain, CheckCircle2, Clock } from 'lucide-react';
import { VaultImage } from '../utils/storage';
import { WordItem } from '../data/starterData';

interface AiLoadingInspectionProps {
  words: WordItem[];
  images: VaultImage[];
  isBatchMode?: boolean;
}

export const AiLoadingInspection: React.FC<AiLoadingInspectionProps> = ({
  words,
  images,
  isBatchMode = true,
}) => {
  const [activeScanningIndex, setActiveScanningIndex] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [phaseMessage, setPhaseMessage] = useState('กำลังเตรียมการวิเคราะห์คลังรูปภาพและจับคู่ทุกคำศัพท์...');

  useEffect(() => {
    if (images.length === 0) return;

    // Cycle scanning highlights across the thumbnails
    const interval = setInterval(() => {
      setActiveScanningIndex((prev) => (prev + 1) % images.length);
    }, 600);

    // Cycle simulated word progress
    const wordInterval = setInterval(() => {
      setActiveWordIndex((prev) => (prev < words.length - 1 ? prev + 1 : prev));
    }, Math.max(400, Math.floor(3500 / Math.max(words.length, 1))));

    const steps = [
      `AI กำลังสแกนคลังรูปภาพ ${images.length} ภาพ อย่างละเอียด...`,
      'กำลังตรวจจับการกระทำ สีหน้า และวัตถุในแต่ละภาพ...',
      `กำลังวิเคราะห์และคัดเลือกภาพที่เหมาะสมที่สุดให้ครบทั้ง ${words.length} คำศัพท์...`,
      'เขียนคำอธิบายและเหตุผลภาษาไทยประกอบการเลือกรูป...',
      'เกือบเสร็จแล้ว! กำลังบันทึกผลเพื่อให้คุณเล่นสุ่มได้ทันทีโดยไม่ต้องรอ...',
    ];

    let stepIdx = 0;
    setPhaseMessage(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setPhaseMessage(steps[stepIdx]);
    }, 1200);

    return () => {
      clearInterval(interval);
      clearInterval(wordInterval);
      clearInterval(stepInterval);
    };
  }, [images, words]);

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center max-w-3xl mx-auto animate-fadeIn">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Target Word Announcement */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        <span>ระบบกำลังเลือกรูปภาพให้ครบทุกคำศัพท์ล่วงหน้า</span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          กำลังวิเคราะห์จับคู่รูปภาพทุกคำศัพท์ ({words.length} คำ)
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-lg mx-auto leading-relaxed">
          เลือกรูปและเขียนเหตุผลประกอบให้เสร็จล่วงหน้าทั้งหมด เพื่อให้คุณเล่นสุ่มคำศัพท์ได้ทันทีแบบลื่นไหล ไม่ต้องรอโหลดทีละคำ
        </p>
      </div>

      {/* Progress Box */}
      <div className="relative mx-auto my-6 max-w-lg">
        <div className="flex items-center justify-center gap-2.5 p-3.5 rounded-2xl bg-slate-950/90 border border-indigo-500/30 shadow-inner">
          <Brain className="w-5 h-5 text-indigo-400 animate-bounce flex-shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
            {phaseMessage}
          </span>
        </div>

        {/* Word check list */}
        <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl max-h-36 overflow-y-auto text-left text-xs space-y-1.5 font-mono">
          {words.map((w, idx) => {
            const isDone = idx <= activeWordIndex;
            return (
              <div
                key={w.id || idx}
                className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${
                  isDone ? 'text-emerald-400 bg-emerald-500/5' : 'text-slate-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  )}
                  <strong>{w.english}</strong> ({w.thai})
                </span>
                <span className="text-[10px] text-slate-500">
                  {isDone ? 'จับคู่และระบุเหตุผลแล้ว' : 'รอการวิเคราะห์...'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Inspection Grid */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Scan className="w-3.5 h-3.5 text-indigo-400" />
            ภาพในคลังที่ใช้จับคู่ ({images.length} ภาพ)
          </span>
          <span className="text-indigo-400 font-mono text-[11px]">
            สแกนภาพที่ {activeScanningIndex + 1} จาก {images.length}
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {images.slice(0, 12).map((img, idx) => {
            const isScanning = idx === activeScanningIndex;
            return (
              <div
                key={img.id}
                className={`relative rounded-lg overflow-hidden aspect-square border transition-all duration-200 ${
                  isScanning
                    ? 'border-indigo-400 scale-105 shadow-md shadow-indigo-500/40 ring-2 ring-indigo-500/50'
                    : 'border-slate-800 opacity-60'
                }`}
              >
                <img
                  src={img.dataUrl}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
