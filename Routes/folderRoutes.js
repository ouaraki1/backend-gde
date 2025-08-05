// // backend/Routes/folderRoutes.js
// const express = require("express");
// const router = express.Router();
// const upload = require("../middlewares/upload");
// const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

// const {
//     updateFileMetadata,
//     renameFolder,
//     getAllFiles ,
//     createFolder,
//     uploadFiles,
//     search,
//     createSubfolder,
//     deleteFile,
//     deleteFolder,
//     getFileById,
//     getFilesInFolder,
//     getMainFolders,            
//     getMainFolderWithContents   
// } = require("../controllers/folderController");

// router.post("/", verifyToken, isAdmin, createFolder);
// router.post("/:folderId/upload", verifyToken, isAdmin, upload.array("files"), uploadFiles);
// router.get("/search", verifyToken, isAdmin, search);
// router.post("/:parentId/subfolder", verifyToken, isAdmin, createSubfolder);
// router.delete("/:folderId/file/:fileId", verifyToken, isAdmin, deleteFile);
// router.delete("/:folderId", verifyToken, isAdmin, deleteFolder);
// router.get("/:folderId/file/:fileId", verifyToken, isAdmin, getFileById);
// router.get("/:folderId/files", verifyToken, isAdmin, getFilesInFolder);
// router.get("/main", verifyToken, isAdmin, getMainFolders);
// router.get("/main/:folderId/contents", verifyToken, isAdmin, getMainFolderWithContents);
// router.get("/admin/all-files", verifyToken, isAdmin, getAllFiles);
// router.put("/:folderId/file/:fileId", verifyToken, updateFileMetadata);
// router.put("/:folderId", verifyToken, renameFolder);


// router.get("/users", verifyToken, async (req, res) => {
//     try {
//       const users = await User.find({ _id: { $ne: req.user.id } }).select("username email");
//       res.json(users);
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   });



//   router.post("/:folderId/share", verifyToken, async (req, res) => {
//     const { recipientId, password } = req.body;
//     const folderId = req.params.folderId;

//     try {
//       const user = await User.findById(req.user.id);
//       const isMatch = await user.matchPassword(password);

//       if (!isMatch) return res.status(401).json({ message: "Wrong password." });

//       const folder = await Folder.findById(folderId);
//       if (!folder) return res.status(404).json({ message: "Folder not found." });

//       const isOwner = folder.user.toString() === req.user.id;
//       if (!isOwner) return res.status(403).json({ message: "Unauthorized." });

//       folder.sharedWith.push({ user: recipientId });
//       await folder.save();

//       res.status(200).json({ message: "Shared request sent." });
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   });

//   router.post("/:folderId/respond", verifyToken, async (req, res) => {
//     const { response } = req.body; // "accepted" or "rejected"
//     const folderId = req.params.folderId;

//     try {
//       const folder = await Folder.findById(folderId);
//       if (!folder) return res.status(404).json({ message: "Folder not found." });

//       const sharedEntry = folder.sharedWith.find(entry => entry.user.toString() === req.user.id);
//       if (!sharedEntry) return res.status(403).json({ message: "Not shared with you." });

//       sharedEntry.type = response;
//       await folder.save();

//       res.status(200).json({ message: `You have ${response} the shared folder.` });
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   });



//   router.get("/shared/accepted", verifyToken, async (req, res) => {
//     try {
//       const folders = await Folder.find({ "sharedWith.user": req.user.id, "sharedWith.type": "accepted" })
//         .populate("user", "username email");

//       res.status(200).json(folders);
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   });



// module.exports = router;




const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const Folder = require("../models/Folder");

const {
    updateFileMetadata,
    renameFolder,
    getAllFiles,
    createFolder,
    uploadFiles,
    search,
    createSubfolder,
    deleteFile,
    deleteFolder,
    getFileById,
    getFilesInFolder,
    getMainFolders,
    getMainFolderWithContents,
    shareFile,
    respondToFileShare,
    getSharedFiles,
    getPendingFileShares,
} = require("../controllers/folderController");

