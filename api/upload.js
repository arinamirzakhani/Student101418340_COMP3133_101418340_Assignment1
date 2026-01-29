const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

let handler;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage() });

module.exports = async (req, res) => {
  if (!handler) {
    const app = express();
    app.use(cors());

    // ✅ upload route
    app.post("/api/upload", upload.single("file"), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const b64 = req.file.buffer.toString("base64");
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: "comp3133_assignment1",
        });

        return res.json({
          success: true,
          message: "Uploaded",
          url: result.secure_url,
          public_id: result.public_id,
        });
      } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
      }
    });

    handler = app;
  }

  return handler(req, res);
};
