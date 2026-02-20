import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Zap, X, RefreshCw, AlertTriangle } from 'lucide-react';

interface LiveScannerProps {
  onCapture: (file: File) => void;
  onClose: () => void;
  isAnalyzing: boolean;
}

const LiveScanner: React.FC<LiveScannerProps> = ({ onCapture, onClose, isAnalyzing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const autoIntervalRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null); // Ref to track stream for cleanup

  // Initialize Camera
  useEffect(() => {
    let isMounted = true;

    const startCamera = async () => {
      try {
        // Stop any existing stream first
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        let mediaStream: MediaStream;
        
        try {
            // 1. Try ideal environment camera
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' } 
            });
        } catch (err) {
            console.warn("Environment camera failed, attempting fallback to default video...", err);
            // 2. Fallback to any available video source
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true
            });
        }

        if (!isMounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = mediaStream;
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          // Ensure video plays (some browsers require explicit play)
          try {
              await videoRef.current.play();
          } catch (playErr) {
              console.error("Video play error:", playErr);
          }
        }
        setError(null);

      } catch (err: any) {
        console.error("Camera Access Error:", err);
        if (isMounted) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError("Camera access was denied. Please allow camera permissions in your browser address bar.");
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError("No camera device found.");
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError("Camera is in use by another app or cannot be started.");
            } else {
                setError(`Unable to access camera: ${err.message || 'Unknown error'}`);
            }
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (autoIntervalRef.current) {
        window.clearInterval(autoIntervalRef.current);
      }
    };
  }, []); 

  // Capture Function
  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      // Match canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
            onCapture(file);
          }
        }, 'image/jpeg', 0.85);
      }
    }
  }, [onCapture]);

  // Auto Mode Logic
  useEffect(() => {
    if (autoMode && !isAnalyzing) {
      autoIntervalRef.current = window.setInterval(() => {
        if (!isAnalyzing && videoRef.current && videoRef.current.readyState >= 2) {
          captureImage();
        }
      }, 4000); 
    } else {
      if (autoIntervalRef.current) {
        window.clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
    }
    return () => {
      if (autoIntervalRef.current) {
        window.clearInterval(autoIntervalRef.current);
      }
    };
  }, [autoMode, isAnalyzing, captureImage]);


  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/50 to-transparent">
        <button onClick={onClose} className="text-white p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
          <X size={24} />
        </button>
        <div className="bg-black/30 backdrop-blur-md px-4 py-1 rounded-full border border-white/10">
          <span className="text-xs font-medium text-white uppercase tracking-wider">
            {autoMode ? 'Auto-Scan Active' : 'Live Camera'}
          </span>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-zinc-900">
        {error ? (
          <div className="text-white text-center p-8 max-w-sm">
            <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/50">
                <AlertTriangle className="text-red-400" size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">Camera Error</h3>
            <p className="text-zinc-400 text-sm mb-6">{error}</p>
            <button 
                onClick={onClose}
                className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold"
            >
                Close Camera
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
               <div className="w-64 h-64 border border-white/30 rounded-lg relative">
                  <div className={`absolute top-0 left-0 w-full h-0.5 bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)] ${isAnalyzing ? 'animate-scan-fast' : 'animate-scan-slow'}`}></div>
                  
                  {/* Corner markers */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white"></div>
               </div>
            </div>

             {/* Analyzing Indicator Overlay */}
             {isAnalyzing && (
               <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                 <div className="w-12 h-12 border-4 border-white/20 border-t-teal-400 rounded-full animate-spin"></div>
                 <p className="text-white font-medium mt-4 tracking-wide">Analyzing Frame...</p>
               </div>
             )}
          </>
        )}
      </div>

      {/* Controls */}
      <div className="bg-black/80 backdrop-blur-xl p-8 pb-12 flex items-center justify-around relative">
        
        {/* Auto Toggle */}
        <button 
          onClick={() => setAutoMode(!autoMode)}
          disabled={!!error}
          className={`flex flex-col items-center gap-1 transition-colors ${autoMode ? 'text-teal-400' : 'text-zinc-500'} ${error ? 'opacity-30' : ''}`}
        >
          <div className={`p-3 rounded-full ${autoMode ? 'bg-teal-400/20' : 'bg-zinc-800'}`}>
             <RefreshCw size={20} className={autoMode ? 'animate-spin-slow' : ''} />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider">Auto</span>
        </button>

        {/* Shutter Button */}
        <button 
          onClick={captureImage}
          disabled={isAnalyzing || !!error}
          className={`relative group transition-all transform active:scale-95 ${isAnalyzing || error ? 'opacity-50' : ''}`}
        >
          <div className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full group-hover:scale-90 transition-transform"></div>
          </div>
        </button>

        {/* Placeholder spacer */}
        <div className="w-12"></div> 
      </div>
      
      <style>{`
        @keyframes scan-slow {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes scan-fast {
          0% { top: 0%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-slow {
          animation: scan-slow 3s linear infinite;
        }
        .animate-scan-fast {
          animation: scan-fast 1.5s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LiveScanner;