/* eslint-disable no-undef */
// // src/scripts/gemini-helper.mjs

// import { GoogleGenAI } from "@google/genai";

// // eslint-disable-next-line no-undef
// const apiKey = process.env.GOOGLE_API_KEY;
// if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");

// const genAI = new GoogleGenAI({ apiKey });

// export async function generateScriptFromGemini(prompt) {
//   const response = await genAI.models.generateContent({
//     model: "gemini-2.0-flash",
//     contents: prompt,
//   });

//   const text = response.text;
//   if (!text || typeof text !== "string" || !text.trim()) {
//     throw new Error("AI returned empty content");
//   }

//   return text;
// }

// src/scripts/gemini-helper.mjs
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error("Missing GOOGLE_API_KEY");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

const prompt = process.argv[2];

if (!prompt) {
  console.error("Missing prompt argument");
  process.exit(1);
}

const run = async () => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty response");
    console.log(text);
  } catch (e) {
    console.error("Gemini error:", e);
    process.exit(1);
  }
};

run();

