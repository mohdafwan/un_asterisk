import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})

// Upload a file to Cloudinary
const uploadFileOnCloudinary = async (uploadFileData) => {
    try {
        if (!uploadFileData) throw new Error("File data is required for upload");

        // UPLOAD FILE TO CLOUDINARY
        const result = await cloudinary.uploader.upload(
            uploadFileData,
            { upload_preset: "my_preset", resource_type: "auto" }
        );
        if (!result) throw new Error("Failed to upload file");
        console.log("File uploaded successfully:", result.url);
        return result;
    } catch (error) {
        fs.unlinkSync(uploadFileData); 
        console.error("Error uploading file to Cloudinary:", error);
        throw new Error("Failed to upload file");
    }
}


export { uploadFileOnCloudinary };