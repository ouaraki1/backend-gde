// // folderController.js 
// const Folder = require("../models/Folder");

// exports.createFolder = async (req, res) => {
//     try {
//         const folder = new Folder({
//             name: req.body.name,
//             user: req.user.id
//         });
//         await folder.save();
//         res.status(201).json(folder);
//     } catch (error) {
//         res.status(500).json({ message: "Erreur serveur." });
//     }
// };

// exports.createSubfolder = async (req, res) => {
//     const { parentId } = req.params;
//     const { name } = req.body;

//     try {
//         const parent = await Folder.findOne({ _id: parentId, user: req.user.id });
//         if (!parent) {
//             return res.status(404).json({ message: "Dossier parent introuvable." });
//         }

//         const existingFolder = await Folder.findOne({ name: name.trim(), parent: parent._id, user: req.user.id });
//         if (existingFolder) {
//             return res.status(400).json({ message: "Un dossier avec ce nom existe déjà." });
//         }

//         const newFolder = new Folder({
//             name: name.trim(),
//             parent: parent._id,
//             user: req.user.id
//         });

//         await newFolder.save();
//         parent.subfolders.push(newFolder._id);
//         await parent.save();

//         res.status(201).json({ message: "Sous-dossier créé avec succès.", folder: newFolder });
//     } catch (error) {
//         res.status(500).json({ message: "Erreur serveur lors de la création du sous-dossier." });
//     }
// };

// exports.uploadFiles = async (req, res) => {
//     try {
//         const folder = await Folder.findOne({ _id: req.params.folderId, user: req.user.id });
//         if (!folder) {
//             return res.status(404).json({ message: "Dossier introuvable." });
//         }

//         if (!req.files || req.files.length === 0) {
//             return res.status(400).json({ message: "Aucun fichier fourni." });
//         }

//         const allowedTypes = [
//             'image/jpeg', 'image/png', 'application/pdf',
//             'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//             'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//             'application/zip', 'application/x-rar-compressed',
//             'application/octet-stream'
//         ];

//         const addedFiles = [];

//         for (const file of req.files) {
//             if (!allowedTypes.includes(file.mimetype)) continue;

//             const fileData = {
//                 name: file.originalname,
//                 data: file.buffer,
//                 mimetype: file.mimetype,
//                 size: file.size
//             };

//             folder.files.push(fileData);
//             addedFiles.push(file.originalname);
//         }

//         await folder.save();

//         res.status(200).json({
//             message: `${addedFiles.length} fichier(s) ajouté(s) avec succès.`,
//             fichiers: addedFiles
//         });
//     } catch (error) {
//         res.status(500).json({ message: "Erreur serveur lors de l'upload des fichiers.", error: error.message });
//     }
// };

// exports.search = async (req, res) => {
//     try {
//         const { q } = req.query;

//         if (!q) {
//             return res.status(400).json({ message: "Query parameter 'q' is required" });
//         }

//         const isAdmin = req.user.role === "admin";

//         const folderQuery = isAdmin
//             ? { name: { $regex: q, $options: "i" } }
//             : { name: { $regex: q, $options: "i" }, user: req.user.id };

//         const folders = await Folder.find(folderQuery).select('name _id parent');

//         const foldersWithFiles = await Folder.find(isAdmin ? {} : {
//             $or: [
//                 { user: req.user.id },
//                 { "files.sharedWith": req.user.id }
//             ]
//         });

//         const results = [];

//         folders.forEach(folder => {
//             results.push({
//                 _id: folder._id,
//                 name: folder.name,
//                 type: 'folder',
//                 parent: folder.parent
//             });
//         });

//         foldersWithFiles.forEach(folder => {
//             folder.files.forEach(file => {
//                 const shared = file.sharedWith.map(id => id.toString());
//                 const isVisible = isAdmin || folder.user.toString() === req.user.id || shared.includes(req.user.id);
//                 if (
//                     isVisible &&
//                     file.name.toLowerCase().includes(q.toLowerCase())
//                 ) {
//                     results.push({
//                         _id: file._id,
//                         name: file.name,
//                         type: 'file',
//                         folderId: folder._id,
//                         folderName: folder.name,
//                         tags: file.tags,
//                         status: file.status
//                     });
//                 }
//             });
//         });

