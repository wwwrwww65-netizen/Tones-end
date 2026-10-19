import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface AdsCarouselProps {
  images: string[];
}

export const AdsCarousel: React.FC<AdsCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback default images if empty
  const activeImages = images && images.length > 0 ? images : ['1.jpg', '2.jpg'];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % activeImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
  };

  // Autoplay
  useEffect(() => {
    if (activeImages.length <= 1) return;
    timerRef.current = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, activeImages.length]);

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="relative w-full mb-4 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-lg">
      <div
        className="w-full h-36 sm:h-44 md:h-48 relative overflow-hidden flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {activeImages.map((img, idx) => {
          const imgSrc = img.startsWith('http') || img.startsWith('/') ? img : `/adimg/${img}`;
          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={imgSrc}
                alt={`إعلان ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback visual banner with gradient
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end p-3">
                <span className="text-xs font-bold text-white bg-black/50 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10">
                  {idx === 0 ? '⚡ سرعة في النت وتصفح فائق' : '🔥 رصيد نت أكثر وتغطية واسعة'}
                </span>
              </div>
            </div>
          );
        })}

        {/* Carousel Nav Buttons */}
        {activeImages.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all"
              aria-label="السابق"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-all"
              aria-label="التالي"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator */}
      {activeImages.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {activeImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
