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
  duration: "60 Sekunden",
  quiz: [
    {
      question: "Was musst du bei der Arbeit immer tragen?",
      options: ["Sonnenbrille", "Persönliche Schutzausrüstung (PSA)", "Kopfhörer"],
      correctIndex: 1
    },
    {
      question: "Was machst du bei einem defekten Werkzeug?",
      options: ["Weiterbenutzen", "Selbst reparieren", "Sofort melden"],
      correctIndex: 2
    },
    {
      question: "Dürfen Notausgänge zugestellt werden?",
      options: ["Ja, kurzzeitig", "Nein, niemals", "Nur im Winter"],
      correctIndex: 1
    }
  ]
};

export async function generateSafetyBriefing(role: string, department: string): Promise<SafetyContent> {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Erstelle eine kurze Sicherheitsunterweisung für einen Mitarbeiter als ${role} im Bereich ${department}.
    
    Format:
    - Ein motivierender Titel
    - Ein kurzer Einleitungssatz (max 15 Wörter)
    - Genau 3 konkrete, lebenswichtige Sicherheitsregeln.
    - Geschätzte Lesezeit.
    - Erstelle dazu genau 3 einfache Multiple-Choice Fragen (Quiz), um das Verständnis zu prüfen. Jede Frage soll 3 Antwortmöglichkeiten haben, wovon nur eine richtig ist.
    
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
            duration: { type: Type.STRING },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  correctIndex: { type: Type.INTEGER, description: "Index of the correct option (0, 1, or 2)" }
                },
                required: ["question", "options", "correctIndex"]
              }
            }
          },
          required: ["title", "intro", "steps", "duration", "quiz"]
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