//         res.status(200).json(results);
//     } catch (error) {
//         res.status(500).json({ message: "Erreur serveur." });
//     }
// };


// exports.deleteFile = async (req, res) => {
//     const { folderId, fileId } = req.params;

//     try {
//         const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
//         if (!folder) {
//             return res.status(404).json({ message: "المجلد غير موجود." });
//         }

//         folder.files = folder.files.filter(file => file._id.toString() !== fileId);
//         await folder.save();

//         res.status(200).json({ message: "تم حذف الملف بنجاح." });
//     } catch (error) {
//         res.status(500).json({ message: "حدث خطأ في الخادم." });
//     }
// };

// exports.deleteFolder = async (req, res) => {
//     const { folderId } = req.params;

//     try {
//         const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
//         if (!folder) {
//             return res.status(404).json({ message: "المجلد غير موجود." });
//         }

//         if (folder.parent) {
//             const parent = await Folder.findById(folder.parent);
//             if (parent) {
//                 parent.subfolders = parent.subfolders.filter(subId => subId.toString() !== folderId);
//                 await parent.save();
//             }
//         }

//         await folder.deleteOne();
//         res.status(200).json({ message: "تم حذف المجلد بنجاح." });
//     } catch (error) {
//         res.status(500).json({ message: "حدث خطأ في الخادم." });
//     }
// };

// exports.getFileById = async (req, res) => {
//     const { folderId, fileId } = req.params;

//     try {
//         const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
//         if (!folder) {
//             return res.status(404).json({ message: "المجلد غير موجود." });
//         }

//         const file = folder.files.id(fileId);
//         if (!file) {
//             return res.status(404).json({ message: "الملف غير موجود." });
//         }

//         res.set("Content-Type", file.mimetype);
//         res.send(file.data);
//     } catch (error) {
//         res.status(500).json({ message: "خطأ في الخادم." });
//     }
// };

// exports.getFilesInFolder = async (req, res) => {
//     const { folderId } = req.params;

//     try {
//         const folder = await Folder.findOne({ _id: folderId, user: req.user.id });
//         if (!folder) {
//             return res.status(404).json({ message: "المجلد غير موجود." });
//         }

//         const filesInfo = folder.files.map(file => ({
//             id: file._id,
//             name: file.name,
//             mimetype: file.mimetype,
//             size: file.data.length,
//             uploadedAt: file.createdAt || file._id.getTimestamp()
//         }));

//         res.status(200).json(filesInfo);
//     } catch (error) {
//         res.status(500).json({ message: "خطأ في الخادم." });
//     }
// };

// exports.getMainFolders = async (req, res) => {
//     try {
//         const mainFolders = await Folder.find({ parent: null, user: req.user.id }).select('name createdAt').lean();
//         res.status(200).json(mainFolders);
//     } catch (error) {
//         res.status(500).json({ message: "خطأ في الخادم." });
//     }
// };

// exports.getMainFolderWithContents = async (req, res) => {
//     try {
//         const { folderId } = req.params;
//         const folder = await Folder.findOne({ _id: folderId, user: req.user.id });

//         if (!folder) {
//             return res.status(404).json({ message: 'Dossier non trouvé' });
//         }

//         const folderWithContents = await exports.getFolderTree(folder);
//         res.json(folderWithContents);
//     } catch (error) {
//         res.status(500).json({ message: 'Erreur serveur', error: error.message });
//     }
// };

// exports.getFolderTree = async (folder) => {
//     const folderObj = folder.toObject();
//     if (folderObj.subfolders && Array.isArray(folderObj.subfolders)) {
//         folderObj.subfolders = await Promise.all(
//             folderObj.subfolders.map(async (subfolderId) => {
//                 const subfolder = await Folder.findOne({ _id: subfolderId, user: folder.user });
//                 if (subfolder) return await exports.getFolderTree(subfolder);
//                 return null;
//             })
//         );
//         folderObj.subfolders = folderObj.subfolders.filter(sub => sub !== null);
//     } else {
//         folderObj.subfolders = [];
//     }
//     folderObj.files = folderObj.files || [];
//     return folderObj;
// };

// const User = require("../models/User");

