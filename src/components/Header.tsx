import React from 'react';
import { Bell, Settings } from 'lucide-react';

interface HeaderProps {
  networkName: string;
  onOpenOffers: () => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({ networkName, onOpenOffers, onOpenAdmin }) => {
  return (
    <header className="flex items-center justify-between py-3 px-2 border-b border-white/10 mb-3">
      {/* Brand & Wi-Fi Icon */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/10 border border-rose-500/30 flex items-center justify-center p-2 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
          <svg className="w-full h-full text-rose-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C7.2 3 2.8 4.9 0 7.9l1.8 1.9C4.3 7.3 8 5.6 12 5.6s7.7 1.7 10.2 4.2L24 7.9C21.2 4.9 16.8 3 12 3z" />
            <path d="M12 7.5c-3.6 0-6.9 1.4-9.3 3.8l1.8 1.9c2-2 4.7-3.1 7.5-3.1s5.5 1.1 7.5 3.1l1.8-1.9c-2.4-2.4-5.7-3.8-9.3-3.8z" />
            <path d="M12 12c-2.4 0-4.6 1-6.2 2.6l1.8 1.9C8.8 15.3 10.3 14.6 12 14.6s3.2 0.7 4.4 1.9l1.8-1.9C16.6 13 14.4 12 12 12z" />
            <circle cx="12" cy="19.5" r="1.8" />
          </svg>
        </div>
        <div>
          <span className="text-xl font-black tracking-tight text-white drop-shadow-md">
            شبكة <span className="text-amber-400">{networkName}</span> اللاسلكية
          </span>
          <p className="text-[10px] text-rose-200/70 font-medium">MikroTik High Speed Hotspot</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Admin Settings Button */}
        <button
          onClick={onOpenAdmin}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
          title="لوحة التحكم والإعدادات"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* جديدنا Notification Pill Button */}
        <button
          onClick={onOpenOffers}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 hover:text-white hover:border-amber-400 transition-all text-xs font-bold shadow-[0_0_12px_rgba(251,191,36,0.2)] active:scale-95"
        >
          <Bell className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>جديدنا</span>
        </button>
      </div>
    </header>
  );
};
