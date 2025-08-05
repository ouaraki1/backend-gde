// backend/middlewares/upload.js
const multer = require("multer");

const allowedMimeTypes = [
  "image/jpeg", "image/png", "application/pdf",
  "application/msword", 
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
  "application/vnd.ms-excel", 
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
  "application/zip",
  'image/webp',
  "application/x-rar-compressed",
  "application/octet-stream" 
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.warn(`⛔ Fichier refusé: ${file.originalname}, type: ${file.mimetype}`);
    cb(new Error("Type de fichier non autorisé"), false);
  }
};

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 300 * 1024 * 1024 
  }
});

module.exports = upload;
