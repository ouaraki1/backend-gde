const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Créer un utilisateur (par un admin)
exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Seul l'administrateur peut créer des utilisateurs." });
    }
    const { username, email, password, role } = req.body;
    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Cet email existe déjà." });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, role });
    res.status(201).json({ message: "Utilisateur créé", user: { _id: user._id, username, email, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Modifier un utilisateur (par un admin)
exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Seul l'administrateur peut modifier des utilisateurs." });
    }
    const { id } = req.params;
    const { username, email, password, role } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role && ["user", "admin"].includes(role)) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.json({ message: "Utilisateur modifié", user: { _id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un utilisateur (par un admin)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Seul l'administrateur peut supprimer des utilisateurs." });
    }
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });
    res.json({ message: "Utilisateur supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lister tous les utilisateurs (admin seulement)
exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Seul l'administrateur peut voir la liste des utilisateurs." });
    }
    const users = await User.find({}, '-password'); // On ne retourne pas le mot de passe
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};