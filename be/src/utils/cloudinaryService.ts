// Cloudinary Upload Service
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Upload image buffer to Cloudinary
 */
export const uploadImage = async (
  buffer: Buffer,
  folder: string = "locations"
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          quality: "auto:best",
          flags: "preserve_transparency",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
            });
          }
        }
      )
      .end(buffer);
  });
};

/**
 * Upload image from base64 string
 */
export const uploadBase64Image = async (
  base64Data: string,
  folder: string = "locations"
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      base64Data,
      {
        folder,
        resource_type: "image",
        quality: "auto:best",
        flags: "preserve_transparency",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      }
    );
  });
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  base64Images: string[],
  folder: string = "locations"
): Promise<UploadResult[]> => {
  const uploadPromises = base64Images.map((img) =>
    uploadBase64Image(img, folder)
  );
  return Promise.all(uploadPromises);
};

export default cloudinary;
