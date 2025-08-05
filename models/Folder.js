const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  data: Buffer,
  mimetype: String,
  size: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  tags: [String], // كلمات مفتاحية
  status: {
    type: String,
    enum: ["archive", "courent", "stable", "other"], // يمكن إضافة المزيد
    default: "courent"
  },
  sharedWith: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      type: { 
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
      },
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  // Champs pour les fichiers copiés partagés
  isSharedCopy: {
    type: Boolean,
    default: false
  },
  originalOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  originalFileId: {
    type: mongoose.Schema.Types.ObjectId
  }
});

const FolderSchema = new mongoose.Schema({
  name: String,
  files: [FileSchema],
  subfolders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [   // نفس نظام المشاركة للمجلدات
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      type: { 
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
      }
    }
  ],
  // Champs pour les dossiers copiés partagés
  isSharedCopy: {
    type: Boolean,
    default: false
  },
  originalOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  originalFolderId: {
    type: mongoose.Schema.Types.ObjectId
  },
  sharedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Folder', FolderSchema);
