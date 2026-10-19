import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, RefreshCw, Upload, CheckCircle2 } from 'lucide-react';
import jsQR from 'jsqr';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCameraError, setHasCameraError] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [scannedResult, setScannedResult] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setIsLoadingCamera(true);
    setHasCameraError(false);
    setScannedResult(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available in browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsLoadingCamera(false);
        scanFrame();
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      setIsLoadingCamera(false);
      setHasCameraError(true);
    }
  };

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleFoundCode(code.data);
          return;
        }
      }
    }

    animFrameIdRef.current = requestAnimationFrame(scanFrame);
  };

  const handleFoundCode = (codeText: string) => {
    // Extract PIN if QR is formatted like URL or direct numbers
    let pin = codeText.trim();
    if (pin.includes('?')) {
      const urlParams = new URLSearchParams(pin.split('?')[1]);
      if (urlParams.get('username')) pin = urlParams.get('username') || pin;
      else if (urlParams.get('code')) pin = urlParams.get('code') || pin;
    }

    setScannedResult(pin);
    stopCamera();

    setTimeout(() => {
      onScanSuccess(pin);
      onClose();
    }, 700);
  };

  // Image Upload fallback scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleFoundCode(code.data);
          } else {
            alert('لم يتم العثور على رمز QR واضح في الصورة. يرجى تجربة صورة أوضح.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in" dir="rtl">
      <div className="w-full max-w-sm bg-[#0c1220] border border-white/15 rounded-3xl p-5 shadow-2xl relative flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Camera className="w-5 h-5" />
            <h3 className="text-base font-extrabold text-white">مسح رمز QR للكرت</h3>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white transition-all flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>إغلاق</span>
          </button>
        </div>

        {/* Viewport Box */}
        <div className="relative w-full h-64 bg-black/80 rounded-2xl overflow-hidden border border-white/20 flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanner Reticle & Laser */}
          {!hasCameraError && !isLoadingCamera && (
            <div className="absolute inset-8 pointer-events-none border border-white/20 rounded-xl">
              <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-amber-400 rounded-tr" />
              <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-amber-400 rounded-tl" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-amber-400 rounded-br" />
              <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-amber-400 rounded-bl" />
              {/* Laser Line */}
              <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_10px_#fbbf24] animate-laser" />
            </div>
          )}

          {/* Loading Indicator */}
          {isLoadingCamera && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-xs text-amber-300">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
              <span>جاري تشغيل الكاميرا...</span>
            </div>
          )}

          {/* Scanned Success Banner */}
          {scannedResult && (
            <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center gap-2 p-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 animate-bounce" />
              <span className="text-sm font-bold text-white">تم مسح الكرت بنجاح!</span>
              <span className="text-lg font-black text-amber-300 font-mono tracking-widest">{scannedResult}</span>
            </div>
          )}

          {/* Camera Error / Permission Fallback */}
          {hasCameraError && (
            <div className="absolute inset-0 p-4 bg-slate-950/95 flex flex-col items-center justify-center text-center gap-3">
              <p className="text-xs text-rose-300">
                لم يتم تشغيل الكاميرا المباشرة. يمكنك التقاط صورة بكاميرا الهاتف أو اختيار صورة للكرت:
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg active:scale-95"
              >
                <Upload className="w-4 h-4" />
                <span>التقاط أو رفع صورة الكرت</span>
              </button>
            </div>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Controls */}
        <div className="w-full flex items-center justify-between gap-2 mt-3">
          <button
            type="button"
            onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تبديل الكاميرا</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>رفع صورة الكرت</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-2 text-center">
          وجّه الكاميرا نحو رمز QR المطبوع على كرت الإنترنت
        </p>
      </div>
    </div>
  );
};
