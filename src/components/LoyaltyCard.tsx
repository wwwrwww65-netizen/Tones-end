import React from 'react';
import { Award, User, LogOut, CreditCard, Gift, History, ExternalLink, AlertTriangle } from 'lucide-react';
import { LoyaltyUser } from '../types/hotspot';

interface LoyaltyCardProps {
  user: LoyaltyUser | null;
  onOpenRegister: () => void;
  onOpenLoan: () => void;
  onOpenRedeem: () => void;
  onOpenSavedCards: () => void;
  onLogoutLoyalty: () => void;
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = ({
  user,
  onOpenRegister,
  onOpenLoan,
  onOpenRedeem,
  onOpenSavedCards,
  onLogoutLoyalty,
}) => {
  // If not registered or logged in to loyalty
  if (!user) {
    return (
      <div className="w-full mb-4 flex flex-col gap-2.5 animate-fade-in" dir="rtl">
        {/* Notice alert */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 to-rose-950/40 border border-amber-500/30 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="text-amber-300 font-bold ml-1">تنبيه:</strong>
            أنت غير مسجل حالياً في نظام النقاط، لذلك لن يتم احتساب أي نقاط ومكافآت عند تعبئة الكروت.
          </div>
        </div>

        {/* Register Button */}
        <button
          type="button"
          onClick={onOpenRegister}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.35)] active:scale-[0.99] transition-all"
        >
          <Award className="w-4 h-4 text-slate-950" />
          <span>انقر للتسجيل أو الدخول لنظام النقاط</span>
        </button>
      </div>
    );
  }

  // If user is logged in to loyalty
  return (
    <div className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900/90 via-rose-950/30 to-slate-900/90 border border-amber-500/30 shadow-xl backdrop-blur-md animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <User className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">حساب نظام النقاط</span>
            <span className="text-sm font-black text-white font-mono">{user.phone}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogoutLoyalty}
          className="px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-[11px] font-bold flex items-center gap-1 transition-all"
          title="تسجيل الخروج من نظام النقاط"
        >
          <LogOut className="w-3 h-3" />
          <span>خروج</span>
        </button>
      </div>

      {/* Points Banner */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/15 border border-amber-400/25 mb-3">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
          <Award className="w-4 h-4 text-amber-400" />
          <span>رصيد نقاطك الحالي:</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-amber-400 font-mono">{user.points}</span>
          <span className="text-xs text-amber-300/80 font-bold">نقطة</span>
        </div>
      </div>

      {/* Loyalty Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={onOpenLoan}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-1.5 text-center transition-all group active:scale-95"
        >
          <CreditCard className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-slate-200">طلب سلفة</span>
        </button>

        <button
          type="button"
          onClick={onOpenRedeem}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-1.5 text-center transition-all group active:scale-95"
        >
          <Gift className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-slate-200">استبدال كرت</span>
        </button>

        <button
          type="button"
          onClick={onOpenSavedCards}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-1.5 text-center transition-all group active:scale-95"
        >
          <History className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-slate-200">الكروت المحفوظة</span>
        </button>

        <a
          href="https://tunisnet.shabakaty.site"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex flex-col items-center justify-center gap-1.5 text-center transition-all group active:scale-95"
        >
          <ExternalLink className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-bold text-slate-200">حسابي بالبوابة</span>
        </a>
      </div>
    </div>
  );
};
