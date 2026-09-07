import dotenv from "dotenv";
dotenv.config();

export const geminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || "",
  defaultModel: "gemini-3.6-flash",
  apiUrl: "https://generativelanguage.googleapis.com/v1beta/models",
};
export default geminiConfig;
