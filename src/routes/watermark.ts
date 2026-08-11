import express from "express";
import upload from "../config/multer.js";
import { createSvg } from "../utils/createSvg.js";
import sharp from "sharp";
import crypto from "crypto"

const router = express.Router()

router.get("/", async (req, res, next) => {
    return res.status(200).json({"success": true, "message": "Ekark watermarking backend is reachable"})
})
router.post("/", upload.array('images', 10), async (req, res, next) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!req.body.text || files.length === 0) {
            const err = new Error("Text or Images not provided")
            return next(err)
        }
        if (!Number(req.body.fontSize)) {
            return next(new Error("Font size must be a number"))
        }
        if (req.body.text.length > 40) {
            return next(new Error("Watermark text must be less than 40 characters"))
        }
        const result = await Promise.all(files.map(async (file) => {
            const metadata = await sharp(file.buffer).metadata();
            if (!metadata.width) {
                throw new Error(`Could not read width for ${file.originalname}`);
            }
            const svgText = createSvg(metadata.width, req.body.text, Number(req.body.fontSize));
            const textBuffer = Buffer.from(svgText);
            const watermarked = await sharp(file.buffer)
                .composite([{ input: textBuffer, gravity: 'southeast' }])
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
    } catch (error: any) {
        return next(new Error(`An error occured while processing images. Error: ${error.message}`))
    }
})

export default router