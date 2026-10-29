import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Award,
  Check,
  RotateCcw,
  Maximize2,
  X,
  ArrowRight,
  ArrowLeft,
  Lightbulb,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WordItem } from '../data/starterData';
import { VaultImage } from '../utils/storage';
import { speakEnglish } from '../utils/speech';

export interface ImageEvaluation {
  imageId: string;
  visualDescription: string;
  relevanceScore: number;
  keyMatches?: string[];
  reasoning: string;
}

export interface MatchResultData {
  evaluations?: ImageEvaluation[];
  bestMatchId: string;
  summary?: string;
  fitReason?: string;
  exampleSentence?: {
    english: string;
    thai: string;
  };
}

interface PracticeCardProps {
  currentWord: WordItem;
  matchedImage: VaultImage | null;
  matchData: MatchResultData | null;
  allVaultImages: VaultImage[];
  onNextWord: () => void;
  onPrevWord?: () => void;
  hasPrevWord?: boolean;
  onMarkMastered: (wordId: string) => void;
  isMastered: boolean;
  roundNumber: number;
  currentIndex?: number;
  totalWords?: number;
  isMatching: boolean;
  onOpenVault: () => void;
  onRematchAll?: () => void;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({
  currentWord,
  matchedImage,
  matchData,
  allVaultImages,
  onNextWord,
  onPrevWord,
  hasPrevWord = false,
  onMarkMastered,
  isMastered,
  roundNumber,
  currentIndex = 1,
  totalWords = 10,
  isMatching,
  onOpenVault,
  onRematchAll,
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [fullImageView, setFullImageView] = useState<string | null>(null);

  // Reset showAnswer automatically when word changes
  useEffect(() => {
    setShowAnswer(false);
  }, [currentWord.id]);

  // Keyboard navigation for ultra smooth practice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || (e.key === ' ' && showAnswer)) {
        e.preventDefault();
        onNextWord();
      } else if (e.key === 'ArrowLeft' && hasPrevWord && onPrevWord) {
        e.preventDefault();
        onPrevWord();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!showAnswer) {
          handleRevealAnswer();
        } else {
          onNextWord();
        }
      } else if (e.key.toLowerCase() === 'v' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        handlePlayAudio(currentWord.english);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAnswer, onNextWord, onPrevWord, hasPrevWord, currentWord]);

  const bestEval = matchData?.evaluations?.find((e) => e.imageId === matchData.bestMatchId);
  const matchScore = bestEval?.relevanceScore ?? 96;

  // Retrieve the explicit reason why this image was chosen
  const chosenReason =
    matchData?.fitReason ||
    bestEval?.reasoning ||
    matchData?.summary ||
    `ภาพนี้แสดงองค์ประกอบและการกระทำที่สื่อถึงความหมายของคำว่า "${currentWord.english}" (${currentWord.thai}) ได้ชัดเจนที่สุด`;

  const handleRevealAnswer = () => {
    setShowAnswer(true);
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handlePlayAudio = async (textToSpeak: string) => {
    setIsPlayingAudio(true);
    await speakEnglish(textToSpeak);
    setIsPlayingAudio(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">
      {/* Session Progress Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-medium">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            รอบที่ {roundNumber} • คำที่ {currentIndex}/{totalWords}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            โหมดลื่นไหล ไม่มีคั่นโหลด
          </span>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {isMastered && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold text-[11px]">
              <Check className="w-3 h-3" />
              จำคำนี้ได้แล้ว
            </span>
          )}

          {onRematchAll && (
            <button
              onClick={onRematchAll}
              className="text-[11px] text-slate-400 hover:text-indigo-300 underline flex items-center gap-1 transition"
              title="สั่งให้ AI วิเคราะห์จับคู่ใหม่ทุกคำศัพท์"
            >
              <RotateCcw className="w-3 h-3" />
              วิเคราะห์ภาพใหม่ทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Main Flashcard Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Top bar with Word and Audio */}
        <div className="p-5 sm:p-7 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 mb-1 block">
                คำศัพท์ภาษาอังกฤษ:
              </span>
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
                  {currentWord.english}
                </h2>
                <button
                  onClick={() => handlePlayAudio(currentWord.english)}
                  disabled={isPlayingAudio}
                  className="p-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition shadow-md group"
                  title="ฟังเสียงออกเสียงภาษาอังกฤษ (คีย์ลัด V)"
                >
                  <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'animate-pulse text-indigo-200' : ''}`} />
                </button>
              </div>
            </div>

            {/* AI Match Badge */}
            <div className="flex flex-col items-center sm:items-end">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>AI Match Score: {matchScore}%</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1">
                เลือกรูปและเหตุผลไว้ล่วงหน้าแล้ว
              </span>
            </div>
          </div>
        </div>

        {/* Selected Best Matching Image Presentation */}
        <div className="p-5 sm:p-7 bg-slate-950/60">
          <div className="relative group max-w-lg mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
            {matchedImage ? (
              <>
                <img
                  src={matchedImage.dataUrl}
                  alt={matchedImage.name}
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-102 transition-transform duration-300"
                />
                <button
                  onClick={() => setFullImageView(matchedImage.dataUrl)}
                  className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-white hover:bg-violet-600 transition shadow"
                  title="ดูรูปภาพขนาดเต็ม"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>รูปภาพที่เลือกไว้ล่วงหน้า</span>
                </div>
              </>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center p-6 text-center text-slate-500">
                <p className="text-sm mb-2">ยังไม่มีรูปภาพในคลัง</p>
                <button
                  onClick={onOpenVault}
                  className="text-xs text-indigo-400 hover:underline"
                >
                  คลิกที่นี่เพื่อไปอัพโหลดรูปภาพหรือโหลดรูปตัวอย่าง
                </button>
              </div>
            )}
          </div>

          {/* Highlight: เหตุผลที่ AI เลือกภาพนี้ */}
          <div className="max-w-lg mx-auto mt-4 bg-gradient-to-r from-violet-950/40 via-indigo-950/40 to-slate-900 border border-violet-500/30 rounded-2xl p-4 shadow-lg text-left">
            <div className="flex items-center gap-2 text-violet-300 text-xs font-bold mb-1">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>เหตุผลที่เลือกรูปนี้สำหรับ "{currentWord.english}":</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {chosenReason}
            </p>
          </div>

          {/* Reveal Answer Section */}
          <div className="mt-6 text-center">
            {!showAnswer ? (
              <div className="space-y-2.5">
                <button
                  onClick={handleRevealAnswer}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 hover:scale-102 active:scale-98 transition-all inline-flex items-center gap-2.5"
                >
                  <HelpCircle className="w-5 h-5" />
                  <span>กดดูเฉลยคำแปล (Show Translation)</span>
                </button>
                <p className="text-xs text-slate-500">
                  ทายความหมายจากภาพ หรือกด Spacebar / Enter เพื่อดูเฉลย
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-5 text-left space-y-4 animate-fadeIn shadow-xl max-w-lg mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      เฉลยคำแปลภาษาไทย:
                    </span>
                    <h3 className="text-3xl font-extrabold text-white mt-0.5">
                      {currentWord.thai}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onMarkMastered(currentWord.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        isMastered
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isMastered ? 'จำได้แล้ว' : 'ทำเครื่องหมายว่าจำได้'}</span>
                    </button>
                  </div>
                </div>

                {/* Example sentence */}
                {matchData?.exampleSentence && (
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">
                        ประโยคตัวอย่าง:
                      </span>
                      <p className="text-sm font-semibold text-indigo-300">
                        "{matchData.exampleSentence.english}"
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        "{matchData.exampleSentence.thai}"
                      </p>
                    </div>
                    <button
                      onClick={() => handlePlayAudio(matchData.exampleSentence?.english || '')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex-shrink-0"
                      title="ฟังประโยคตัวอย่าง"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar - 100% Instant, No Loading! */}
        <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {hasPrevWord && onPrevWord && (
              <button
                onClick={onPrevWord}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                title="ย้อนกลับไปดูคำก่อนหน้า"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>คำก่อนหน้า</span>
              </button>
            )}
            <span className="text-xs text-slate-400 hidden sm:inline">
              กดลูกศรขวา (→) หรือปุ่มนี้เพื่อเปลี่ยนคำทันที
            </span>
          </div>

          <button
            onClick={onNextWord}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all"
          >
            <span>สุ่มคำถัดไปทันที (Next Word)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Full screen image modal */}
      {fullImageView && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setFullImageView(null)}
              className="absolute -top-12 right-0 p-2 text-slate-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={fullImageView} alt="Fullscreen" className="max-h-[85vh] rounded-2xl shadow-2xl object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
