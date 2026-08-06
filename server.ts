import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Generation Endpoint
  app.post("/api/generate-email", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body || {};

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "Missing GEMINI_API_KEY environment variable." 
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

      res.json({ text: responseText });
    } catch (error: any) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate email." });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
