import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  videoId: String,
  title: String,
  thumbnail: String,
  transcript: Array,
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
