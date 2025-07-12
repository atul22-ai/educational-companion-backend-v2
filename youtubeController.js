import YoutubeTranscript from 'youtube-transcript-api'; // <-- Corrected import statement
import axios from 'axios';
import Video from './videoModel.js';

export const fetchTranscriptAndSave = async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    return res.status(400).json({ message: '❌ Video ID is required.' });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ message: '❌ Transcript not found for this video.' });
    }

    const oEmbedUrl = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}`;
    const videoInfo = await axios.get(oEmbedUrl);
    
    const newVideo = new Video({
      videoId,
      title: videoInfo.data.title,
      thumbnail: videoInfo.data.thumbnail_url,
      transcript,
    });

    await newVideo.save();

    res.status(201).json({ 
      message: '✅ Video transcript fetched and saved successfully!', 
      video: newVideo 
    });

  } catch (err) {
    console.error('An error occurred:', err);
    res.status(500).json({
      message: '❌ Failed to fetch or save video transcript.',
      error: err.message
    });
  }
};