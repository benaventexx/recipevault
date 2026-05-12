# RecipeVault — Claude Code Instructions

## Project Overview
RecipeVault is a social recipe saving app. Users paste a YouTube, TikTok or Instagram video link, the backend extracts the content (transcript/caption), sends it to Claude AI which structures it into a full recipe (ingredients + steps), categorises it automatically, and saves it to Firestore under the user's account. Users can create public/private collections, share them, and mark recipes as done.

## Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication (Google + Email/Password)
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Video scraping**: 
  - YouTube: `youtube-transcript` npm package (free)
  - TikTok + Instagram: RapidAPI (TikTok Scraper + Instagram Scraper endpoints)
- **Hosting**: Firebase Hosting (frontend) + Railway or Render (backend)

## Environment Variables

### Backend (.env)
```
PORT=3001
ANTHROPIC_API_KEY=your_anthropic_api_key
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_TIKTOK_HOST=tiktok-scraper7.p.rapidapi.com
RAPIDAPI_INSTAGRAM_HOST=instagram-scraper-api2.p.rapidapi.com
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Firestore Data Model

```
users/{userId}
  - displayName: string
  - email: string
  - photoURL: string
  - createdAt: timestamp
  - following: string[] (userIds)

recipes/{recipeId}
  - userId: string (owner)
  - title: string
  - description: string
  - category: "vegetais" | "carne" | "peixe" | "entradas" | "sobremesas" | "massa" | "sopa" | "outro"
  - ingredients: { name: string, amount: string, unit: string }[]
  - steps: { order: number, text: string, timerSeconds?: number }[]
  - videoUrl: string
  - videoSource: "youtube" | "tiktok" | "instagram"
  - thumbnailUrl?: string
  - isPublic: boolean
  - isDone: boolean
  - tags: string[]
  - createdAt: timestamp
  - updatedAt: timestamp

collections/{collectionId}
  - userId: string (owner)
  - name: string
  - description: string
  - isPublic: boolean
  - recipeIds: string[]
  - coverImage?: string
  - createdAt: timestamp
  - shareSlug: string (unique, for public URL)

savedRecipes/{userId_recipeId}
  - userId: string
  - recipeId: string
  - savedAt: timestamp
```

## Core Features to Build

### 1. Auth
- Firebase Auth with Google Sign-In and Email/Password
- Protected routes
- User profile page

### 2. Add Recipe from Video Link
- Input field for URL (YouTube / TikTok / Instagram)
- Backend detects source from URL pattern
- Extracts transcript/caption via appropriate service
- Sends to Claude API with structured prompt
- Returns full recipe — user can edit before saving
- Auto-categorisation by Claude

### 3. Recipe Detail Page
- Full ingredients list with amounts
- Step by step instructions
- "Já fiz" (Done) toggle button
- Edit / Delete (owner only)
- Share button

### 4. Collections
- Create collection (name, description, public/private)
- Add/remove recipes from collections
- Public collections have a shareable URL: /c/{shareSlug}
- Anyone can view public collections without account

### 5. Discovery / Feed
- Browse public recipes
- Filter by category
- Search by title or ingredient
- View other users' public collections

### 6. Social
- Follow other users
- View their public recipes and collections

## API Endpoints (Backend)

```
POST /api/recipes/extract     — extract recipe from video URL
POST /api/recipes             — save recipe
GET  /api/recipes             — get current user's recipes
GET  /api/recipes/:id         — get single recipe
PUT  /api/recipes/:id         — update recipe
DELETE /api/recipes/:id       — delete recipe
PATCH /api/recipes/:id/done   — toggle done status

POST /api/collections                    — create collection
GET  /api/collections                    — get user's collections
GET  /api/collections/:id                — get collection
PUT  /api/collections/:id                — update collection
DELETE /api/collections/:id              — delete collection
POST /api/collections/:id/recipes        — add recipe to collection
DELETE /api/collections/:id/recipes/:rid — remove recipe
GET  /api/collections/public/:slug       — get public collection by slug (no auth)

GET  /api/feed                — public recipes feed
GET  /api/users/:id/profile   — public user profile
POST /api/users/:id/follow    — follow user
```

## Claude AI Prompt for Recipe Extraction

When calling the Anthropic API to extract a recipe, use this system prompt:

```
You are a recipe extraction assistant. Given a video transcript or post caption, extract the complete recipe and return it as valid JSON only (no markdown, no explanation).

Return this exact structure:
{
  "title": "Recipe name",
  "description": "One sentence description",
  "category": "vegetais|carne|peixe|entradas|sobremesas|massa|sopa|outro",
  "ingredients": [
    { "name": "ingredient name", "amount": "100", "unit": "g" }
  ],
  "steps": [
    { "order": 1, "text": "Step description", "timerSeconds": 300 }
  ],
  "tags": ["tag1", "tag2"],
  "estimatedTimeMinutes": 30,
  "servings": 4
}

Rules:
- timerSeconds only when the step involves waiting/cooking with a specific time
- category must be one of the exact values listed
- amounts as strings (e.g. "1/2", "100", "a handful")
- If no clear recipe is found, return { "error": "No recipe found" }
- Always respond in the same language as the transcript
```

## RapidAPI Integration

### TikTok
- Host: `tiktok-scraper7.p.rapidapi.com`
- Endpoint: `GET /video/info?url={videoUrl}`
- Extract: `data.video.desc` (description with recipe text)

### Instagram  
- Host: `instagram-scraper-api2.p.rapidapi.com`
- Endpoint: `GET /v1/post_info?code_or_id_or_url={url}`
- Extract: `data.caption` (post caption)

## Development Setup

```bash
# Install all deps
cd backend && npm install
cd ../frontend && npm install

# Run backend
cd backend && npm run dev

# Run frontend
cd frontend && npm run dev
```

## Build & Deploy

```bash
# Frontend → Firebase Hosting
cd frontend && npm run build && firebase deploy --only hosting

# Backend → Railway (connect GitHub repo, set env vars in dashboard)
```

## Design Guidelines
- Dark theme, clean and minimal
- Accent color: #315675 (Azul Évora) as primary brand color
- Secondary: #d8cfbe (Greige)
- Category badges with distinct colors
- Mobile-first — most users will add recipes on mobile
- Portuguese UI language by default
