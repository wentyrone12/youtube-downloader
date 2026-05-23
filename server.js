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
        return res.status(400).json({ error: "No URL provided" });
    }

    try {
        const filePath = `downloads/output.${type}`;

        let options = {
            output: filePath
        };

        if (type === "mp3") {
            options.extractAudio = true;
            options.audioFormat = "mp3";
        } else {
            options.format = "best";
        }

        await ytdlp(url, options);

        // 🔥 SEND FILE TO USER (DOWNLOAD SA PHONE)
        res.download(filePath, (err) => {
            if (err) {
                console.log(err);
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Download failed" });
    }
});

// 🔥 IMPORTANT FIX FOR DEPLOYMENT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});