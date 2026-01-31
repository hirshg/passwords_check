
import { GoogleGenAI, Type } from "@google/genai";

export async function getSecurityExplanation(password: string, strength: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `הסבר לתלמיד חטיבת ביניים בעברית: מדוע הסיסמה "${password}" קיבלה את הדירוג "${strength}"? 
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
      advice: "מומלץ לשלב לפחות 12 תווים הכוללים אותיות, מספרים וסימנים מיוחדים.",
      context: "מחשבים מודרניים יכולים לבצע מיליארדי ניסיונות בשנייה אחת, ולכן סיסמאות פשוטות נפרצות במהירות."
    };
  }
}
