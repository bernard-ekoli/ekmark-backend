import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import type { Request, Response } from "express"

import waitlistRouter from "./routes/waitlist.js"

const app = express()
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))

app.use(express.json())

app.use("/api", waitlistRouter)

app.get("/", (req: Request, res: Response): void => {
    res.send("Ekmark Backend is up and active")
})

const port = process.env.PORT || 5000

app.listen(port, (): void => {
    console.log("Server is running on localhost:" + port)
})