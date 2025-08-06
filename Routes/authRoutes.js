// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { createUser, updateUser, deleteUser, getUsers } = require("../controllers/userController");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/users", verifyToken, isAdmin, createUser); // création d'utilisateur par admin
router.put("/users/:id", verifyToken, isAdmin, updateUser); // modification d'utilisateur par admin
router.delete("/users/:id", verifyToken, isAdmin, deleteUser); // suppression d'utilisateur par admin
router.get("/users", verifyToken, isAdmin, getUsers); // liste des utilisateurs pour admin

module.exports = router;
