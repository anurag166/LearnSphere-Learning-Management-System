import cloudinary from "cloudinary";

export const uploadImageToCloudinary = async (
  file,
  folder,
  height,
  quality
) => {
  const options = {
    folder,
    resource_type: "auto",
  };

  if (height) {
    options.height = height;
  }

  if (quality) {
    options.quality = quality;
  }

  if (file?.tempFilePath) {
    return await cloudinary.v2.uploader.upload(file.tempFilePath, options);
  }

  if (file?.data) {
    return await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(options, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });

      uploadStream.end(file.data);
    });
  }

  throw new Error("No valid file path or buffer found for upload");
};
