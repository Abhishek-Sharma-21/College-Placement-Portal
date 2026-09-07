import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "placement-portal-profiles",
    allowed_formats: ["jpg", "png", "jpeg"],
    // Apply auto-cropping, optimization, and scaling on Cloudinary side
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto", fetch_format: "auto" }
    ],
  },
});

// Create the Multer upload instance with 2MB file size limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max size limit
  },
});

export default upload;
