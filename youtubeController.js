import { YoutubeTranscript } from "youtube-transcript"; // already working
import axios from "axios";
import Video from "./videoModel.js";
import mapTranscriptToConcepts from "./conceptMapper.mjs"; // ✅ Import concept mapper

export const fetchTranscriptAndSave = async (req, res) => {
  const { videoId } = req.params;

  try {
    let transcript;
    let transcriptSource = "real";

    try {
      transcript = await YoutubeTranscript.fetchTranscript(videoId);
    } catch (e) {
      transcript = [
        {
          text: "This is a sample transcript.",
          duration: 5,
          offset: 0,
        },
        {
          text: "Transcripts are disabled on the original video.",
          duration: 4,
          offset: 5,
        },
        {
          text: "This is fallback data used for development.",
          duration: 6,
          offset: 9,
        },
      ];
      transcriptSource = "mock";
    }

    const videoInfo = await axios.get(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    // Convert transcript array into plain text
    const transcriptText = transcript.map(t => t.text).join(" ");

    // ✅ Use AI to get related NCERT concepts
    const mappedConcepts = await mapTranscriptToConcepts(transcriptText);

    const newVideo = new Video({
      videoId,
      title: videoInfo.data.title,
      thumbnail: videoInfo.data.thumbnail_url,
      transcript,
      transcriptSource,
    });

    await newVideo.save();

    res.status(200).json({
      message: transcriptSource === "real"
        ? "✅ Video transcript saved and mapped"
        : "⚠️ Transcript not available, using mock data",
      video: newVideo,
      ncertConcepts: mappedConcepts, // ✅ Return concept mapping
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "❌ Failed to fetch or save video transcript.",
      error: err.message,
    });
  }
};
