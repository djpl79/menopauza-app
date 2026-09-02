# menopauza-app
Aplikacja do śledzenia objawów menopauzy, edukacji i wsparcia dla kobiet. Platform do monitorowania zdrowia, dyskusji i porad.

## Uruchomienie lokalne

Aplikacja składa się z dwóch niezależnych projektów Node.js: `backend/` (Express API + mock baza danych w pamięci) i `frontend/` (React, Create React App).

### Backend

```bash
cd backend
cp .env.example .env   # ustaw prawdziwy JWT_SECRET
npm install
npm start
```

Backend wystartuje na porcie `5000` (konfigurowalnym przez `PORT`/`HOST` w `.env`).

### Frontend

W osobnym terminalu:

```bash
cd frontend
cp .env.example .env   # opcjonalne, patrz komentarze w pliku
npm install
npm start
```

Frontend wystartuje na porcie `3000` i domyślnie automatycznie wykryje adres backendu (patrz `frontend/src/utils/api.js`).

### Testy

```bash
cd backend && npm test
cd frontend && npm test
```

### Konto testowe

Po uruchomieniu backendu dostępne jest domyślne konto testowe:

- Email: `test@menopauza.pl`
- Hasło: `test123`
