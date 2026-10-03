import express from "express";
import upload from "../config/multer.js";
import { createSvg } from "../utils/createSvg.js";
import { watermarkGravity } from "../utils/calculateLocation.js";
import sharp from "sharp";
import crypto from "crypto"


const router = express.Router()
const MAX_TEXT_LENGTH = 60
const VALID_POSITIONS = new Set([
    "top-left",
    "top-center",
    "top-right",
    "left",
    "center",
    "right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
])

router.get("/", async (req, res, next) => {
    return res.status(200).json({ "success": true, "message": "Ekmark watermarking backend is reachable" })
})
router.post("/", upload.array('images', 10), async (req, res, next) => {
    try {
        const files = Array.isArray(req.files) ? req.files : []
        const text = typeof req.body.text === "string" ? req.body.text : ""
        const fontSize = Number(req.body.fontSize)
        const position = req.body.position

        if (!text.trim()) {
            return res.status(400).json({ success: false, message: "Watermark text is required" })
        }
        if (files.length === 0) {
            return res.status(400).json({ success: false, message: "At least one image is required" })
        }
        if (!Number.isFinite(fontSize)) {
            return res.status(400).json({ success: false, message: "Font size must be a number" })
        }
        if (fontSize < 10 || fontSize > 120) {
            return res.status(400).json({ success: false, message: "Font size must be between 10 and 120" })
        }
        if (text.length > MAX_TEXT_LENGTH) {
            return res.status(400).json({ success: false, message: `Watermark text must be at most ${MAX_TEXT_LENGTH} characters` })
        }
        if (typeof position !== "string" || !VALID_POSITIONS.has(position)) {
            return res.status(400).json({ success: false, message: "Position must be a supported watermark position" })
        }
        const result = await Promise.all(files.map(async (file) => {
            const metadata = await sharp(file.buffer).metadata();
            if (!metadata.width || !metadata.height) {
                throw new Error(`Could not read dimensions for ${file.originalname}`);
            }
            const adjustedFontSize = Math.min(fontSize * (metadata.width / 1080), metadata.width / 10);

            const svgText = createSvg(metadata.width, metadata.height, text, adjustedFontSize);
            const textBuffer = Buffer.from(svgText);
            const gravityText = watermarkGravity(position)
            const watermarked = await sharp(file.buffer)
                .composite([{ input: textBuffer, gravity: gravityText }])
                .png()
                .toBuffer()
            const originalName = file.originalname.replace(/\.[^/.]+$/, '');
            return {
                id: crypto.randomUUID(),
                name: `${originalName}.png`,
                url: `data:image/png;base64,${watermarked.toString('base64')}`
            }
        }))

        return res.json({ images: result })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown image processing error"
        return next(new Error(`An error occurred while processing images. Error: ${message}`))
    }
})

export default router