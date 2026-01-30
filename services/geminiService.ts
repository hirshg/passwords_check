
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSecurityExplanation(password: string, analysis: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `הסבר לתלמיד כיתה ח' בעברית: מדוע הסיסמא "${password}" קיבלה את הדירוג "${analysis}"? 
      התייחס למורכבות, לסוגי תווים ולמהירות שבה מחשבים עובדים היום. 
      תן עצה אחת קונקרטית לשיפור. שמור על טון מעודד ולימודי.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: { type: Type.STRING, description: "עצה לשיפור הסיסמה" },
            context: { type: Type.STRING, description: "הסבר על חוזק הסיסמה" }
          },
          required: ["advice", "context"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      advice: "תמיד כדאי לשלב סוגי תווים שונים.",
      context: "מחשבים מודרניים יכולים לנסות מיליארדי שילובים בשנייה אחת."
    };
  }
}
