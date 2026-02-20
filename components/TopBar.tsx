import React from 'react';
import { ShieldCheck, Wifi } from 'lucide-react';

const TopBar: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand / Logo Area */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 p-2 rounded-lg border border-violet-500/20 text-violet-600 shadow-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
              <defs>
                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <path fill="url(#logo-grad)" d="M14.5 6.5L17.5 9.5L18.5 8.5C18.8 8.2 18.8 7.8 18.5 7.5L16.5 5.5C16.2 5.2 15.8 5.2 15.5 5.5L14.5 6.5Z" />
              <path fill="url(#logo-grad)" d="M13.5 7.5L7.5 13.5C7.2 13.8 7.2 14.2 7.5 14.5L9.5 16.5C9.8 16.8 10.2 16.8 10.5 16.5L16.5 10.5L13.5 7.5Z" />
              <path stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" d="M6.5 14.5L3.5 17.5" />
              <path stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" d="M19 5L20.5 3.5" />
              <circle cx="12" cy="12" r="1.5" fill="white" fillOpacity="0.8" />
              <path d="M4 19L2 21" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none font-sans">
              IV GUARDIAN <span className="text-violet-600 font-normal">AI</span>
            </h1>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
              Clinical Support System
            </span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-3 md:gap-4">
           <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
              <ShieldCheck size={14} className="text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">INS Compliant</span>
           </div>
           <div className="flex items-center gap-2 pl-2 border-l border-slate-100 md:border-0 md:pl-0">
             <div className="flex flex-col items-end mr-1">
               <span className="text-[10px] font-mono text-violet-600 font-bold">ONLINE</span>
             </div>
             <div className="relative">
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-500 rounded-full animate-ping opacity-75"></span>
                <Wifi size={16} className="text-violet-500 relative z-10" />
             </div>
           </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;