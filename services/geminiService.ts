import { GoogleGenAI, Type } from "@google/genai";
import { Message, MessageType, MindMapNode } from "../types";
import { INITIAL_SYSTEM_INSTRUCTION, MINDMAP_SYSTEM_INSTRUCTION } from "../constants";

// Ideally, in a production app, the key is proxied or handled via backend.
// Per instructions, we assume process.env.API_KEY is available.
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Models
const TEXT_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

export const generateTextResponse = async (
  history: Message[],
  currentPrompt: string,
  modeModifier: string
): Promise<string> => {
  try {
    const chatHistory = history
      .filter(m => m.type === MessageType.TEXT)
      .map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

    const fullPrompt = `${modeModifier}\n\nالسؤال: ${currentPrompt}`;

    // Using generateContent for single turn with context manually managed or use Chat
    // To keep it stateless and simple for this "no login" architecture, we recreate the chat.
    const chat = ai.chats.create({
      model: TEXT_MODEL,
      config: {
        systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message: fullPrompt });
    return result.text || "عذراً، لم أتمكن من توليد إجابة.";
  } catch (error) {
    console.error("Gemini Text Error:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: `High quality, academic educational illustration, detailed, clean lines: ${prompt}` }]
      },
      config: {
        // Nano Banana models don't support responseMimeType/Schema
        // We rely on the model returning an inlineData part
      }
    });

    // Iterate to find image part
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Gemini Image Error:", error);
    throw error;
  }
};

export const generateMindMapData = async (topic: string): Promise<MindMapNode> => {
  try {
    const prompt = `Create a detailed mind map about: "${topic}" in Arabic. Return ONLY raw JSON.`;
    
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: MINDMAP_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                children: {
                    type: Type.ARRAY,
                    items: {
                         type: Type.OBJECT,
                         properties: {
                            name: { type: Type.STRING },
                            children: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING }
                                    }
                                }
                            }
                         }
                    }
                }
            }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response for mind map");

    return JSON.parse(jsonText) as MindMapNode;
  } catch (error) {
    console.error("Gemini MindMap Error:", error);
    throw error;
  }
};
