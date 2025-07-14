import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  videoId: { type: String, required: true, unique: true },
  title: String,
  thumbnail: String,
  transcript: Array,
  transcriptSource: { type: String, enum: ['real', 'mock'], default: 'real' }, // ✅ Add this
}, { timestamps: true });

export default mongoose.model("Video", videoSchema);
