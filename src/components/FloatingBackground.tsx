import React from 'react';

export const FloatingBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Ambient Radial Gradient Mesh */}
      <div className="absolute top-[-10%] right-[-10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-rose-600/15 blur-[120px]" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-amber-500/12 blur-[140px]" />
      <div className="absolute top-[40%] left-[20%] w-[45vw] h-[45vw] max-w-[500px] max-h-[500px] rounded-full bg-rose-950/25 blur-[100px]" />

      {/* Floating Animated Geometric Icons */}
      <ul className="floating-icons-container absolute inset-0">
        <li className="float-icon float-icon-1">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-rose-400/25">
            <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0 0 12 4zm0 2.9a13.9 13.9 0 0 1 9.35 3.65L12 19.89 2.65 10.55A13.9 13.9 0 0 1 12 6.9z" />
          </svg>
        </li>
        <li className="float-icon float-icon-2">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-amber-300/20">
            <path d="M12 1.5l3.09 6.26L22 8.77l-5 4.87 1.18 6.88L12 17.27l-6.18 3.25L7 13.64 2 8.77l6.91-1.01L12 1.5z" />
          </svg>
        </li>
        <li className="float-icon float-icon-3">
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-rose-300/20">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
        </li>
        <li className="float-icon float-icon-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 fill-cyan-400/20">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </li>
        <li className="float-icon float-icon-5">
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-amber-400/20">
            <path d="M7 2v11h3v9l7-12h-4l4-8H7z" />
          </svg>
        </li>
        <li className="float-icon float-icon-6">
          <svg viewBox="0 0 24 24" className="w-9 h-9 fill-rose-500/20">
            <path d="M19 3H5L2 9l10 12L22 9l-3-6z" />
          </svg>
        </li>
      </ul>
    </div>
  );
};