// exports.getAllFiles = async (req, res) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ message: "Access denied. Admin only." });
//   }

//   try {
//     const folders = await Folder.find({})
//       .populate("user", "username email") // لجلب معلومات صاحب الملف
//       .lean();

//     const allFiles = [];

//     folders.forEach(folder => {
//       folder.files.forEach(file => {
//         allFiles.push({
//           fileId: file._id,
//           fileName: file.name,
//           mimetype: file.mimetype,
//           size: file.data.length,
//           status: file.status,
//           tags: file.tags,
//           uploadedAt: file.createdAt || file._id.getTimestamp(),
//           folderId: folder._id,
//           folderName: folder.name,
//           owner: {
//             id: folder.user._id,
//             username: folder.user.username,
//             email: folder.user.email
//           }
//         });
//       });
//     });

//     res.status(200).json(allFiles);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
// exports.updateFileMetadata = async (req, res) => {
//     const { folderId, fileId } = req.params;
//     const { name, tags, status } = req.body;

//     try {
//       const folder = await Folder.findOne({ _id: folderId });
//       if (!folder) return res.status(404).json({ message: "Folder not found." });

//       const file = folder.files.id(fileId);
//       if (!file) return res.status(404).json({ message: "File not found." });

//       const isOwner = folder.user.toString() === req.user.id;
//       const isAdmin = req.user.role === "admin";
//       const isSharedWith = file.sharedWith.map(id => id.toString()).includes(req.user.id);

//       if (!isOwner && !isAdmin && !isSharedWith) {
//         return res.status(403).json({ message: "Unauthorized to edit this file." });
//       }

//       if (name) file.name = name;
//       if (tags) file.tags = Array.isArray(tags) ? tags : [tags];
//       if (status) file.status = status;

//       await folder.save();

//       res.status(200).json({ message: "File metadata updated.", file });
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   };
//   exports.renameFolder = async (req, res) => {
//     const { folderId } = req.params;
//     const { name } = req.body;

//     try {
//       const folder = await Folder.findById(folderId);
//       if (!folder) return res.status(404).json({ message: "Folder not found." });

//       const isOwner = folder.user.toString() === req.user.id;
//       const isAdmin = req.user.role === "admin";
//       if (!isOwner && !isAdmin) {
//         return res.status(403).json({ message: "Unauthorized to rename this folder." });
//       }

//       folder.name = name;
//       await folder.save();

//       res.status(200).json({ message: "Folder renamed successfully.", folder });
//     } catch (error) {
//       res.status(500).json({ message: "Server error", error: error.message });
//     }
//   };



const Folder = require("../models/Folder");
const User = require("../models/User");
const mongoose = require("mongoose");

// دوال مساعدة للتحقق من الصلاحيات
function canAccessFolder(folder, user) {
    if (user.role === "admin") return true;
    if (folder.user.toString() === user.id) return true;
    const shared = folder.sharedWith.find(
        (entry) => entry.user.toString() === user.id && entry.type === "accepted"
    );
    return !!shared;
}

function canAccessFile(folder, file, user) {
    if (user.role === "admin") return true;
    if (folder.user.toString() === user.id) return true;
    const shared = file.sharedWith.find(
        (entry) => entry.user.toString() === user.id && entry.type === "accepted"
    );
    return !!shared;
}

