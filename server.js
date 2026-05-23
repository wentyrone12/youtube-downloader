import express from "express";
import cors from "cors";
import ytdlp from "yt-dlp-exec";
import path from "path";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

// ⚠️ safer for hosting
const downloadFolder = "/tmp";

// serve frontend
app.get("/", (req, res) => {
    res.sendFile(path.resolve("index.html"));
});

// REAL DOWNLOAD API
app.post("/download", async (req, res) => {
    const { url, type } = req.body;

    if (!url) {
        return res.json({ success: false, error: "No URL provided" });
    }

    try {
        let options = {
            output: `${downloadFolder}/%(title)s.%(ext)s`
        };

        if (type === "mp3") {
            options.extractAudio = true;
            options.audioFormat = "mp3";
        } else {
            options.format = "best";
        }

        await ytdlp(url, options);

        res.json({
            success: true,
            message: "Download complete!"
        });

    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            error: "Download failed"
        });
    }
});

// 🔥 IMPORTANT FIX FOR DEPLOYMENT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});