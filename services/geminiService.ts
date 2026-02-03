import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeContactMessage = async (message: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock data.");
    return {
      category: "General Inquiry",
      priority: "Normal",
      sentiment: "Neutral",
      suggestedAction: "Reply within 24 hours."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following contact form message from a potential client for a digital agency. 
      Message: "${message}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "The category of the inquiry (e.g., New Project, Job Application, Support, Partnership)",
            },
            priority: {
              type: Type.STRING,
              description: "Estimated priority: High, Medium, Low",
            },
            sentiment: {
              type: Type.STRING,
              description: "Tone of the message: Professional, Urgent, Casual, Angry",
            },
            suggestedAction: {
              type: Type.STRING,
              description: "Brief recommended next step for the agency team.",
            },
          },
          required: ["category", "priority", "sentiment", "suggestedAction"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback in case of error
    return {
      category: "Unknown",
      priority: "Medium",
      sentiment: "Neutral",
      suggestedAction: "Manual review required."
    };
  }
};
