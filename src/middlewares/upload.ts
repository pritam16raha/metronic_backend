import multer from "multer";

// keep uploads in memory so we can pipe straight to Cloudinary
const storage = multer.memoryStorage();
export const upload = multer({ storage });
