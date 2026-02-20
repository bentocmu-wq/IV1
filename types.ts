export interface IVAnalysisResult {
  status: string;
  severity: string;
  visualEvidence: string;
  nursingIntervention: string;
  safetyWarning: string;
}

export interface ClinicalInputs {
  drugName: string;
  painLevel: number;
  skinTemp: 'normal' | 'warm' | 'cool';
  hardness: boolean;
  fluidCategory: 'non_vesicant' | 'vesicant' | 'unsure';
  symptomSizeCm: number;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  INPUT_DETAILS = 'INPUT_DETAILS',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface AnalysisState {
  status: AnalysisStatus;
  result: IVAnalysisResult | null;
  error: string | null;
  capturedFile: File | null;
}

export interface FluidClassification {
  category: 'non_vesicant' | 'vesicant' | 'unsure';
  reason: string;
  drugName: string;
}