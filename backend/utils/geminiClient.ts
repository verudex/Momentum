import { GoogleGenAI } from "@google/genai";

export const getCaloriesFromGemini = async (userInput: string) => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) throw new Error("Missing Gemini API Key");

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: userInput,
    config: {
      systemInstruction: "You are a calorie estimation assistant. Estimate the total kcal of the meal described using the context of Singaporean portions, no need for explanation, just give a flat number and that's it. If the input is not a valid food or meal, reply with 'Invalid'.",
    },
  });

  return response.text;
};
