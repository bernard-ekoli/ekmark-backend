import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import type { Request, Response } from "express"
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


app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack); // Log the error for debugging

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});



const port = process.env.PORT || 5000

app.listen(port, (): void => {
    console.log("Server is running on localhost:" + port)
})
