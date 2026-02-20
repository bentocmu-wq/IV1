import React, { useState } from 'react';
import TopBar from './components/TopBar';
import PhotoInput from './components/PhotoInput';
import AnalysisResultCard from './components/AnalysisResultCard';
import LiveScanner from './components/LiveScanner';
import PatientDataForm from './components/PatientDataForm';
import { analyzeIVImage, fileToBase64 } from './services/geminiService';
import { AnalysisState, AnalysisStatus, ClinicalInputs } from './types';
import { Camera, UploadCloud, ArrowLeft, ChevronRight, Activity, Zap } from 'lucide-react';

type AppMode = 'HOME' | 'CAMERA' | 'UPLOAD' | 'RESULT';

const MainApp: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('HOME');
  const [state, setState] = useState<AnalysisState>({
    status: AnalysisStatus.IDLE,
    result: null,
    error: null,
    capturedFile: null,
  });

  const handleImageCapture = (file: File) => {
    setState(prev => ({ ...prev, capturedFile: file, status: AnalysisStatus.INPUT_DETAILS }));
    setMode('HOME');
  };

  const handleClinicalSubmit = async (clinicalData: ClinicalInputs) => {
    const file = state.capturedFile;
    if (!file) return;

    setState(prev => ({ ...prev, status: AnalysisStatus.ANALYZING, result: null, error: null }));
    setMode('RESULT');

    try {
      const base64Data = await fileToBase64(file);
      const analysisResult = await analyzeIVImage(base64Data, file.type, clinicalData);
      
      setState({
        status: AnalysisStatus.SUCCESS,
        result: analysisResult,
        error: null,
        capturedFile: null,
      });
    } catch (error) {
      setState({
        status: AnalysisStatus.ERROR,
        result: null,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
        capturedFile: file,
      });
    }
  };

  const resetApp = () => {
    setState({ status: AnalysisStatus.IDLE, result: null, error: null, capturedFile: null });
    setMode('HOME');
  };

  const getPreviewUrl = () => {
    return state.capturedFile ? URL.createObjectURL(state.capturedFile) : null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-violet-100 selection:text-violet-900">
      
      {mode !== 'CAMERA' && <TopBar />}

      <main className="flex-grow flex flex-col relative w-full max-w-6xl mx-auto">
        
        {/* DASHBOARD */}
        {mode === 'HOME' && state.status === AnalysisStatus.IDLE && (
          <div className="flex-grow flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="text-center max-w-2xl mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Medical AI Assistant v2.3</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                Smart IV <br className="md:hidden" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-500">Assessment</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl max-w-lg mx-auto leading-relaxed font-light">
                Utilizing computer vision and INS clinical standards to detect Phlebitis, Infiltration, and Extravasation with precision.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl px-4">
              <button 
                onClick={() => setMode('CAMERA')}
                className="group relative bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-teal-300 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden ring-0 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-teal-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative bg-teal-50 w-14 h-14 rounded-2xl flex items-center justify-center text-teal-600 mb-6 border border-teal-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <Camera size={28} />
                </div>
                <h3 className="relative text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  Live Scanner <ChevronRight size={18} className="text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="relative text-sm text-slate-500 leading-relaxed">
                  Real-time analysis optimized for mobile.
                </p>
              </button>

              <button 
                onClick={() => setMode('UPLOAD')}
                className="group relative bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden ring-0 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                <div className="relative bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-6 border border-blue-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud size={28} />
                </div>
                <h3 className="relative text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  Import Image <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="relative text-sm text-slate-500 leading-relaxed">
                  High-res analysis from photo gallery.
                </p>
              </button>
            </div>
            
            <div className="mt-16 text-center opacity-60">
               <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono tracking-wider">
                  <Zap size={10} className="fill-slate-400" /> POWERED BY GOOGLE GEMINI 3 PRO
               </div>
            </div>
          </div>
        )}

        {/* CLINICAL FORM */}
        {state.status === AnalysisStatus.INPUT_DETAILS && (
          <div className="flex-grow flex items-center justify-center p-4 md:p-6">
            <PatientDataForm 
              imagePreview={getPreviewUrl()}
              onSubmit={handleClinicalSubmit}
              onCancel={resetApp}
            />
          </div>
        )}

        {/* LIVE CAMERA */}
        {mode === 'CAMERA' && (
          <LiveScanner 
            onCapture={handleImageCapture} 
            onClose={() => setMode('HOME')} 
            isAnalyzing={state.status === AnalysisStatus.ANALYZING}
          />
        )}

        {/* UPLOAD */}
        {mode === 'UPLOAD' && (
          <div className="flex-grow flex items-center justify-center p-4 md:p-6">
            <PhotoInput 
              onImageSelected={handleImageCapture} 
              isLoading={false} 
              onCancel={() => setMode('HOME')}
            />
          </div>
        )}

        {/* RESULTS */}
        {mode === 'RESULT' && (
          <div className="flex-grow flex flex-col items-center justify-start pt-8 p-4 md:p-6">
            <div className="w-full max-w-2xl mb-6 flex justify-between items-center">
               <button onClick={resetApp} className="group flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-semibold text-sm px-4 py-2 rounded-lg hover:bg-white hover:shadow-sm">
                 <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
               </button>
            </div>

            {state.status === AnalysisStatus.ANALYZING && (
              <div className="flex-grow flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative w-24 h-24 mb-8">
                   <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                   <Activity className="absolute inset-0 m-auto text-violet-600 animate-pulse" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Analyzing Complications</h3>
                <p className="text-slate-500 font-mono text-xs uppercase tracking-wide">Correlating Visuals + Clinical Data...</p>
              </div>
            )}

            {state.status === AnalysisStatus.SUCCESS && state.result && (
              <AnalysisResultCard result={state.result} />
            )}

            {state.status === AnalysisStatus.ERROR && (
               <div className="bg-white border border-rose-100 p-10 rounded-3xl max-w-md text-center shadow-xl shadow-rose-100/50 mt-12">
                 <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 border border-rose-100">
                    <Activity size={32} /> 
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-3">Analysis Interrupted</h3>
                 <p className="text-slate-500 mb-8 text-sm leading-relaxed bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
                   {state.error}
                 </p>
                 <button onClick={resetApp} className="w-full px-6 py-4 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 transform hover:-translate-y-0.5">
                   Try Again
                 </button>
               </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default MainApp;