// إنشاء مجلد جديد (المالك هو المستخدم الحالي)
exports.createFolder = async (req, res) => {
    try {
        const folder = new Folder({
            name: req.body.name,
            user: req.user.id,
        });
        await folder.save();
        res.status(201).json(folder);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// إنشاء مجلد فرعي
exports.createSubfolder = async (req, res) => {
    const { parentId } = req.params;
    const { name } = req.body;

    try {
        const parent = await Folder.findOne({ _id: parentId });
        if (!parent) {
            return res.status(404).json({ message: "Dossier parent introuvable." });
        }
        // التحقق من صلاحية المستخدم (مالك المجلد أو admin)
        if (
            parent.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Unauthorized." });
        }

        const existingFolder = await Folder.findOne({
            name: name.trim(),
            parent: parent._id,
            user: parent.user,
        });
        if (existingFolder) {
            return res
                .status(400)
                .json({ message: "Un dossier avec ce nom existe déjà." });
        }

        const newFolder = new Folder({
            name: name.trim(),
            parent: parent._id,
            user: parent.user, // يرث مالك المجلد الأب
        });

        await newFolder.save();
        parent.subfolders.push(newFolder._id);
        await parent.save();

        res.status(201).json({ message: "Sous-dossier créé avec succès.", folder: newFolder });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur lors de la création du sous-dossier." });
    }
};

// رفع ملفات إلى مجلد (يجب أن يكون المستخدم مالك المجلد أو admin)
exports.uploadFiles = async (req, res) => {
    try {
        const folder = await Folder.findOne({ _id: req.params.folderId });
        if (!folder) {
            return res.status(404).json({ message: "Dossier introuvable." });
        }

        if (
            folder.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Unauthorized." });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Aucun fichier fourni." });
        }

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/zip",
            "application/x-rar-compressed",
            "application/octet-stream",
        ];

        const addedFiles = [];

        // Récupérer les tags و status depuis le body
        const tags = req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        const status = req.body.status || "courent";

        console.log('Upload - Tags reçus:', tags);
        console.log('Upload - Status reçu:', status);

        for (const file of req.files) {
            if (!allowedTypes.includes(file.mimetype)) continue;

            const fileData = {
                name: file.originalname,
                data: file.buffer,
                mimetype: file.mimetype,
                size: file.size,
                tags: tags,
                status: status,
                sharedWith: [], // بداية بدون مشاركة
            };

            folder.files.push(fileData);
            addedFiles.push(file.originalname);
        }

        await folder.save();

        res.status(200).json({
            message: `${addedFiles.length} fichier(s) ajouté(s) avec succès.`,
            fichiers: addedFiles,
        });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Erreur serveur lors de l'upload des fichiers.", error: error.message });
    }
};

// البحث (يبحث في المجلدات والملفات التي يمتلكها المستخدم أو شاركوا معه أو admin)
exports.search = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ message: "Query parameter 'q' is required" });
        }

        const isAdmin = req.user.role === "admin";

        const folderQuery = isAdmin
            ? {} // admin يشاهد كل المجلدات
            : {
                $or: [
                    { user: req.user.id },
                    { "sharedWith.user": req.user.id, "sharedWith.type": "accepted" },
                ],
            };

        const folders = await Folder.find(folderQuery);

        const results = [];

        // مجلدات تطابق الاسم
        folders.forEach((folder) => {
            if (folder.name.toLowerCase().includes(q.toLowerCase())) {
                results.push({
                    _id: folder._id,
                    name: folder.name,
                    type: "folder",
                    parent: folder.parent,
                });
            }

            // بحث في الملفات داخل المجلد
            folder.files.forEach((file) => {
                const canView =
                    isAdmin ||
                    folder.user.toString() === req.user.id ||
                    file.sharedWith.some(
                        (entry) =>
                            entry.user.toString() === req.user.id && entry.type === "accepted"
                    );

                if (canView && file.name.toLowerCase().includes(q.toLowerCase())) {
                    results.push({
                        _id: file._id,
                        name: file.name,
                        type: "file",
                        folderId: folder._id,
                        folderName: folder.name,
                        tags: file.tags,
                        status: file.status,
                    });
                }
            });
        });

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

// حذف ملف (مالك المجلد أو admin فقط)
exports.deleteFile = async (req, res) => {
    const { folderId, fileId } = req.params;

    try {
        const folder = await Folder.findOne({ _id: folderId });
        if (!folder) {
            return res.status(404).json({ message: "المجلد غير موجود." });
        }

        if (
            folder.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Unauthorized." });
        }

        folder.files = folder.files.filter((file) => file._id.toString() !== fileId);
        await folder.save();

        res.status(200).json({ message: "تم حذف الملف بنجاح." });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ في الخادم." });
    }
};

