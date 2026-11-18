import cloudinary from "../config/cloudinary.js";

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });

export const uploadImageFromBuffer = (buffer, folder = "chat_images") =>
  uploadBuffer(buffer, { folder, resource_type: "image" });

export const uploadAudioFromBuffer = (buffer, folder = "chat_audio") =>
  uploadBuffer(buffer, { folder, resource_type: "video" });
