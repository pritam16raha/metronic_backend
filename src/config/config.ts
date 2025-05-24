import { config as configuration } from "dotenv";
configuration();

const _config = {
  port: process.env.PORT,
  url: process.env.DATABASE_URL,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  googleApiKey: process.env.GOOGLE_API_KEY,
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  cloudinary_name: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
};

export const config = Object.freeze(_config);