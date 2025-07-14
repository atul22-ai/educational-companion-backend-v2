import { YoutubeTranscript } from "youtube-transcript"; // ✅ Make sure this works in your environment
import axios from "axios";
import Video from "./videoModel.js";

export const fetchTranscriptAndSave = async (req, res) => {
  const { videoId } = req.params;
  let transcript = [];
  let transcriptSource = "real";

  try {
    // 🧠 Try fetching real transcript
    transcript = await YoutubeTranscript.fetchTranscript(videoId);
  } catch (err) {
    console.warn("⚠️ Transcript fetch failed, using mock data:", err.message);
    transcript = [
      { text: "This is a sample transcript.", duration: 5, offset: 0 },
      { text: "Transcripts are disabled on the original video.", duration: 4, offset: 5 },
      { text: "This is fallback data used for development.", duration: 6, offset: 9 },
    ];
    transcriptSource = "mock";
  }

  try {
    // 📺 Fetch video title & thumbnail
    const videoInfo = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    const newVideo = new Video({
      videoId,
      title: videoInfo.data.title,
      thumbnail: videoInfo.data.thumbnail_url,
      transcript,
      transcriptSource, // 👈 Add this field
    });

    await newVideo.save();

    res.status(200).json({
      message: transcriptSource === "real"
        ? "✅ Real transcript saved"
        : "⚠️ Transcript not available, using mock data",
      video: newVideo,
    });
  } catch (err) {
    console.error("❌ Failed to fetch or save video info", err);
    res.status(500).json({
      message: "❌ Failed to fetch or save video transcript",
      error: err.message,
    });
  }
};