// حذف مجلد (مالك المجلد أو admin فقط)
exports.deleteFolder = async (req, res) => {
    const { folderId } = req.params;

    try {
        const folder = await Folder.findOne({ _id: folderId });
        if (!folder) {
            return res.status(404).json({ message: "المجلد غير موجود." });
        }

        if (
            folder.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Unauthorized." });
        }

        if (folder.parent) {
            const parent = await Folder.findById(folder.parent);
            if (parent) {
                parent.subfolders = parent.subfolders.filter(
                    (subId) => subId.toString() !== folderId
                );
                await parent.save();
            }
        }

        await folder.deleteOne();
        res.status(200).json({ message: "تم حذف المجلد بنجاح." });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ في الخادم." });
    }
};

// جلب ملف (مالك المجلد أو admin أو مشترك معه)
exports.getFileById = async (req, res) => {
    const { folderId, fileId } = req.params;

    try {
        const folder = await Folder.findOne({ _id: folderId });
        if (!folder) {
            return res.status(404).json({ message: "المجلد غير موجود." });
        }

        const file = folder.files.id(fileId);
        if (!file) {
            return res.status(404).json({ message: "الملف غير موجود." });
        }

        if (!canAccessFile(folder, file, req.user)) {
            return res.status(403).json({ message: "Unauthorized." });
        }

        res.set("Content-Type", file.mimetype);
        res.send(file.data);
    } catch (error) {
        res.status(500).json({ message: "خطأ في الخادم." });
    }
};

// جلب الملفات في مجلد (مالك المجلد أو admin فقط)
exports.getFilesInFolder = async (req, res) => {
    const { folderId } = req.params;

    try {
        const folder = await Folder.findOne({ _id: folderId });
        if (!folder) {
            return res.status(404).json({ message: "المجلد غير موجود." });
        }

        if (
            folder.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Unauthorized." });
        }

        const filesInfo = folder.files.map((file) => ({
            id: file._id,
            name: file.name,
            mimetype: file.mimetype,
            size: file.data.length,
            tags: file.tags,
            status: file.status,
            uploadedAt: file.createdAt || file._id.getTimestamp(),
        }));

        res.status(200).json(filesInfo);
    } catch (error) {
        res.status(500).json({ message: "خطأ في الخادم." });
    }
};

// جلب المجلدات الرئيسية للمستخدم
exports.getMainFolders = async (req, res) => {
    try {
        let mainFolders;
        
        if (req.user.role === "admin") {
            // Pour les admins, récupérer tous les dossiers principaux
            mainFolders = await Folder.find({ parent: null })
                .select("name createdAt user isSharedCopy originalOwner")
                .populate("originalOwner", "username email")
                .lean();
        } else {
            // Pour les utilisateurs normaux, récupérer leurs dossiers principaux ET les dossiers partagés copiés
            const userMainFolder = await Folder.findOne({ 
                user: req.user.id, 
                parent: null 
            });
            
            if (userMainFolder) {
                // Récupérer les dossiers principaux de l'utilisateur
                const userFolders = await Folder.find({ 
                    parent: null, 
                    user: req.user.id 
                })
                .select("name createdAt user isSharedCopy originalOwner")
                .populate("originalOwner", "username email")
                .lean();
                
                // Récupérer les dossiers partagés copiés qui sont enfants du dossier principal
                const sharedFolders = await Folder.find({ 
                    parent: userMainFolder._id,
                    user: req.user.id,
                    isSharedCopy: true
                })
                .select("name createdAt user isSharedCopy originalOwner sharedAt")
                .populate("originalOwner", "username email")
                .lean();
                
                mainFolders = [...userFolders, ...sharedFolders];
            } else {
                // Si l'utilisateur n'a pas de dossier principal, créer un vide
                mainFolders = [];
            }
        }
        
        res.status(200).json(mainFolders);
    } catch (error) {
        console.error('Error in getMainFolders:', error);
        res.status(500).json({ message: "خطأ في الخادم." });
    }
};

