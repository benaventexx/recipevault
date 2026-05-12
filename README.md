# RecipeVault

App para guardar receitas de vídeos (YouTube, TikTok, Instagram) com IA.

## Setup rápido

### 1. Firebase
- Cria projeto em console.firebase.google.com
- Ativa Authentication (Google + Email/Password)
- Ativa Firestore Database
- Gera service account key (Project Settings → Service Accounts)

### 2. RapidAPI
- Cria conta em rapidapi.com
- Subscreve: "TikTok Scraper 7" e "Instagram Scraper API2"
- Copia a API key

### 3. Backend
```bash
cd backend
cp .env.example .env  # preenche as variáveis
npm install
npm run dev
```

### 4. Frontend
```bash
cd frontend
cp .env.example .env  # preenche as variáveis Firebase
npm install
npm run dev
```

## Deploy
- **Frontend**: `firebase deploy --only hosting`
- **Backend**: Railway (liga o repo, define env vars no dashboard)

## Estrutura
```
recipevault/
├── CLAUDE.md          ← instruções completas para Claude Code
├── backend/           ← Node.js + Express + TypeScript
│   └── src/
│       ├── routes/    ← recipes, collections, feed, users
│       ├── services/  ← videoExtractor, aiExtractor
│       ├── middleware/← auth
│       └── lib/       ← firebase admin
└── frontend/          ← React + Vite + TailwindCSS
    └── src/
        ├── pages/     ← todas as páginas
        ├── components/← Layout, etc
        ├── store/     ← Zustand (auth)
        └── lib/       ← firebase, api client
```
