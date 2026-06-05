import express from "express";
import path from "path";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import os from "os";
import { createServer as createViteServer } from "vite";

const upload = multer({ dest: os.tmpdir() });

let aiClient: GoogleGenAI | null = null;
function getAi() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not set.");
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  let globalDocuments: any[] = [];

  app.get("/api/documents", (req, res) => {
    res.json({ documents: globalDocuments });
  });

  app.delete("/api/documents", (req, res) => {
    globalDocuments = [];
    res.json({ success: true });
  });

  app.post("/api/upload", upload.array("files"), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files provided." });
      }

      const uploadedUris = [];
      for (const file of files) {
        // We upload each file using File API
        const uploadedFile = await getAi().files.upload({
          file: file.path,
          config: { mimeType: file.mimetype || "application/pdf", displayName: file.originalname }
        });

        uploadedUris.push({
          uri: uploadedFile.uri,
          name: file.originalname,
          mimeType: uploadedFile.mimeType || file.mimetype || "application/pdf",
          id: Date.now().toString() + Math.random().toString()
        });

        // Clean up tmp file
        await fs.unlink(file.path).catch(console.error);
      }

      globalDocuments = [...globalDocuments, ...uploadedUris];

      res.json({ files: uploadedUris });
    } catch (e: any) {
      console.error("Upload error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, documentUris } = req.body;
      
      const contents = [];
      let isFirstUserMessage = true;

      for (const m of messages) {
        let parts: any[] = [{ text: m.text }];
        
        // Inject files into the first user message
        if (m.role === "user" && isFirstUserMessage) {
          isFirstUserMessage = false;
          if (documentUris && documentUris.length > 0) {
            for (const doc of documentUris) {
              parts.unshift({
                fileData: { fileUri: doc.uri, mimeType: doc.mimeType }
              });
            }
          }
        }

        contents.push({
          role: m.role,
          parts: parts,
        });
      }

      const response = await getAi().models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: "أنت المساعد القانوني 'دليلي القانوني'. مهمتك مساعدة المواطنين والمحامين بمعلومات واستشارات قانونية بناءً على القوانين المصرية المرفوعة. اعتمد على الملفات كمرجع أساسي، وقم بتلخيص الإجابة وتقديم مراجع للمواد القانونية. قدم إجابتك باللغة العربية بأسلوب احترافي وواضح.",
        },
      });

      res.json({ text: response.text });
    } catch (e: any) {
      console.error("Chat error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // text to speech proxy
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      const response = await getAi().models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
          },
        },
      });

      const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ audioBase64 });
    } catch(e: any) {
       console.error("TTS error:", e);
       res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
