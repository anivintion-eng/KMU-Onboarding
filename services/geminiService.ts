import { GoogleGenAI, Type } from "@google/genai";
import { SafetyContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fallbackContent: SafetyContent = {
  title: "Allgemeine Arbeitssicherheit",
  intro: "Sicherheit geht vor. Bitte beachte die grundlegenden Regeln am Arbeitsplatz.",
  steps: [
    "Trage immer deine persönliche Schutzausrüstung (PSA).",
    "Halte Fluchtwege und Notausgänge stets frei.",
    "Melde Beschädigungen an Werkzeugen sofort deinem Vorgesetzten."
  ],
  duration: "60 Sekunden"
};

export async function generateSafetyBriefing(role: string, department: string): Promise<SafetyContent> {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Erstelle eine ultra-kurze Sicherheitsunterweisung für einen Mitarbeiter als ${role} im Bereich ${department}.
    Zielgruppe: Einfache Sprache, keine Fachbegriffe, direkt anwendbar.
    
    Format:
    - Ein motivierender Titel
    - Ein kurzer Einleitungssatz (max 15 Wörter)
    - Genau 3 konkrete, lebenswichtige Sicherheitsregeln (kurz und knackig)
    - Geschätzte Lesezeit (z.B. "45 Sekunden")
    
    Antworte im JSON Format.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            intro: { type: Type.STRING },
            steps: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            duration: { type: Type.STRING }
          },
          required: ["title", "intro", "steps", "duration"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SafetyContent;
    }
    return fallbackContent;
  } catch (error) {
    console.error("Gemini generation failed, using fallback", error);
    return fallbackContent;
  }
}
