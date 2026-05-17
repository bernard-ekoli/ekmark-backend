# Ekmark Backend

The server-side API for [Ekmark](https://ekmark.ekolix.com.ng) — a free image watermarking tool. Handles waitlist registrations and stores them securely in Firebase Firestore.

---

## Tech Stack

- **Runtime** — Node.js
- **Framework** — Express
- **Language** — TypeScript
- **Database** — Firebase Firestore (via Firebase Admin SDK)
- **Validation** — Zod
- **Rate Limiting** — express-rate-limit
- **Package Manager** — npm

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm
- A Firebase project with Firestore enabled
- A Firebase service account key (JSON)

### Installation

```bash
# Clone the repository
git clone https://github.com/bernard-ekoli/ekmark-backend.git
cd ekmark-backend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root of the project:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Project Settings → Service Accounts**
3. Click **Generate new private key** and download the JSON file
4. Rename it to `ekmarkServiceAccountKey.json` and place it in the root of the project


### Run Locally

```bash
npm run dev
```

Server will start on `http://localhost:5000`

---

## API Endpoints

### `POST /api/waitlist`

Validates and saves an email address to the Ekmark launch waitlist. Rate limited to **5 requests per IP per 15 minutes**.

**Request Body**
```json
{
  "email": "user@example.com"
}
```

**Success Response** `201`
```json
{
  "success": true,
  "message": "Email saved successfully"
}
```

**Validation Error** `400`
```json
{
  "success": false,
  "errors": [{ "message": "Invalid email" }]
}
```

**Rate Limit Error** `429`
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

**Server Error** `500`
```json
{
  "success": false,
  "message": "Something went wrong on our end. Please try again later."
}
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── firebase.ts         # Firebase Admin SDK initialization
│   ├── controllers/            # Route controllers
│   ├── models/                 # Data models
│   ├── routes/
│   │   └── waitlist.ts         # POST /api/waitlist route
│   └── utils/                  # Utility functions
├── ekmarkServiceAccountKey.json  # Firebase credentials (gitignored)
├── .env                        # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Deployment

This backend is designed to be deployed on [Render](https://render.com).

**Environment variables to set on Render:**
- `PORT`
- `FRONTEND_URL`


---

## Security Notes

- The service account key must never be committed to version control
- Raw Firebase/Google error messages are never exposed to the client
- CORS is configured to only allow requests from the frontend URL

---

## License

MIT © 2026 Bernard Edet Ekoli
