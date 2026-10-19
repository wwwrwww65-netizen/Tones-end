import React from 'react';
import { X, Zap, Check } from 'lucide-react';
import { SpeedOption } from '../types/hotspot';

interface SpeedSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  speeds: SpeedOption[];
  selectedSpeed: string;
  onSelectSpeed: (speedValue: string) => void;
  enableUltraSpeed: boolean;
  title?: string;
}

export const SpeedSelectorModal: React.FC<SpeedSelectorModalProps> = ({
  isOpen,
  onClose,
  speeds,
  selectedSpeed,
  onSelectSpeed,
  enableUltraSpeed,
  title = 'تحديد سرعة الإنترنت',
}) => {
  if (!isOpen) return null;

  const filteredSpeeds = speeds.filter((s) => {
    if (s.value === '1M/8M' && !enableUltraSpeed) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-gradient-to-b from-[#131b2e] to-[#0b101d] border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-rose-400">
            <Zap className="w-5 h-5 fill-rose-500/30" />
            <h3 className="text-base font-extrabold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-all flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>إغلاق</span>
          </button>
        </div>

        {/* Speed Cards List */}
        <div className="flex flex-col gap-2.5">
          {filteredSpeeds.map((sp) => {
            const isSelected = selectedSpeed === sp.value;
            return (
              <button
                key={sp.value}
                type="button"
                onClick={() => {
                  onSelectSpeed(sp.value);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-2xl border text-right transition-all flex items-center justify-between active:scale-[0.99] ${
                  isSelected
                    ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-rose-400 bg-rose-500' : 'border-slate-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{sp.name}</span>
                      {sp.recommended && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full font-bold">
                          الموصى بها
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                      {sp.value}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-rose-300/80 font-medium">
                  {isSelected ? 'مفعلة' : 'اختيار'}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition-all"
        >
          رجوع
        </button>
      </div>
    </div>
  );
};
