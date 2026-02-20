import React, { useRef, useState } from 'react';
import { X, ScanLine, Upload } from 'lucide-react';

interface PhotoInputProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
  onCancel: () => void;
}

const PhotoInput: React.FC<PhotoInputProps> = ({ onImageSelected, isLoading, onCancel }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onImageSelected(file);
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in-up">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {!preview ? (
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
           <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Import Image</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">SUPPORTED FORMATS: JPG, PNG</p>
              </div>
              <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={18} />
              </button>
           </div>
           
           <div 
             onClick={triggerSelect}
             className="relative border border-dashed border-slate-300 bg-slate-50/50 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-teal-400/50 transition-all group overflow-hidden"
           >
              {/* Grid Background Effect */}
              <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

              <div className="z-10 bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-4 group-hover:scale-110 transition-transform group-hover:shadow-md group-hover:border-teal-100">
                 <Upload size={24} className="text-teal-600" />
              </div>
              <p className="z-10 text-sm font-semibold text-slate-600">Select IV Site Image</p>
              <p className="z-10 text-xs text-slate-400 mt-1">Tap to browse gallery</p>
           </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-slate-900 aspect-[3/4] md:aspect-auto border border-slate-800 group">
          <img
            src={preview}
            alt="Preview"
            className={`w-full h-full object-contain mx-auto transition-all duration-700 ${isLoading ? 'opacity-40 scale-105 blur-sm' : 'opacity-100 scale-100'}`}
          />
          
          {/* Overlay Grid */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <ScanLine size={48} className="text-teal-400 animate-pulse mb-4" />
              <div className="bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-teal-500/30">
                 <p className="text-teal-400 font-mono text-xs tracking-widest animate-pulse">PROCESSING_DIAGNOSTICS...</p>
              </div>
            </div>
          ) : (
             <button
             onClick={onCancel}
             className="absolute top-4 right-4 bg-black/40 text-white/80 p-2 rounded-full hover:bg-red-500/80 hover:text-white backdrop-blur-md transition-all z-10 border border-white/10"
           >
             <X size={18} />
           </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoInput;