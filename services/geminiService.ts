import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { IVAnalysisResult, ClinicalInputs, FluidClassification } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_MODEL = 'gemini-3-flash-preview';

export const classifyFluid = async (input: { text?: string, imageBase64?: string }): Promise<FluidClassification> => {
  const prompt = `
    Role: Expert Clinical Pharmacist.
    Task: Identify the IV drug/fluid and classify it as "vesicant" or "non_vesicant".
    - Vesicants: Chemotherapy, Vasopressors (Dopamine, Norepi), Calcium Gluconate, Potassium Chloride (>40mEq/L), Dextrose >10%, Phenytoin, etc.
    - Non-Vesicants: NS, LR, most antibiotics (unless specified high risk), vitamins.
    
    Output in JSON:
    {
      "category": "vesicant" | "non_vesicant" | "unsure",
      "reason": "short explanation in Thai",
      "drugName": "identified generic or brand name"
    }
  `;

  try {
    const parts: any[] = [{ text: prompt }];
    if (input.text) parts.push({ text: `Drug name to check: ${input.text}` });
    if (input.imageBase64) parts.push({ inlineData: { data: input.imageBase64, mimeType: "image/jpeg" } });

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            reason: { type: Type.STRING },
            drugName: { type: Type.STRING },
          },
          required: ["category", "reason", "drugName"]
        }
      }
    });

    return JSON.parse(response.text) as FluidClassification;
  } catch (error) {
    console.error("Fluid Classification Error:", error);
    return { category: 'unsure', reason: 'ไม่สามารถระบุได้', drugName: input.text || 'Unknown' };
  }
};

export const analyzeIVImage = async (base64Image: string, mimeType: string, clinicalData: ClinicalInputs): Promise<IVAnalysisResult> => {
  const systemInstruction = `
    Role: Expert Infusion Nurse Specialist. Analyze IV complications (Phlebitis, Infiltration, Extravasation) per INS standards.
    Input Data:
    - Drug: ${clinicalData.drugName} (${clinicalData.fluidCategory})
    - Size: ${clinicalData.symptomSizeCm} cm
    - Pain: ${clinicalData.painLevel}/10
    - Temp: ${clinicalData.skinTemp}
    - Cord: ${clinicalData.hardness ? 'Yes' : 'No'}
    
    Output JSON in Thai.
  `;

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: "Analyze this IV site complication using the provided clinical data." },
        ],
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            severity: { type: Type.STRING },
            visualEvidence: { type: Type.STRING },
            nursingIntervention: { type: Type.STRING },
            safetyWarning: { type: Type.STRING },
          },
          required: ["status", "severity", "visualEvidence", "nursingIntervention", "safetyWarning"],
        },
      },
    });

    return JSON.parse(response.text) as IVAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("การวิเคราะห์ล้มเหลว กรุณาลองใหม่อีกครั้ง");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
  });
};