import { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) return null;

    // upload file on cloudinary
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // if file uploaded successfully
    console.log("File is uploaded on cloudnary, res: ", res);

    return res;
  } catch (err: any) {
    // remove the locally saved temporary file
    fs.unlinkSync(localFilePath);

    return null;
  }
};
