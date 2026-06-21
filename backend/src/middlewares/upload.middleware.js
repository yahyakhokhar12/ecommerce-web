import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { ApiError } from '../utils/apiError.js';
import streamifier from 'streamifier';
import crypto from 'crypto';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';

const storage = multer.memoryStorage();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new ApiError(400, 'Only image files are allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const saveLocalUpload = async (file, folder = 'ecommerce') => {
  const uploadFolder = folder.replace(/^ecommerce\/?/, '') || 'misc';
  const extension = path.extname(file.originalname || '') || '.jpg';
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${extension}`;
  const absoluteDir = path.join(__dirname, '..', '..', 'uploads', uploadFolder);
  const absolutePath = path.join(absoluteDir, filename);

  await mkdir(absoluteDir, { recursive: true });
  await writeFile(absolutePath, file.buffer);

  return {
    public_id: `local/${uploadFolder}/${filename}`,
    url: `/uploads/${uploadFolder}/${filename}`,
  };
};

export const uploadToCloudinary = (file, folder = 'ecommerce') => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return saveLocalUpload(file, folder);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }, { quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  }).catch(() => saveLocalUpload(file, folder));
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // log silently
  }
};
