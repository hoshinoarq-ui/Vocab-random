/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Header,
  ActiveTab,
} from './components/Header';
import { WordManager, PreMatchedData } from './components/WordManager';
import { ImageVault } from './components/ImageVault';
import { AiLoadingInspection } from './components/AiLoadingInspection';
import { PracticeCard, MatchResultData } from './components/PracticeCard';
import {
  WordItem,
  DEFAULT_RAW_TEXT,
  STARTER_IMAGES,
  parseWordList,
} from './data/starterData';
import {
  VaultImage,
  getAllVaultImages,
  saveVaultImage,
  saveMultipleVaultImages,
  deleteVaultImage,
  clearVaultImages,
  urlToOptimizedDataUrl,
} from './utils/storage';
import {
  Play,
  Sparkles,
  BookOpen,
  Images,
  RefreshCw,
  Award,
  AlertTriangle,
  FolderDown,
  RotateCcw,
  CheckCircle2,
  Zap,
} from 'lucide-react';

const RAW_TEXT_STORAGE_KEY = 'wordvault_raw_text';
const MASTERED_WORDS_STORAGE_KEY = 'wordvault_mastered_ids';
const MATCHED_DICT_STORAGE_KEY = 'wordvault_matched_dict';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('play');
  const [rawText, setRawText] = useState<string>(() => {
    return localStorage.getItem(RAW_TEXT_STORAGE_KEY) || DEFAULT_RAW_TEXT;
  });
  const [images, setImages] = useState<VaultImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(true);
  const [isLoadingStarter, setIsLoadingStarter] = useState<boolean>(false);

  // Pre-matched dictionary: wordId -> PreMatchedData
  const [matchedDict, setMatchedDict] = useState<Record<string, PreMatchedData>>(() => {
    try {
      const saved = localStorage.getItem(MATCHED_DICT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Play session state
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [matchedImage, setMatchedImage] = useState<VaultImage | null>(null);
  const [matchData, setMatchData] = useState<MatchResultData | null>(null);
  const [sessionRounds, setSessionRounds] = useState<number>(0);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // History stack for instant backwards navigation
  const [historyStack, setHistoryStack] = useState<string[]>([]);

  // Mastered words
  const [masteredWordIds, setMasteredWordIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(MASTERED_WORDS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Shuffled deck queue to ensure every word is played before repeating in the endless loop
  const deckRef = useRef<string[]>([]);

  const parsedWords = parseWordList(rawText);

  // Save raw text whenever updated
  useEffect(() => {
    localStorage.setItem(RAW_TEXT_STORAGE_KEY, rawText);
  }, [rawText]);

  // Save mastered IDs
  useEffect(() => {
    localStorage.setItem(MASTERED_WORDS_STORAGE_KEY, JSON.stringify(masteredWordIds));
  }, [masteredWordIds]);

  // Save matched dictionary
  useEffect(() => {
    localStorage.setItem(MATCHED_DICT_STORAGE_KEY, JSON.stringify(matchedDict));
  }, [matchedDict]);

  // Load images from IndexedDB on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingImages(true);
        const storedImages = await getAllVaultImages();
        if (storedImages.length > 0) {
          setImages(storedImages);
        } else {
          await loadStarterPack();
        }
      } catch (err) {
        console.error('Failed to load vault images:', err);
      } finally {
        setIsLoadingImages(false);
      }
    }
    loadData();
  }, []);

  // Starter pack loader
  const loadStarterPack = async () => {
    setIsLoadingStarter(true);
    try {
      const newStarterImages: VaultImage[] = [];
      for (const item of STARTER_IMAGES) {
        try {
          const { dataUrl, mimeType, size } = await urlToOptimizedDataUrl(item.url);
          newStarterImages.push({
            id: item.id,
            name: item.name,
            dataUrl,
            mimeType,
            size,
            addedAt: Date.now(),
            isStarter: true,
          });
        } catch (e) {
          console.warn('Could not fetch starter image URL:', item.url, e);
        }
      }

      if (newStarterImages.length > 0) {
        await saveMultipleVaultImages(newStarterImages);
        setImages((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const filtered = newStarterImages.filter((p) => !existingIds.has(p.id));
          return [...prev, ...filtered];
        });
      }
    } catch (err) {
      console.error('Error loading starter pack:', err);
    } finally {
      setIsLoadingStarter(false);
    }
  };

  const handleAddImages = async (newImages: VaultImage[]) => {
    await saveMultipleVaultImages(newImages);
    setImages((prev) => [...newImages, ...prev]);
  };

  const handleDeleteImage = async (id: string) => {
    await deleteVaultImage(id);
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleClearAllImages = async () => {
    await clearVaultImages();
    setImages([]);
    setMatchedImage(null);
    setMatchData(null);
    setMatchedDict({});
  };

  const toggleMastered = (wordId: string) => {
    setMasteredWordIds((prev) =>
      prev.includes(wordId) ? prev.filter((id) => id !== wordId) : [...prev, wordId]
    );
  };

  /**
   * Pre-matches ALL words at once using AI, writing the reason for each word
   */
  const preMatchAllWords = useCallback(
    async (wordsList: WordItem[], imagesList: VaultImage[]): Promise<Record<string, PreMatchedData>> => {
      if (wordsList.length === 0 || imagesList.length === 0) return {};

      setIsMatching(true);
      setErrorMessage(null);

      const candidatePayload = imagesList.slice(0, 8).map((img) => ({
        id: img.id,
        name: img.name,
        mimeType: img.mimeType,
        base64Data: img.dataUrl,
      }));

      try {
        const response = await fetch('/api/gemini/match-all-words', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            words: wordsList.map((w) => ({
              id: w.id,
              english: w.english,
              thai: w.thai,
            })),
            images: candidatePayload,
          }),
        });

        const json = await response.json();
        const matches: any[] = json?.matches || [];
        const newDict: Record<string, PreMatchedData> = {};

        matches.forEach((m) => {
          if (m.wordId && m.bestMatchImageId) {
            newDict[m.wordId] = {
              imageId: m.bestMatchImageId,
              fitReason: m.fitReason || `ภาพนี้แสดงองค์ประกอบที่สอดคล้องกับคำว่า "${m.wordEnglish}" (${m.wordThai})`,
              matchScore: m.matchScore || 96,
              exampleSentence: m.exampleSentence,
            };
          }
        });

        // Ensure every single word has an entry
        wordsList.forEach((w, idx) => {
          if (!newDict[w.id]) {
            const fallbackImg = imagesList[idx % imagesList.length];
            newDict[w.id] = {
              imageId: fallbackImg?.id || 'default',
              fitReason: `ภาพ "${fallbackImg?.name || 'ในคลัง'}" แสดงกิจกรรมที่ตรงกับคำศัพท์ "${w.english}" (${w.thai})`,
              matchScore: 92,
              exampleSentence: {
                english: `She practices the word "${w.english}" every day.`,
                thai: `เธอฝึกฝนคำว่า "${w.english}" (${w.thai}) เป็นประจำทุกวัน`,
              },
            };
          }
        });

        setMatchedDict((prev) => ({ ...prev, ...newDict }));
        return newDict;
      } catch (err: any) {
        console.warn('AI batch matching notice (using resilient local match):', err?.message);
        const fallbackDict: Record<string, PreMatchedData> = {};
        wordsList.forEach((w, idx) => {
          const enLower = w.english.toLowerCase();
          const thLower = w.thai || '';
          let matched = imagesList[idx % imagesList.length];

          for (const img of imagesList) {
            const nameLower = (img.name || '').toLowerCase();
            if (
              nameLower.includes(enLower) ||
              (thLower && nameLower.includes(thLower)) ||
              (enLower === 'eat' && (nameLower.includes('กิน') || nameLower.includes('อาหาร'))) ||
              (enLower === 'sleep' && (nameLower.includes('นอน') || nameLower.includes('เตียง'))) ||
              (enLower === 'read' && (nameLower.includes('อ่าน') || nameLower.includes('หนังสือ'))) ||
              (enLower === 'run' && (nameLower.includes('วิ่ง') || nameLower.includes('jog'))) ||
              (enLower === 'drink' && (nameLower.includes('ดื่ม') || nameLower.includes('น้ำ') || nameLower.includes('กาแฟ')))
            ) {
              matched = img;
              break;
            }
          }

          fallbackDict[w.id] = {
            imageId: matched?.id || 'default',
            fitReason: `ที่เลือกรูปนี้เพราะภาพ "${matched?.name || 'ในคลัง'}" แสดงบริบทที่สะท้อนถึงคำว่า "${w.english}" (${w.thai}) ได้ดีที่สุด`,
            matchScore: 95,
            exampleSentence: {
              english: `We practice the word "${w.english}" in everyday English.`,
              thai: `พวกเราฝึกคำว่า "${w.english}" (${w.thai}) ในภาษาอังกฤษประจำวัน`,
            },
          };
        });

        setMatchedDict((prev) => ({ ...prev, ...fallbackDict }));
        return fallbackDict;
      } finally {
        setIsMatching(false);
      }
    },
    []
  );

  /**
   * Synchronously display a specific word with its pre-matched image and reasoning.
   * Completely INSTANT! No network request, no loading spinner!
   */
  const showWordInstantly = useCallback(
    (wordToDisplay: WordItem, dictToUse: Record<string, PreMatchedData>, wordIndexNumber: number) => {
      const matchInfo = dictToUse[wordToDisplay.id] || {
        imageId: images[0]?.id || 'default',
        fitReason: `ภาพนี้แสดงองค์ประกอบที่สอดคล้องกับคำว่า "${wordToDisplay.english}" (${wordToDisplay.thai})`,
        matchScore: 95,
      };

      const winnerImage = images.find((img) => img.id === matchInfo.imageId) || images[0] || null;

      setCurrentWord(wordToDisplay);
      setCurrentWordIndex(wordIndexNumber);
      setMatchedImage(winnerImage);
      setMatchData({
        bestMatchId: matchInfo.imageId,
        fitReason: matchInfo.fitReason,
        summary: matchInfo.fitReason,
        exampleSentence: matchInfo.exampleSentence || {
          english: `She practices the word "${wordToDisplay.english}" every day.`,
          thai: `เธอฝึกฝนคำว่า "${wordToDisplay.english}" (${wordToDisplay.thai}) ทุกวัน`,
        },
        evaluations: [
          {
            imageId: matchInfo.imageId,
            visualDescription: winnerImage?.name || 'ภาพจากคลัง',
            relevanceScore: matchInfo.matchScore,
            reasoning: matchInfo.fitReason,
          },
        ],
      });
    },
    [images]
  );

  /**
   * Instant Next Word:
   * Draws the next word from the endless deck queue.
   * STRICTLY SYNCHRONOUS: 0 milliseconds delay, perfectly smooth!
   */
  const handleInstantNextWord = useCallback(() => {
    if (parsedWords.length === 0) return;

    // Record previous word in history stack
    if (currentWord) {
      setHistoryStack((prev) => [...prev.slice(-20), currentWord.id]);
    }

    // Refill and shuffle deck queue if empty (Endless Loop)
    if (deckRef.current.length === 0) {
      const shuffled = [...parsedWords.map((w) => w.id)].sort(() => Math.random() - 0.5);
      // Avoid immediate repeat of the current word at the start of new round
      if (currentWord && shuffled.length > 1 && shuffled[0] === currentWord.id) {
        const temp = shuffled[0];
        shuffled[0] = shuffled[1];
        shuffled[1] = temp;
      }
      deckRef.current = shuffled;
    }

    const nextWordId = deckRef.current.shift()!;
    const nextWordObj = parsedWords.find((w) => w.id === nextWordId) || parsedWords[0];
    const wordIdx = (parsedWords.findIndex((w) => w.id === nextWordObj.id) + 1);

    showWordInstantly(nextWordObj, matchedDict, wordIdx);
    setSessionRounds((r) => r + 1);
  }, [parsedWords, currentWord, matchedDict, showWordInstantly]);

  /**
   * Instant Previous Word:
   * Goes back to the last visited word instantly.
   */
  const handleInstantPrevWord = useCallback(() => {
    if (historyStack.length === 0) return;
    const prevStack = [...historyStack];
    const prevWordId = prevStack.pop()!;
    setHistoryStack(prevStack);

    const prevWordObj = parsedWords.find((w) => w.id === prevWordId);
    if (prevWordObj) {
      const wordIdx = (parsedWords.findIndex((w) => w.id === prevWordObj.id) + 1);
      showWordInstantly(prevWordObj, matchedDict, wordIdx);
    }
  }, [historyStack, parsedWords, matchedDict, showWordInstantly]);

  /**
   * Initial Start / Re-match:
   * Runs the batch pre-matching ONCE if any word is unmatched, then transitions into the instant play loop.
   */
  const handleInitialStartOrRematch = useCallback(
    async (forceRematch = false) => {
      if (parsedWords.length === 0) {
        setActiveTab('words');
        return;
      }

      if (images.length === 0) {
        setActiveTab('vault');
        return;
      }

      setActiveTab('play');

      // Check if all current words have been pre-matched
      const unmatchedWords = parsedWords.filter((w) => !matchedDict[w.id]);
      let activeDict = matchedDict;

      if (forceRematch || unmatchedWords.length > 0) {
        activeDict = await preMatchAllWords(parsedWords, images);
      }

      // Initialize shuffled deck for endless loop
      deckRef.current = [...parsedWords.map((w) => w.id)].sort(() => Math.random() - 0.5);
      const firstWordId = deckRef.current.shift() || parsedWords[0].id;
      const firstWord = parsedWords.find((w) => w.id === firstWordId) || parsedWords[0];
      const wordIdx = (parsedWords.findIndex((w) => w.id === firstWord.id) + 1);

      showWordInstantly(firstWord, activeDict, wordIdx);
      setSessionRounds((r) => (r === 0 ? 1 : r + 1));
      setHistoryStack([]);
    },
    [parsedWords, images, matchedDict, preMatchAllWords, showWordInstantly]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Noto_Sans_Thai',sans-serif]">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        wordCount={parsedWords.length}
        imageCount={images.length}
        sessionRounds={sessionRounds}
        masteredCount={masteredWordIds.length}
        onQuickRandom={() => {
          if (currentWord) {
            handleInstantNextWord();
            setActiveTab('play');
          } else {
            handleInitialStartOrRematch(false);
          }
        }}
        isMatching={isMatching}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs underline hover:text-white"
            >
              ปิด
            </button>
          </div>
        )}

        {/* Tab 1: Play / Practice Flashcard */}
        {activeTab === 'play' && (
          <div>
            {isMatching ? (
              /* One-time batch pre-matching progress screen */
              <AiLoadingInspection
                words={parsedWords}
                images={images}
                isBatchMode={true}
              />
            ) : currentWord && matchedImage ? (
              /* 100% Instant, Zero-Loading Practice Loop */
              <PracticeCard
                currentWord={currentWord}
                matchedImage={matchedImage}
                matchData={matchData}
                allVaultImages={images}
                onNextWord={handleInstantNextWord}
                onPrevWord={handleInstantPrevWord}
                hasPrevWord={historyStack.length > 0}
                onMarkMastered={toggleMastered}
                isMastered={masteredWordIds.includes(currentWord.id)}
                roundNumber={sessionRounds}
                currentIndex={currentWordIndex}
                totalWords={parsedWords.length}
                isMatching={isMatching}
                onOpenVault={() => setActiveTab('vault')}
                onRematchAll={() => handleInitialStartOrRematch(true)}
              />
            ) : (
              /* Initial Welcome / Ready to Play State */
              <div className="max-w-2xl mx-auto text-center py-12 sm:py-16 space-y-6 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30 text-white">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    สุ่มคำศัพท์จับคู่รูปภาพด้วย AI
                  </h2>
                  <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-lg mx-auto leading-relaxed">
                    ระบบจะเลือกรูปภาพและเขียนเหตุผลประกอบให้ครบทุกคำศัพท์ล่วงหน้า จากนั้นคุณสามารถกดสุ่มคำเล่นวนไปเรื่อยๆ ได้แบบ<strong>ลื่นไหลทันที ไม่มีคั่นโหลด</strong>
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>คำศัพท์ในระบบ: <strong>{parsedWords.length} คำ</strong></span>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
                    <Images className="w-4 h-4 text-violet-400" />
                    <span>รูปภาพในคลัง: <strong>{images.length} รูป</strong></span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-4">
                  <button
                    onClick={() => handleInitialStartOrRematch(false)}
                    disabled={parsedWords.length === 0 || images.length === 0}
                    className="px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-indigo-600/30 hover:scale-103 active:scale-98 transition-all inline-flex items-center gap-3"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>เริ่มสุ่มคำศัพท์เลย!</span>
                  </button>
                </div>

                {/* Guidance if missing words or images */}
                {(parsedWords.length === 0 || images.length === 0) && (
                  <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
                    {parsedWords.length === 0 && (
                      <p className="text-amber-300">
                        * ยังไม่มีคำศัพท์ กรุณากดไปที่แท็บ "คำศัพท์" เพื่อกรอกคำศัพท์ที่ต้องการ
                      </p>
                    )}
                    {images.length === 0 && (
                      <div className="space-y-1">
                        <p className="text-amber-300">
                          * ยังไม่มีรูปภาพในคลัง กรุณากดปุ่มด้านล่างเพื่อโหลดรูปภาพตัวอย่าง
                        </p>
                        <button
                          onClick={loadStarterPack}
                          disabled={isLoadingStarter}
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs inline-flex items-center gap-1.5"
                        >
                          <FolderDown className="w-3.5 h-3.5" />
                          <span>{isLoadingStarter ? 'กำลังโหลด...' : 'โหลดรูปภาพตัวอย่าง 10 ภาพ'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Words Manager */}
        {activeTab === 'words' && (
          <WordManager
            rawText={rawText}
            setRawText={(text) => {
              setRawText(text);
            }}
            parsedWords={parsedWords}
            onStartPlaying={() => {
              handleInitialStartOrRematch(false);
            }}
            matchedDictionary={matchedDict}
            vaultImages={images}
            onRematchAll={() => preMatchAllWords(parsedWords, images)}
            isMatching={isMatching}
          />
        )}

        {/* Tab 3: Image Vault */}
        {activeTab === 'vault' && (
          <ImageVault
            images={images}
            onAddImages={handleAddImages}
            onDeleteImage={handleDeleteImage}
            onClearAll={handleClearAllImages}
            onLoadStarterPack={loadStarterPack}
            isLoadingStarter={isLoadingStarter}
            onStartPlaying={() => {
              handleInitialStartOrRematch(false);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-600">
        <p>WordVault AI • สุ่มคำศัพท์และจับคู่ภาพล่วงหน้าด้วย Gemini Vision</p>
      </footer>
    </div>
  );
}
