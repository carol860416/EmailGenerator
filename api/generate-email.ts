import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({ 
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export default async function handler(req: any, res: any) {
  // CORS & Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt, systemInstruction } = req.body || {};

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "Missing GEMINI_API_KEY. Please set GEMINI_API_KEY in your deployment environment variables (e.g. Vercel Environment Variables)." 
      });
    }

    let responseText = "";

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are a professional HR specialist specializing in Training and Development.",
          temperature: 0.7,
        },
      });
      responseText = response.text || "";
    } catch (modelErr: any) {
      console.warn("Primary model gemini-3.6-flash failed, trying fallback model gemini-2.5-flash:", modelErr?.message);
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "You are a professional HR specialist specializing in Training and Development.",
          temperature: 0.7,
        },
      });
      responseText = fallbackResponse.text || "";
    }

    return res.status(200).json({ text: responseText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ 
      error: error?.message || "Failed to generate email content via Gemini API." 
    });
  }
}
