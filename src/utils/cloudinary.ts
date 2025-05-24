// // src/utils/cloudinary.ts
// import { v2 as cloudinary } from "cloudinary";
// import { config } from "../config/config";

// cloudinary.config({
//   cloud_name: config.cloudinary_name,
//   api_key: config.cloudinary_api_key,
//   api_secret: config.cloudinary_api_secret,
// });

// export default cloudinary;


// src/utils/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/config";

// Sanity-check: ensure our env variables are loaded
if (
  !config.cloudinary_name ||
  !config.cloudinary_api_key ||
  !config.cloudinary_api_secret
) {
  throw new Error(
    `Cloudinary config missing:\n` +
      `  CLOUDINARY_CLOUD_NAME: ${config.cloudinary_name}\n` +
      `  CLOUDINARY_API_KEY:    ${config.cloudinary_api_key}\n` +
      `  CLOUDINARY_API_SECRET: ${config.cloudinary_api_secret}`
  );
}

// Configure Cloudinary with credentials from config
cloudinary.config({
  cloud_name: config.cloudinary_name,
  api_key:    config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export default cloudinary;
