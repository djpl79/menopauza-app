# Menopauza App - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Wszystkie Protected endpoints wymagają JWT token w headerze:
```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth

#### POST /auth/register
Rejestracja nowego użytkownika
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /auth/login
Logowanie użytkownika
```json
{
  "email": "john@example.com",
  "password": "secure_password"
}
```

### Users

#### GET /users/profile
Pobranie profilu użytkownika (Protected)

#### PUT /users/profile
Aktualizacja profilu użytkownika (Protected)

### Symptoms

#### POST /symptoms
Dodanie nowego objawu (Protected)
```json
{
  "symptomType": "Gorące uderzenia",
  "severity": 7,
  "description": "Intensywne gorące uderzenia"
}
```

#### GET /symptoms
Pobranie wszystkich objawów użytkownika (Protected)

### Articles

#### GET /articles
Pobranie wszystkich artykułów

#### GET /articles/:id
Pobranie pojedynczego artykułu

### Forum

#### GET /forum/posts
Pobranie wszystkich postów

#### POST /forum/posts
Stworzenie nowego posta (Protected)

#### POST /forum/posts/:postId/comments
Dodanie komentarza (Protected)
