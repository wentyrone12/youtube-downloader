import path from "path";
import fs from "fs";

app.post("/download", async (req, res) => {
    const { url, type } = req.body;

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

        // 🔥 SEND FILE BACK
        res.download(filePath, (err) => {
            if (err) {
                console.log(err);
            }

            // optional delete after download
            fs.unlinkSync(filePath);
        });

    } catch (err) {
        res.status(500).json({
            error: "Download failed"
        });
    }
});