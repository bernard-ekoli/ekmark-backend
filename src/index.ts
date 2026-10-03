import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import multer from "multer"
import type { ErrorRequestHandler, Request, Response } from "express"
import watermark from "./routes/watermark.js"

const app = express()

app.use(cors({
    origin: "*",
}))


app.use(express.json())


app.get("/", (req: Request, res: Response): void => {
    res.send("Ekmark Backend is up and active")
})
app.use("/api/watermark", watermark)


const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    console.error(err instanceof Error ? err.stack : err)

    let status = 500
    if (err instanceof multer.MulterError) {
        status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400
    } else if (
        err instanceof Error &&
        "status" in err &&
        typeof err.status === "number" &&
        err.status >= 400 &&
        err.status < 500
    ) {
        status = err.status
    }
    const message = status === 500
        ? "An unexpected server error occurred"
        : err.message

    return res.status(status).json({
        success: false,
        message
    });
}

app.use(errorHandler)



const port = process.env.PORT || 5000

app.listen(port, (): void => {
    console.log("Server is running on localhost:" + port)
})