// إنشاء مجلد (admin أو user)
router.post("/", verifyToken, createFolder);

// رفع ملفات (admin أو مالك المجلد فقط)
router.post(
    "/:folderId/upload",
    verifyToken,
    upload.array("files"),
    uploadFiles
);

// بحث (admin أو user)
router.get("/search", verifyToken, search);

// إنشاء مجلد فرعي
router.post("/:parentId/subfolder", verifyToken, createSubfolder);

// حذف ملف
router.delete("/:folderId/file/:fileId", verifyToken, deleteFile);

// حذف مجلد
router.delete("/:folderId", verifyToken, deleteFolder);

// جلب ملف حسب ID
router.get("/:folderId/file/:fileId", verifyToken, getFileById);

// جلب الملفات في مجلد
router.get("/:folderId/files", verifyToken, getFilesInFolder);

// جلب المجلدات الرئيسية
router.get("/main", verifyToken, getMainFolders);

// جلب مجلد رئيسي مع محتوياته
router.get("/main/:folderId/contents", verifyToken, getMainFolderWithContents);

// جلب كل الملفات (admin فقط)
router.get("/admin/all-files", verifyToken, isAdmin, getAllFiles);

// تحديث بيانات ملف
router.put("/:folderId/file/:fileId", verifyToken, updateFileMetadata);

// إعادة تسمية مجلد
router.put("/:folderId", verifyToken, renameFolder);

