import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import Video from './videoModel.js';

export const fetchTranscriptAndSave = async (req, res) => {
  // Get the video ID from the request parameters
  const { videoId } = req.params;

  // Check if videoId is provided
  if (!videoId) {
    return res.status(400).json({ message: '❌ Video ID is required.' });
  }

  try {
    // 1. Fetch the transcript from YouTube
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // This is the new line for debugging
    console.log('Transcript result from library:', transcript);

    // If the transcript is empty or couldn't be fetched, return an error
    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ message: '❌ Transcript not found for this video.' });
    }

    // 2. Fetch video metadata (title, thumbnail) from YouTube's oEmbed endpoint
    const oEmbedUrl = `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${videoId}`;
    const videoInfo = await axios.get(oEmbedUrl);
    
    // 3. Create a new video document using your Mongoose model
    const newVideo = new Video({
      videoId,
      title: videoInfo.data.title,
      thumbnail: videoInfo.data.thumbnail_url,
      transcript, // This is the array of transcript objects
    });

    // 4. Save the document to your MongoDB database
    await newVideo.save();

    // 5. Send a success response
    res.status(201).json({ 
      message: '✅ Video transcript fetched and saved successfully!', 
      video: newVideo 
    });

  } catch (err) {
    // This logs the full error to your terminal
    console.error('An error occurred:', err);

    res.status(500).json({
      message: '❌ Failed to fetch or save video transcript.',
      error: err.message
    });
  }
};