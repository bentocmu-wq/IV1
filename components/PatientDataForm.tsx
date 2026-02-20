import React, { useState, useRef } from 'react';
import { ClinicalInputs, FluidClassification } from '../types';
import { Thermometer, Activity, Zap, ArrowRight, FlaskConical, AlertTriangle, Droplet, Ruler, Camera, Search, Loader2 } from 'lucide-react';
import { classifyFluid, fileToBase64 } from '../services/geminiService';

interface PatientDataFormProps {
  imagePreview: string | null;
  onSubmit: (data: ClinicalInputs) => void;
  onCancel: () => void;
}

const PatientDataForm: React.FC<PatientDataFormProps> = ({ imagePreview, onSubmit, onCancel }) => {
  const [drugName, setDrugName] = useState('');
  const [painLevel, setPainLevel] = useState<number>(0);
  const [skinTemp, setSkinTemp] = useState<'normal' | 'warm' | 'cool'>('normal');
  const [hardness, setHardness] = useState<boolean>(false);
  const [fluidCategory, setFluidCategory] = useState<'non_vesicant' | 'vesicant' | 'unsure'>('non_vesicant');
  const [symptomSizeCm, setSymptomSizeCm] = useState<number>(0);
  const [isClassifying, setIsClassifying] = useState(false);
  const [aiReason, setAiReason] = useState('');
  
  const drugInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLabelScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsClassifying(true);
    try {
      const b64 = await fileToBase64(file);
      const result = await classifyFluid({ imageBase64: b64 });
      applyClassification(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleNameCheck = async () => {
    if (!drugName.trim()) return;
    setIsClassifying(true);
    try {
      const result = await classifyFluid({ text: drugName });
      applyClassification(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsClassifying(false);
    }
  };

  const applyClassification = (result: FluidClassification) => {
    setDrugName(result.drugName);
    setFluidCategory(result.category);
    setAiReason(result.reason);
  };

  const handleSubmit = () => {
    onSubmit({ drugName, painLevel, skinTemp, hardness, fluidCategory, symptomSizeCm });
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in-up">
      <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center gap-5">
        <div className="relative">
           {imagePreview && <img src={imagePreview} alt="Thumb" className="w-16 h-16 rounded-lg object-cover shadow-sm border border-slate-200" />}
           <div className="absolute -bottom-1 -right-1 bg-violet-500 rounded-full p-1 border-2 border-white">
              <Activity size={10} className="text-white" />
           </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Clinical Triangulation</h3>
          <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-wide">Patient Site Analysis</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Drug Name & AI Scanner */}
        <div className="space-y-4">
           <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FlaskConical size={16} className="text-indigo-500" /> IV Fluid / Drug Info
          </span>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="ชื่อยาหรือสารน้ำ (เช่น 5% DN/2)"
                value={drugName}
                onChange={(e) => setDrugName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              />
              <button 
                onClick={handleNameCheck}
                disabled={isClassifying}
                className="absolute right-2 top-1.5 p-1.5 text-slate-400 hover:text-violet-600 transition-colors"
              >
                {isClassifying ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </button>
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-violet-100 text-violet-600 p-3 rounded-xl hover:bg-violet-200 transition-colors"
              title="แสกนฉลากยา"
            >
              <Camera size={20} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLabelScan} />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={() => setFluidCategory('non_vesicant')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${fluidCategory === 'non_vesicant' ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20' : 'bg-white border-slate-100'}`}
             >
                <Droplet size={16} className={fluidCategory === 'non_vesicant' ? 'text-emerald-600' : 'text-slate-300'} />
                <span className={`text-xs font-bold ${fluidCategory === 'non_vesicant' ? 'text-emerald-700' : 'text-slate-500'}`}>Non-Vesicant</span>
             </button>
             <button 
                onClick={() => setFluidCategory('vesicant')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-all ${fluidCategory === 'vesicant' ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-500/20' : 'bg-white border-slate-100'}`}
             >
                <AlertTriangle size={16} className={fluidCategory === 'vesicant' ? 'text-rose-600' : 'text-slate-300'} />
                <span className={`text-xs font-bold ${fluidCategory === 'vesicant' ? 'text-rose-700' : 'text-slate-500'}`}>Vesicant / High Risk</span>
             </button>
          </div>
          
          {aiReason && (
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
              AI Note: {aiReason}
            </div>
          )}
        </div>

        <div className="h-px bg-slate-100 w-full"></div>
        
        {/* Pain Score */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Zap size={16} className="text-amber-500" /> Pain Score
            </span>
            <span className="text-2xl font-bold font-mono text-slate-700">{painLevel}<span className="text-sm font-normal text-slate-400">/10</span></span>
          </div>
          <input type="range" min="0" max="10" step="1" value={painLevel} onChange={(e) => setPainLevel(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600" />
        </div>

        {/* Size Measurement */}
        <div>
           <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                 <Ruler size={16} className="text-blue-500" /> Symptom Size (cm)
              </span>
              <span className="text-xl font-bold font-mono text-blue-600">{symptomSizeCm} cm</span>
           </div>
           <input type="range" min="0" max="20" step="0.5" value={symptomSizeCm} onChange={(e) => setSymptomSizeCm(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
        </div>

        {/* Skin Temp */}
        <div>
          <span className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
            <Thermometer size={16} className="text-teal-500" /> Skin Temperature
          </span>
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
            {['cool', 'normal', 'warm'].map((temp) => (
              <button key={temp} onClick={() => setSkinTemp(temp as any)} className={`py-2 rounded-lg text-xs font-bold transition-all ${skinTemp === temp ? 'bg-white text-slate-800 shadow-sm ring-1 ring-black/5' : 'text-slate-500'}`}>
                {temp.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Palpable Cord */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer" onClick={() => setHardness(!hardness)}>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${hardness ? 'bg-rose-100 text-rose-600' : 'bg-white text-slate-300'}`}>
                    <Activity size={16} />
                 </div>
                 <span className="text-sm font-semibold text-slate-700">Palpable Cord (เส้นเลือดแข็ง)</span>
              </div>
              <div className={`w-10 h-5 rounded-full p-1 transition-colors ${hardness ? 'bg-rose-500' : 'bg-slate-300'}`}>
                 <div className={`w-3 h-3 rounded-full bg-white transition-transform ${hardness ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
        <button onClick={onCancel} className="flex-1 py-3 text-sm font-bold text-slate-400">DISCARD</button>
        <button onClick={handleSubmit} className="flex-[2] py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2">
          START AI ANALYSIS <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default PatientDataForm;