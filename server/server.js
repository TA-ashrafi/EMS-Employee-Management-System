import express from "express";
import cors from "cors";
import multer from "multer";
import "dotenv/config";
import connectDB from "./config/db.js";
import dns from "dns";

dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);

const app = express();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(multer().none());

// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

await connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});