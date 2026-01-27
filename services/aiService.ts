
import { GoogleGenAI, Type } from "@google/genai";
import { AIInsight, Transaction, User } from "../types";

export interface AnalysisResult {
  suggestedAmount: number;
  confidence: number;
  isValid: boolean;
  detectedDate?: string;
  referenceNumber?: string;
}

/**
 * AI Core Phase 10: Global Analytics & Insights
 * Analyzes user patterns, multi-currency holdings, and provides proactive advice.
 */
export const getGlobalAIInsights = async (user: User, transactions: Transaction[]): Promise<AIInsight[]> => {
  try {
    const summary = transactions.slice(0, 10).map(t => `${t.type}: ${t.currency} ${t.amount} on ${t.date}`).join('\n');
    const walletSummary = user.wallets.map(w => `${w.currency}: ${w.balance}`).join(', ');
    
    // Instantiate a new GoogleGenAI client with the current API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze this user's multi-currency transaction history and current wallet holdings. 
      Provide 3 proactive financial insights based on:
      User: ${user.name}, Wallets: ${walletSummary}, Tier: ${user.kycLevel}
      History:
      ${summary}
      
      Look for:
      1. Currency conversion opportunities (Forex trends).
      2. Fraud patterns or spending spikes.
      3. Loan eligibility or tier upgrade benefits.
      `,
      config: {
        systemInstruction: "You are the Payna AI Core Engine. You provide actionable, professional financial advice. Output exactly 3 insights in the specified JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['ADVICE', 'ALERT', 'OPPORTUNITY'] },
              message: { type: Type.STRING },
              actionLabel: { type: Type.STRING },
              actionTarget: { type: Type.STRING }
            },
            required: ['type', 'message']
          }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Core Analysis Error:", error);
    return [{ type: 'ADVICE', message: "Keep using PAYNA to unlock personalized multi-currency insights." }];
  }
};

/**
 * Phase 8: AI Receipt Verification & Audit
 * Extracts Amount, Date, and Reference Number from bank transfer receipts.
 */
export const analyzeReceipt = async (file: File): Promise<AnalysisResult> => {
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  try {
    const base64Data = await fileToBase64(file);
    // Instantiate a new GoogleGenAI client with the current API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: file.type } },
          { text: "Examine this bank transfer receipt. Extract: 1. Amount, 2. Date of transaction, 3. Reference Number/Session ID. Determine validity and provide a confidence score from 0.0 to 1.0 based on how clearly these fields are identified." },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedAmount: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            isValid: { type: Type.BOOLEAN },
            detectedDate: { type: Type.STRING },
            referenceNumber: { type: Type.STRING },
          },
          required: ["suggestedAmount", "confidence", "isValid", "referenceNumber"],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Receipt Analysis Error:", error);
    return { suggestedAmount: 0, confidence: 0, isValid: false, referenceNumber: "ERROR_SCAN" };
  }
};
