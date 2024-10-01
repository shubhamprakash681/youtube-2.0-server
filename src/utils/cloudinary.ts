import { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const uploadOnCloudinary = async (
  localFilePath: string,
  cloudinaryFolderName?: string
): Promise<UploadApiResponse | null> => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    if (!localFilePath) return null;

    // upload file on cloudinary
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: cloudinaryFolderName
        ? `youtube-2.0/${cloudinaryFolderName}`
        : "youtube-2.0",
    });

    // if file uploaded successfully
    console.log("File is uploaded on cloudnary");
    fs.unlinkSync(localFilePath);

    return res;
  } catch (err: any) {
    // remove the locally saved temporary file
    console.warn("Cloudinary file upload failed, error: ", err);
    fs.unlinkSync(localFilePath);

    return null;
  }
};

export const deleteCloudinaryFile = async (
  publicId: string
): Promise<boolean> => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    await cloudinary.uploader.destroy(publicId);
    console.log("File deleted successfully");

    return true;
  } catch (error) {
    console.warn("Cloudinary file delete failed, error: ", error);

    return false;
  }
};
