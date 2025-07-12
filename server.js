import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", routes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("🎉 Connected to MongoDB!"))
  .catch((err) => console.error("❌ MongoDB error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
