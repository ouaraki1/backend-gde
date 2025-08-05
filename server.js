// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const folderRoutes = require("./Routes/folderRoutes");
const path = require("path");
const cors = require("cors"); // أضف هذا في الأعلى
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // أضف هذا قبل أي route

app.use("/api/auth", authRoutes);
app.use("/api/folders", folderRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => console.error("MongoDB connection failed:", err));
