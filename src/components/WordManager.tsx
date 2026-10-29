import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Copy,
  Search,
  AlertCircle,
  FileText,
  Lightbulb,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { WordItem, VOCAB_PRESETS } from '../data/starterData';
import { VaultImage } from '../utils/storage';

export interface PreMatchedData {
  imageId: string;
  fitReason: string;
  matchScore: number;
  exampleSentence?: {
    english: string;
    thai: string;
  };
}

interface WordManagerProps {
  rawText: string;
  setRawText: (text: string) => void;
  parsedWords: WordItem[];
  onStartPlaying: () => void;
  matchedDictionary: Record<string, PreMatchedData>;
  vaultImages: VaultImage[];
  onRematchAll: () => void;
  isMatching: boolean;
}

export const WordManager: React.FC<WordManagerProps> = ({
  rawText,
  setRawText,
  parsedWords,
  onStartPlaying,
  matchedDictionary,
  vaultImages,
  onRematchAll,
  isMatching,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [newEn, setNewEn] = useState('');
  const [newTh, setNewTh] = useState('');

  const filteredWords = parsedWords.filter(
    (w) =>
      w.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.thai.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const matchedCount = parsedWords.filter((w) => matchedDictionary[w.id]).length;
  const isFullyMatched = parsedWords.length > 0 && matchedCount === parsedWords.length;

  const handleApplyPreset = (presetText: string) => {
    setRawText(presetText);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSingleWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEn.trim()) return;
    const addition = `${newEn.trim()} ${newTh.trim() || newEn.trim()}`;
    const updated = rawText.trim() ? `${rawText.trim()}\n${addition}` : addition;
    setRawText(updated);
    setNewEn('');
    setNewTh('');
  };

  const handleDeleteWord = (englishToDelete: string) => {
    const lines = rawText.split('\n');
    const remainingLines = lines.filter((line) => {
      const match = line.trim().split(/\s+/)[0];
      return match?.toLowerCase() !== englishToDelete.toLowerCase();
    });
    setRawText(remainingLines.join('\n'));
  };

  return (
    <div className="space-y-6">
      {/* Hero explanation */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                จัดการรายการคำศัพท์ & ผลการจับคู่ภาพล่วงหน้า
              </h2>
            </div>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              กรอกคำศัพท์ภาษาอังกฤษพร้อมคำแปล ระบบจะให้ AI <strong>เลือกรูปและเขียนเหตุผลประกอบล่วงหน้าให้ครบทุกคำ</strong> เพื่อให้คุณสุ่มเล่นคำศัพท์ได้อย่างลื่นไหลทันทีโดยไม่ต้องรอโหลดทีละคำ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <button
              onClick={onRematchAll}
              disabled={isMatching || parsedWords.length === 0 || vaultImages.length === 0}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
              title="สั่งให้ AI ตรวจสอบและจับคู่ภาพใหม่ให้ครบทุกคำ"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isMatching ? 'animate-spin' : ''}`} />
              <span>{isMatching ? 'กำลังวิเคราะห์...' : 'วิเคราะห์จับคู่ใหม่ทุกคำ'}</span>
            </button>

            <button
              onClick={onStartPlaying}
              disabled={parsedWords.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4" />
              <span>เริ่มสุ่มเล่นทันที ({parsedWords.length} คำ)</span>
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            {isFullyMatched ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                จับคู่รูปภาพและเขียนเหตุผลครบทุกคำแล้ว ({matchedCount}/{parsedWords.length} คำ)
              </span>
            ) : (
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                จับคู่แล้ว {matchedCount} จาก {parsedWords.length} คำ (กดปุ่ม "วิเคราะห์จับคู่ใหม่ทุกคำ" หรือ "เริ่มสุ่มเล่น" เพื่อให้ AI จับคู่ให้ครบ)
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 mr-1 text-[11px]">ชุดคำแนะนำ:</span>
            {VOCAB_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset.rawText)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-slate-800 hover:bg-indigo-900/40 text-slate-300 hover:text-indigo-200 border border-slate-700 transition"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Raw Text Input */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">พิมพ์หรือแก้ไขรายการคำศัพท์</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                {parsedWords.length} คำ
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                title="คัดลอกข้อความทั้งหมด"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
              </button>
              <button
                type="button"
                onClick={() => setRawText('')}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 transition"
                title="ล้างข้อความทั้งหมด"
              >
                <Trash2 className="w-3.5 h-3.5" />
                ล้าง
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-2">
            รูปแบบ: <span className="text-slate-300 font-mono">Eat กิน</span> (คำภาษาอังกฤษ [เว้นวรรค] คำแปลไทย)
          </p>

          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={14}
            placeholder={`Eat กิน\nSleep นอน\nRead อ่าน\nRun วิ่ง\nDrink ดื่ม`}
            className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y leading-relaxed"
          />

          {/* Quick Add Word Bar */}
          <form onSubmit={handleAddSingleWord} className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newEn}
              onChange={(e) => setNewEn(e.target.value)}
              placeholder="คำอังกฤษ เช่น Cook"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="text"
              value={newTh}
              onChange={(e) => setNewTh(e.target.value)}
              placeholder="คำแปลไทย เช่น ทำอาหาร"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newEn.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow transition"
            >
              <Plus className="w-3.5 h-3.5" />
              เพิ่มคำ
            </button>
          </form>
        </div>

        {/* Right Column: Pre-Matched Words with Images & Reasons */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>ผลการจับคู่รูปภาพและเหตุผล ({filteredWords.length} คำ)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                เลือกรูปภาพและเขียนเหตุผลประกอบไว้ล่วงหน้าเรียบร้อยแล้ว
              </p>
            </div>
          </div>

          {/* Search filter */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาคำศัพท์หรือคำแปล..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Words list container */}
          <div className="flex-1 overflow-y-auto max-h-[500px] pr-1 space-y-3">
            {parsedWords.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">ยังไม่มีคำศัพท์ กรุณาพิมพ์ในช่องด้านซ้าย หรือกดเลือก "ชุดคำแนะนำ"</p>
              </div>
            ) : filteredWords.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                ไม่พบคำศัพท์ที่ตรงกับ "{searchTerm}"
              </div>
            ) : (
              filteredWords.map((item, idx) => {
                const matchInfo = matchedDictionary[item.id];
                const matchedImg = matchInfo
                  ? vaultImages.find((img) => img.id === matchInfo.imageId)
                  : null;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-3.5"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 flex items-center justify-center">
                      {matchedImg ? (
                        <img
                          src={matchedImg.dataUrl}
                          alt={matchedImg.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-[10px] text-slate-600 text-center p-1">
                          รอจับคู่
                        </div>
                      )}
                    </div>

                    {/* Word Details & AI Reason */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-base">
                            {item.english}
                          </span>
                          <span className="text-xs text-indigo-300 font-medium">
                            ({item.thai})
                          </span>
                        </div>

                        {matchInfo && (
                          <span className="px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20 text-[10px] font-mono font-semibold">
                            Match: {matchInfo.matchScore}%
                          </span>
                        )}
                      </div>

                      {/* Reason why chosen */}
                      {matchInfo?.fitReason ? (
                        <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 mt-1">
                          <p className="text-[11px] text-slate-300 leading-relaxed flex items-start gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>
                              <strong>เหตุผลที่เลือกรูปนี้:</strong> {matchInfo.fitReason}
                            </span>
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic">
                          ยังไม่ได้เลือกรูปภาพ (จะได้รับการจับคู่อัตโนมัติเมื่อกดเริ่มสุ่ม)
                        </p>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteWord(item.english)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition self-start sm:self-center"
                      title="ลบคำนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
