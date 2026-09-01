# Menopauza App - Setup Guide

## Wymagania
- Node.js 16+
- PostgreSQL 12+
- npm lub yarn

## Kroki instalacji

### 1. Clone Repository
```bash
git clone https://github.com/djpl79/menopauza-app.git
cd menopauza-app
```

### 2. Setup Database
```bash
# Uruchom Docker
docker-compose up -d

# Wykonaj migracje
cd backend
node src/db/migrate.js
```

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Backend będzie dostępny na: `http://localhost:5000`

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend będzie dostępny na: `http://localhost:3000`

## Struktura katalogów
- `backend/` - Node.js + Express API
- `frontend/` - React aplikacja
- `docs/` - Dokumentacja

## Troubleshooting

### Port już w użyciu
- Backend: Zmień PORT w `.env`
- Frontend: Zmień port w `package.json`

### Baza danych nie łączy się
- Sprawdź czy Docker container działa: `docker ps`
- Sprawdź credencjały w `.env`

## Następne kroki
1. Dodaj artykuły do bazy
2. Skonfiguruj email notifications
3. Deploy na Heroku/Vercel
