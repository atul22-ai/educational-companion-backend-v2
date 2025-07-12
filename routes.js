import express from "express";
import { fetchTranscriptAndSave } from "./youtubeController.js";

const router = express.Router();

router.get("/video/:videoId", fetchTranscriptAndSave);

export default router;
