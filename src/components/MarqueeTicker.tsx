import React from 'react';

interface MarqueeTickerProps {
  text: string;
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ text }) => {
  return (
    <div className="w-full overflow-hidden bg-black/40 border border-white/10 rounded-xl px-3 py-2 mb-4 backdrop-blur-md shadow-inner flex items-center gap-2">
      <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-rose-600/30 border border-rose-500/40 text-[11px] font-bold text-rose-300">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
        <span>تنبيه</span>
      </div>
      <div className="overflow-hidden whitespace-nowrap w-full relative">
        <div className="inline-block animate-marquee text-xs md:text-sm font-semibold text-amber-200/90 tracking-wide">
          {text}
        </div>
      </div>
    </div>
  );
};
