/**
 * Local AI Service
 * Simulates local image processing/OCR for receipt verification.
 * In a production environment with an API key, this would utilize Gemini 2.5 Flash.
 */

export interface AnalysisResult {
  suggestedAmount: number;
  confidence: number;
  isValid: boolean;
  detectedDate?: string;
}

export const analyzeReceipt = async (file: File): Promise<AnalysisResult> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Heuristic simulation:
  // In a real local model, we might use Tesseract.js or a small ONNX model.
  // Here we return randomized "success" data to demonstrate the UI flow.
  
  const randomConfidence = 70 + Math.floor(Math.random() * 30); // 70-99%
  const isLikelyValid = randomConfidence > 75;

  return {
    suggestedAmount: Math.floor(Math.random() * 100) * 100 + 500, // Random amount like 5500, 1200, etc.
    confidence: randomConfidence,
    isValid: isLikelyValid,
    detectedDate: new Date().toISOString().split('T')[0]
  };
};

/* 
// Gemini Implementation Example (Future Use):
import { GoogleGenAI } from "@google/genai";

export const analyzeReceiptWithGemini = async (file: File, apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey });
  // Convert file to base64...
  // Call ai.models.generateContent with 'gemini-2.5-flash'
  // Prompt: "Analyze this receipt image. Extract the total amount, date, and transaction status."
}
*/