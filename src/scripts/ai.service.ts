// // src/script/ai.service.ts

// import { config } from "../config/config";

// /**
//  * Generates a script based on the provided prompt using Google Gemini AI.
//  */
// export async function generateScript(prompt: string): Promise<string> {
//   // Dynamically load the ESM-only client
//   const { GoogleGenAI } = await import("@google/genai");

//   const apiKey = config.googleApiKey;
//   if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");

//   const ai = new GoogleGenAI({ apiKey });

//   // Call Gemini (single-turn)
//   const response = await ai.models.generateContent({
//     model: "gemini-2.0-flash",
//     contents: prompt,
//   });

//   // Basic check of returned text
//   if (!response.text?.trim()) {
//     throw new Error("AI returned empty content");
//   }

//   return response.text;
// }

import { spawn } from "child_process";
import path from "path";

export async function generateScript(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "gemini-helper.mjs");

    const child = spawn("node", [scriptPath, prompt], {
      env: { ...process.env }, // ensure GOOGLE_API_KEY is passed
      stdio: ["inherit", "pipe", "pipe"],
    });

    let output = "";
    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      console.error("Gemini error:", data.toString());
    });

    child.on("close", (code) => {
      if (code === 0 && output.trim()) {
        resolve(output.trim());
      } else {
        reject(new Error("Gemini script failed or returned empty result"));
      }
    });
  });
}

  
  