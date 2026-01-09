import { GoogleGenAI } from "@google/genai";
import { Location } from "../types";

/**
 * GeminiService provides tactical AI capabilities for The Saviour emergency platform.
 * Cleaned up to support quick advice and complex strategy tasks.
 */
export const GeminiService = {
  /**
   * Quick Triage - Low Latency
   */
  getQuickAdvice: async (role: string, prompt: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Role: ${role}. Instruction: ${prompt}. Provide immediate, life-saving triage steps in a bulleted list.`,
    });
    return response.text || "Remain calm. Professional help is en-route.";
  },

  /**
   * Complex Strategy - Deep Thinking
   */
  getComplexStrategy: async (prompt: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });
    return response.text || "Command strategy offline. Proceed with standard clearance protocols.";
  },

  getTrafficAnalysis: async (location: Location, destination: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze regional traffic density from ${location.lat}, ${location.lng} towards ${destination}. Account for emergency clearance.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return { text: response.text || "Traffic data offline." };
  },

  startFirstAidChat: (userName: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are the SAVIOUR First-Aid Bot HelpX. Provide immediate instructions to ${userName}. Concisely.`,
      },
    });
  }
};