// جلب مجلد مع محتوياته (مجلدات فرعية وملفات)
exports.getMainFolderWithContents = async (req, res) => {
    try {
        const { folderId } = req.params;
        const folder = await Folder.findOne({ _id: folderId })
            .populate("originalOwner", "username email");
        if (!folder) {
            return res.status(404).json({ message: "Dossier non trouvé" });
        }

        if (!canAccessFolder(folder, req.user)) {
            return res.status(403).json({ message: "Unauthorized." });
        }

        const folderWithContents = await exports.getFolderTree(folder, req.user);
        res.json(folderWithContents);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// دالة مساعدة لاسترجاع شجرة المجلدات (مجلدات فرعية وملفات)
exports.getFolderTree = async (folder, user) => {
    const folderObj = folder.toObject();

    if (folderObj.subfolders && Array.isArray(folderObj.subfolders)) {
        folderObj.subfolders = await Promise.all(
            folderObj.subfolders.map(async (subfolderId) => {
                const subfolder = await Folder.findOne({ _id: subfolderId })
                    .populate("originalOwner", "username email");
                if (subfolder && canAccessFolder(subfolder, user)) {
                    return await exports.getFolderTree(subfolder, user);
                }
                return null;
            })
        );
        folderObj.subfolders = folderObj.subfolders.filter((sub) => sub !== null);
    } else {
        folderObj.subfolders = [];
    }

    folderObj.files = folderObj.files || [];
    return folderObj;
};

// جلب كل الملفات لجميع المستخدمين (admin فقط)
exports.getAllFiles = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admin only." });
    }

    try {
        const folders = await Folder.find({})
            .populate("user", "username email")
            .lean();

        const allFiles = [];

        folders.forEach((folder) => {
            folder.files.forEach((file) => {
                allFiles.push({
                    fileId: file._id,
                    fileName: file.name,
                    mimetype: file.mimetype,
                    size: file.data.length,
                    status: file.status,
                    tags: file.tags,
                    uploadedAt: file.createdAt || file._id.getTimestamp(),
                    folderId: folder._id,
                    folderName: folder.name,
                    owner: {
                        id: folder.user._id,
                        username: folder.user.username,
                        email: folder.user.email,
                    },
                });
            });
        });

        res.status(200).json(allFiles);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// تحديث بيانات ملف (الاسم، التاغات، الحالة)
exports.updateFileMetadata = async (req, res) => {
    const { folderId, fileId } = req.params;
    const { name, tags, status } = req.body;

    try {
        const folder = await Folder.findOne({ _id: folderId });
        if (!folder) return res.status(404).json({ message: "Folder not found." });

        const file = folder.files.id(fileId);
        if (!file) return res.status(404).json({ message: "File not found." });

        const isOwner = folder.user.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        const isSharedWith = file.sharedWith.some(
            (entry) => entry.user.toString() === req.user.id && entry.type === "accepted"
        );

        if (!isOwner && !isAdmin && !isSharedWith) {
            return res.status(403).json({ message: "Unauthorized to edit this file." });
        }

        if (name) file.name = name;
        if (tags) file.tags = Array.isArray(tags) ? tags : [tags];
        if (status) file.status = status;

        await folder.save();

        res.status(200).json({ message: "File metadata updated.", file });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// إعادة تسمية مجلد (مالك المجلد أو admin فقط)
exports.renameFolder = async (req, res) => {
    const { folderId } = req.params;
    const { name } = req.body;

    try {
        const folder = await Folder.findById(folderId);
        if (!folder) return res.status(404).json({ message: "Folder not found." });

        const isOwner = folder.user.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized to rename this folder." });
        }

        folder.name = name;
        await folder.save();

        res.status(200).json({ message: "Folder renamed successfully.", folder });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// مشاركة ملف مع مستخدم آخر
exports.shareFile = async (req, res) => {
    const { folderId, fileId } = req.params;
    const { recipientId, password } = req.body;

    try {
        // التحقق من كلمة السر للمستخدم المرسل
        const user = await User.findById(req.user.id);
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Wrong password." });
        }

        const folder = await Folder.findById(folderId);
        if (!folder) {
            return res.status(404).json({ message: "Folder not found." });
        }

        const file = folder.files.id(fileId);
        if (!file) {
            return res.status(404).json({ message: "File not found." });
        }

        // التحقق من الصلاحيات
        const isOwner = folder.user.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ message: "Unauthorized to share this file." });
        }

        // التحقق هل تم المشاركة مسبقاً
        if (file.sharedWith.some(entry => entry.user.toString() === recipientId && entry.type === "pending")) {
            return res.status(400).json({ message: "Already shared and pending." });
        }

        // إضافة مشاركة جديدة مع حالة "pending"
        file.sharedWith.push({ user: recipientId, type: "pending" });
        await folder.save();

        res.status(200).json({ message: "File shared successfully." });
    } catch (error) {
        console.error("Error sharing file:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// رد على طلب مشاركة ملف
exports.respondToFileShare = async (req, res) => {
    const { folderId, fileId } = req.params;
    const { response } = req.body; // "accepted" أو "rejected"

    try {
        console.log('🔍 respondToFileShare called with:', { folderId, fileId, response, userId: req.user.id });

        const folder = await Folder.findById(folderId);
        if (!folder) {
            console.error('❌ Folder not found:', folderId);
            return res.status(404).json({ message: "Folder not found." });
        }

        console.log('✅ Folder found:', folder.name);

        const file = folder.files.id(fileId);
        if (!file) {
            console.error('❌ File not found:', fileId);
            return res.status(404).json({ message: "File not found." });
        }

        console.log('✅ File found:', file.name);
        console.log('📋 File sharedWith entries:', file.sharedWith);

        const sharedEntry = file.sharedWith.find(entry => entry.user.toString() === req.user.id);
        if (!sharedEntry) {
            console.error('❌ User not found in sharedWith:', req.user.id);
            return res.status(403).json({ message: "Not shared with you." });
        }

        console.log('✅ Shared entry found:', sharedEntry);
        console.log('🔄 Updating status from', sharedEntry.type, 'to', response);

        sharedEntry.type = response;
        await folder.save();

        console.log('✅ Folder saved successfully');

        // Si l'utilisateur accepte le fichier, le copier dans son dossier principal
        if (response === "accepted") {
            try {
                console.log('📁 Copying accepted file to user\'s main folder...');
                
                // Trouver le dossier principal de l'utilisateur qui accepte
                const userMainFolder = await Folder.findOne({ 
                    user: req.user.id, 
                    parent: null 
                });

                if (!userMainFolder) {
                    console.error('❌ User main folder not found for user:', req.user.id);
                    return res.status(404).json({ message: "User main folder not found." });
                }

                console.log('✅ User main folder found:', userMainFolder.name);

                // Créer une copie du fichier
                const fileCopy = {
                    name: file.name,
                    mimetype: file.mimetype,
                    data: file.data,
                    size: file.size,
                    status: file.status,
                    tags: file.tags,
                    createdAt: new Date(),
                    sharedWith: [],
                    originalOwner: folder.user, // Garder une référence au propriétaire original
                    originalFileId: file._id, // Garder une référence au fichier original
                    isSharedCopy: true // Marquer comme une copie partagée
                };

                // Ajouter le fichier copié au dossier principal de l'utilisateur
                userMainFolder.files.push(fileCopy);
                await userMainFolder.save();

                console.log('✅ File copied successfully to user\'s main folder');
                console.log('📄 Copied file details:', {
                    name: fileCopy.name,
                    size: fileCopy.size,
                    originalOwner: folder.user,
                    isSharedCopy: true
                });

            } catch (copyError) {
                console.error('❌ Error copying file to user folder:', copyError);
                // Ne pas échouer complètement si la copie échoue
                console.log('⚠️ Continuing with share response despite copy error');
            }
        }

        res.status(200).json({ 
            message: `You have ${response} the shared file.`,
            fileId: fileId,
            folderId: folderId,
            status: response,
            copied: response === "accepted"
        });
    } catch (error) {
        console.error("❌ Error responding to file share:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// جلب الملفات المشتركة مع المستخدم
exports.getSharedFiles = async (req, res) => {
    try {
        console.log("🔍 getSharedFiles called for user:", req.user.id);
        
        // Check if user exists and has valid ID
        if (!req.user || !req.user.id) {
            console.error("❌ Invalid user or user ID");
            return res.status(400).json({ message: "Invalid user" });
        }

        // First, let's check if we can connect to the database
        if (mongoose.connection.readyState !== 1) {
            console.error("❌ Database not connected");
            return res.status(500).json({ message: "Database connection error" });
        }

        console.log("✅ Database connection verified");

        // Use a more defensive query approach
        let folders;
        try {
            folders = await Folder.find({
                "files.sharedWith.user": req.user.id,
                "files.sharedWith.type": "accepted"
            }).populate("user", "username email");
            
            console.log(`📁 Found ${folders.length} folders with accepted shares`);
        } catch (queryError) {
            console.error("❌ Query error:", queryError);
            return res.status(500).json({ message: "Database query error", error: queryError.message });
        }

        const sharedFiles = [];

        // Process folders with error handling
        folders.forEach((folder, folderIndex) => {
            try {
                console.log(`📁 Processing folder ${folderIndex + 1}: ${folder.name || 'Unnamed'} with ${folder.files ? folder.files.length : 0} files`);
                
                if (!folder.files || !Array.isArray(folder.files)) {
                    console.log(`⚠️ Folder ${folderIndex + 1} has no files array`);
                    return;
                }
                
                folder.files.forEach((file, fileIndex) => {
                    try {
                        console.log(`📄 Processing file ${fileIndex + 1}: ${file.name || 'Unnamed'}`);
                        
                        // Check if file has sharedWith property
                        if (!file.sharedWith || !Array.isArray(file.sharedWith)) {
                            console.log(`⚠️ File ${fileIndex + 1} has no sharedWith array`);
                            return;
                        }
                        
                        console.log(`   sharedWith entries: ${file.sharedWith.length}`);
                        
                        // Check if this file is shared with the current user
                        const isSharedWith = file.sharedWith.some(entry => {
                            try {
                                return entry && 
                                       entry.user && 
                                       entry.user.toString() === req.user.id && 
                                       entry.type === "accepted";
                            } catch (entryError) {
                                console.log(`⚠️ Error processing sharedWith entry:`, entryError.message);
                                return false;
                            }
                        });
                        
                        console.log(`   Is shared with user: ${isSharedWith}`);
                        
                        if (isSharedWith) {
                            // Safely extract file data
                            const fileData = {
                                fileId: file._id || null,
                                fileName: file.name || 'Unnamed',
                                mimetype: file.mimetype || 'unknown',
                                size: file.data ? file.data.length : 0,
                                status: file.status || 'courent',
                                tags: file.tags || [],
                                uploadedAt: file.createdAt || (file._id ? file._id.getTimestamp() : new Date()),
                                folderId: folder._id || null,
                                folderName: folder.name || 'Unnamed',
                                owner: {
                                    id: folder.user ? folder.user._id : null,
                                    username: folder.user ? folder.user.username : 'Unknown',
                                    email: folder.user ? folder.user.email : 'unknown@example.com',
                                },
                            };
                            
                            sharedFiles.push(fileData);
                            console.log(`✅ Added file: ${fileData.fileName}`);
                        }
                    } catch (fileError) {
                        console.error(`❌ Error processing file ${fileIndex + 1}:`, fileError.message);
                    }
                });
            } catch (folderError) {
                console.error(`❌ Error processing folder ${folderIndex + 1}:`, folderError.message);
            }
        });

        console.log(`📋 Returning ${sharedFiles.length} shared files`);
        res.status(200).json(sharedFiles);
        
    } catch (error) {
        console.error("❌ Error getting shared files:", error);
        console.error("Error details:", error.message);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// جلب الملفات في انتظار الرد (pending)
exports.getPendingFileShares = async (req, res) => {
    try {
        const folders = await Folder.find({
            "files.sharedWith.user": req.user.id,
            "files.sharedWith.type": "pending"
        }).populate("user", "username email");

        const pendingFiles = [];

        folders.forEach(folder => {
            folder.files.forEach(file => {
                const isPending = file.sharedWith && file.sharedWith.some(
                    entry => entry.user.toString() === req.user.id && entry.type === "pending"
                );
                
                if (isPending) {
                    pendingFiles.push({
                        fileId: file._id,
                        fileName: file.name,
                        mimetype: file.mimetype,
                        size: file.data ? file.data.length : 0,
                        status: file.status,
                        tags: file.tags,
                        uploadedAt: file.createdAt || file._id.getTimestamp(),
                        folderId: folder._id,
                        folderName: folder.name,
                        owner: {
                            id: folder.user._id,
                            username: folder.user.username,
                            email: folder.user.email,
                        },
                    });
                }
            });
        });

        res.status(200).json(pendingFiles);
    } catch (error) {
        console.error("Error getting pending file shares:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

