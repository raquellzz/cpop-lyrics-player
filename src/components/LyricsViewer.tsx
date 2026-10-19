import React, { useEffect, useRef } from 'react';
import { pinyin } from 'pinyin-pro';
import { usePlayerStore } from '../store/usePlayerStore';

export const LyricsViewer: React.FC = () => {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const activeLineIndex = usePlayerStore((s) => s.activeLineIndex);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Rolagem suave automática para a linha ativa
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  if (!currentSong) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Selecione uma música do catálogo para iniciar o estudo.
      </div>
    );
  }

  return (
    <div className="h-[550px] overflow-y-auto px-4 py-8 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700">
      {currentSong.lyrics.map((line, idx) => {
        const isActive = idx === activeLineIndex;
        return (
          <div
            key={idx}
            ref={isActive ? activeLineRef : null}
            className={`transition-all duration-300 p-4 rounded-xl text-center ${
              isActive
                ? 'bg-zinc-900/90 border border-zinc-700 scale-102 shadow-lg'
                : 'opacity-40 hover:opacity-75'
            }`}
          >
            {/* Linha com Hanzi e Pinyin */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mb-2">
              {line.segments.map((seg, sIdx) => {
                const displayPinyin = seg.pinyin || pinyin(seg.hanzi, { toneType: 'symbol' });
                return (
                  <div
                    key={sIdx}
                    className="flex flex-col items-center group cursor-pointer"
                    title={seg.translation || 'Clique para detalhes'}
                  >
                    <span className="text-xs text-red-400 font-mono select-none">
                      {displayPinyin}
                    </span>
                    <span className="text-2xl font-bold text-zinc-100 tracking-wider group-hover:text-red-300">
                      {seg.hanzi}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tradução da linha inteira */}
            <p className="text-sm text-zinc-400 italic font-light">
              {line.lineTranslation}
            </p>
          </div>
        );
      })}
    </div>
  );
};