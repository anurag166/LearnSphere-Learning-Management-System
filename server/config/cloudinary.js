import cloudinary from "cloudinary";

export const cloudinaryConnect = () => {
  try {
    cloudinary.v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    console.log(" Cloudinary connected successfully");
  } catch (error) {
    console.error(" Cloudinary connection failed");
    console.error(error);
  }
};
