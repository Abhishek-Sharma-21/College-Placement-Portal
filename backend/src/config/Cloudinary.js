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
    folder: "placement-portal-profiles", // A folder name in your Cloudinary account
    allowed_formats: ["jpg", "png", "jpeg"],
    // You can add transformations here if needed
    // transformation: [{ width: 500, height: 500, crop: 'limit' }]
  },
});

// Create the Multer upload instance
const upload = multer({ storage: storage });

export default upload;
