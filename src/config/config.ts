import { config as configuration } from "dotenv";
configuration();

const _config = {
  port: process.env.PORT,
  url: process.env.DATABASE_URL,
  env: process.env.NODE_ENV,
};

export const config = Object.freeze(_config);