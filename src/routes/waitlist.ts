import express from "express";
import { db } from "../config/firebase.js";
import { z } from "zod";
import rateLimit from "express-rate-limit";

const router = express.Router();

const waitlistSchema = z.object({
    email: z.string().email()
});

const waitlistLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // max 5 requests per IP in that window
    message: {
        success: false,
        message: "Too many requests, please try again later"
    }
})


router.post("/waitlist", waitlistLimiter, async (req: express.Request, res: express.Response) => {
    try {
        const { email } = waitlistSchema.parse(req.body);

        await db.collection("users").doc(email).set({
            email,
            createdAt: new Date()
        });

        return res.status(201).json({
            success: true,
            message: "Email saved successfully"
        });

    } catch (err: any) {
        console.log("Error processing waitlist request:", err);

        if (err instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                errors: err.issues
            });
        }

        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

export default router;