// جلب جميع المستخدمين (غير المستخدم الحالي) لاختيارهم في المشاركة
router.get("/users", verifyToken, async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } }).select(
            "username email"
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// مشاركة مجلد مع مستخدم آخر (يتحقق من كلمة السر للمستخدم المرسل)
router.post("/:folderId/share", verifyToken, async (req, res) => {
    const { recipientId, password } = req.body;
    const folderId = req.params.folderId;

    try {
        const user = await User.findById(req.user.id);
        const isMatch = await user.matchPassword(password);
        if (!isMatch)
            return res.status(401).json({ message: "Wrong password." });

        const folder = await Folder.findById(folderId);
        if (!folder) return res.status(404).json({ message: "Folder not found." });

        if (folder.user.toString() !== req.user.id && req.user.role !== "admin")
            return res.status(403).json({ message: "Unauthorized." });

        // التحقق هل تم المشاركة مسبقاً
        if (
            folder.sharedWith.some(
                (entry) => entry.user.toString() === recipientId && entry.type === "pending"
            )
        ) {
            return res.status(400).json({ message: "Already shared and pending." });
        }

        // إضافة مشاركة جديدة مع حالة "pending"
        folder.sharedWith.push({ user: recipientId, type: "pending" });
        await folder.save();

        res.status(200).json({ message: "Shared request sent." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// رد على طلب مشاركة (قبول أو رفض)
router.post("/:folderId/respond", verifyToken, async (req, res) => {
    const { response } = req.body; // "accepted" أو "rejected"
    const folderId = req.params.folderId;

    try {
        console.log('🔍 respondToFolderShare called with:', { folderId, response, userId: req.user.id });

        const folder = await Folder.findById(folderId);
        if (!folder) {
            console.log('❌ Folder not found:', folderId);
            return res.status(404).json({ message: "Folder not found." });
        }

        const sharedEntry = folder.sharedWith.find(
            (entry) => entry.user.toString() === req.user.id
        );
        if (!sharedEntry) {
            console.log('❌ Not shared with user:', req.user.id);
            return res.status(403).json({ message: "Not shared with you." });
        }

        sharedEntry.type = response;
        await folder.save();

        // Si le dossier est accepté, le copier dans l'espace de l'utilisateur
        if (response === "accepted") {
            try {
                console.log('📁 Copying accepted folder to user space...');
                
                // Trouver le dossier principal de l'utilisateur
                let userMainFolder = await Folder.findOne({ 
                    user: req.user.id, 
                    parent: null 
                });

                if (!userMainFolder) {
                    console.log('❌ User main folder not found, creating one...');
                    userMainFolder = new Folder({
                        name: "Dossier Principal",
                        user: req.user.id,
                        parent: null
                    });
                    await userMainFolder.save();
                }

                // Créer une copie du dossier partagé
                const folderCopy = new Folder({
                    name: folder.name,
                    user: req.user.id,
                    parent: userMainFolder._id,
                    isSharedCopy: true,
                    originalOwner: folder.user,
                    originalFolderId: folder._id,
                    sharedAt: new Date()
                });

                // Copier les sous-dossiers
                if (folder.subfolders && folder.subfolders.length > 0) {
                    folderCopy.subfolders = folder.subfolders.map(subfolder => ({
                        name: subfolder.name,
                        isSharedCopy: true,
                        originalOwner: folder.user,
                        originalFolderId: subfolder._id
                    }));
                }

                // Copier les fichiers
                if (folder.files && folder.files.length > 0) {
                    folderCopy.files = folder.files.map(file => ({
                        name: file.name,
                        data: file.data,
                        mimetype: file.mimetype,
                        size: file.size,
                        tags: file.tags,
                        status: file.status,
                        isSharedCopy: true,
                        originalOwner: folder.user,
                        originalFileId: file._id,
                        createdAt: file.createdAt
                    }));
                }

                await folderCopy.save();
                console.log('✅ Folder copied successfully:', folderCopy._id);

            } catch (copyError) {
                console.error('❌ Error copying folder to user space:', copyError);
                // Ne pas échouer complètement si la copie échoue
                console.log('⚠️ Continuing with share response despite copy error');
            }
        }

        res.status(200).json({ 
            message: `You have ${response} the shared folder.`,
            folderId: folderId,
            status: response,
            copied: response === "accepted"
        });
    } catch (error) {
        console.error("❌ Error responding to folder share:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// جلب المجلدات المشتركة التي قبلت المشاركة فيها (للمستخدم)
router.get("/shared/accepted", verifyToken, async (req, res) => {
    try {
        const folders = await Folder.find({
            "sharedWith.user": req.user.id,
            "sharedWith.type": "accepted",
        }).populate("user", "username email");

        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// جلب المجلدات في انتظار الرد (pending)
router.get("/shared/pending-folders", verifyToken, async (req, res) => {
    try {
        const folders = await Folder.find({
            "sharedWith.user": req.user.id,
            "sharedWith.type": "pending",
        }).populate("user", "username email");

        res.status(200).json(folders);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// مشاركة ملف مع مستخدم آخر
router.post("/:folderId/file/:fileId/share", verifyToken, shareFile);

// رد على طلب مشاركة ملف
router.post("/:folderId/file/:fileId/respond", verifyToken, respondToFileShare);

// جلب الملفات المشتركة مع المستخدم
router.get("/shared/files", verifyToken, getSharedFiles);

// جلب الملفات في انتظار الرد
router.get("/shared/pending-files", verifyToken, getPendingFileShares);

// جلب الملفات التي شاركها المستخدم الحالي
router.get("/my-shared-files", verifyToken, async (req, res) => {
    try {
        const folders = await Folder.find({ user: req.user.id })
            .populate("user", "username email");

        const sharedFiles = [];

        folders.forEach(folder => {
            folder.files.forEach(file => {
                if (file.sharedWith && file.sharedWith.length > 0) {
                    sharedFiles.push({
                        folderId: folder._id,
                        fileId: file._id,
                        fileName: file.name,
                        folderName: folder.name,
                        size: file.size,
                        mimetype: file.mimetype,
                        status: file.status,
                        tags: file.tags,
                        sharedAt: file.sharedWith[0]?.sharedAt || file.createdAt,
                        uploadedAt: file.createdAt,
                        sharedWith: file.sharedWith.map(share => ({
                            user: share.user,
                            type: share.type,
                            sharedAt: share.sharedAt
                        }))
                    });
                }
            });
        });

        // Populate user information for each share
        for (let file of sharedFiles) {
            for (let share of file.sharedWith) {
                const user = await User.findById(share.user).select('username email');
                share.user = user;
            }
        }

        res.status(200).json(sharedFiles);
    } catch (error) {
        console.error('Error getting my shared files:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
