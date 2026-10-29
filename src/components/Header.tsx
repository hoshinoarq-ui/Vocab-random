import React from 'react';
import { Sparkles, BookOpen, Images, Play, RefreshCw, Volume2, Award } from 'lucide-react';

export type ActiveTab = 'play' | 'words' | 'vault';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  wordCount: number;
  imageCount: number;
  sessionRounds: number;
  masteredCount: number;
  onQuickRandom?: () => void;
  isMatching?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  wordCount,
  imageCount,
  sessionRounds,
  masteredCount,
  onQuickRandom,
  isMatching,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
                  WordVault AI
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Vision Matcher
                </span>
              </div>
              <p className="text-xs text-slate-400">สุ่มคำศัพท์ภาษาอังกฤษ & จับคู่ภาพด้วย AI ละเอียด</p>
            </div>
          </div>

          {/* Quick status on mobile */}
          <div className="flex sm:hidden items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              {sessionRounds} รอบ
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl w-full sm:w-auto justify-center">
          <button
            onClick={() => setActiveTab('play')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'play'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${activeTab === 'play' ? 'fill-current' : ''}`} />
            <span>สุ่มคำเล่น (Play)</span>
          </button>

          <button
            onClick={() => setActiveTab('words')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'words'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>คำศัพท์</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {wordCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === 'vault'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Images className="w-3.5 h-3.5" />
            <span>คลังรูปภาพ</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {imageCount}
            </span>
          </button>
        </div>

        {/* Practice Stats Pill on Desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Award className="w-3.5 h-3.5" />
              {sessionRounds} รอบ
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-medium">จำได้แล้ว {masteredCount} คำ</span>
          </div>

          {activeTab !== 'play' && onQuickRandom && (
            <button
              onClick={onQuickRandom}
              disabled={isMatching || wordCount === 0 || imageCount === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isMatching ? 'animate-spin' : ''}`} />
              เริ่มสุ่มทันที
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
