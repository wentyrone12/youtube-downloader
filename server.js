import express from "express";
import cors from "cors";
import ytdlp from "yt-dlp-exec";
import path from "path";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

// ensure downloads folder exists
const downloadFolder = path.resolve("downloads");
if (!fs.existsSync(downloadFolder)) {
    fs.mkdirSync(downloadFolder);
}

// serve frontend
app.get("/", (req, res) => {
    res.sendFile(path.resolve("index.html"));
});

// 🔥 DOWNLOAD API (FIXED)
app.post("/download", async (req, res) => {
    const { url, type } = req.body;

    if (!url) {
        return res.status(400).json({ error: "No URL provided" });
    }

    try {
        const filePath = `${downloadFolder}/output.${type}`;

        let options = {
            output: filePath
        };

        if (type === "mp3") {
            options.extractAudio = true;
            options.audioFormat = "mp3";
        } else {
            options.format = "best";
        }

        await ytdlp(url, {
            ...options,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                "referer:youtube.com",
                "user-agent:googlebot"
            ]
        });

        // ✅ SEND FILE TO USER (IMPORTANT)
        res.download(filePath, (err) => {
            if (err) {
                console.log(err);
            }

            // delete after send
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Download failed"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on " + PORT);
});
