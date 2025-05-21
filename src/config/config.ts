import { config as configuration } from "dotenv";
configuration();

const _config = {
  port: process.env.PORT,
  url: process.env.DATABASE_URL
};

export const config = Object.freeze(_config);