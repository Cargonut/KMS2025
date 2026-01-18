# 🚀 MyCargonaut – Backend  
**NestJS + GraphQL (Mercurius) + Prisma + PostgreSQL**

Dieses Backend stellt alle Kernfunktionen für die MyCargonaut-Plattform bereit:

- Nutzerverwaltung (Signup, Login, Profil, Passwort ändern)
- Authentifizierung via JWT  
- Fahrten, Fahrzeuge, Bewertungen  
- Datei-Uploads  
- Prisma ORM und PostgreSQL  

---

## 📂 Projektstruktur

```bash
backend/
│
├── src/
│   ├── api/            # GraphQL + REST Layer
│   ├── auth/           # Auth Service, JWT Strategy, Guards
│   ├── core/           # Fachlogik (User, Trip, Vehicle, Rating ...)
│   ├── prisma/         # Prisma Module + Service
│   ├── common/         # Filter & Pipes
│   └── main.ts         # App Bootstrap
│
├── prisma/
│   ├── schema.prisma   # Datenbankmodell
│   └── migrations/     # Migrationen
│
├── uploads/            # Datei-Uploads (nicht versioniert)
│
├── .env                # Lokale Umgebungsvariablen
└── .env.example        # Vorlage für alle Teammitglieder
```
---

🛠 Voraussetzungen

Folgendes muss installiert sein:
 
- Node.js 20+

- npm, yarn oder pnpm

- Docker (für die DB)

- WSL2 (falls Windows)

---

🔧 1. Projekt klonen
```bash
git clone https://github.com/Cargonut/KMS2025.git
cd KMS2025/backend
```
---
🔐 2. .env Datei erstellen
```bash
cp .env.example .env
```
Eintragen:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/cargonaut?schema=public"

JWT_SECRET="DEIN_GEHEIMER_JWT_KEY"
JWT_EXPIRES_IN="1d"

PORT=3000

UPLOADS_DIR="./uploads"
PROFILE_UPLOAD_DIR="./uploads/profile"
VEHICLE_UPLOAD_DIR="./uploads/vehicles"
TRIP_UPLOAD_DIR="./uploads/trips"
```
JWT Key erzeugen:
```bash
openssl rand -hex 32
```
---
🐘 3. Datenbank starten
```bash
docker compose up -d
```
---
🗄 4. Prisma Setup
Client generieren:
```bash
npx prisma generate
```
Migration anwenden:
```bash
npx prisma migrate deploy
```
---
(Änderungen von Prisma in DB pushen):
```bash
npx prisma db push
```
---
🚀 5. Backend starten
Entwicklung
```bash
npm run start:dev
```
Produktion
```bash
npm run build
npm run start:prod
```
---
🧪 6. GraphQL Playground öffnen
👉 http://localhost:3000/graphiql

Signup
```bash
mutation {
  signup(data: {
    first_name: "Max"
    last_name: "Mustermann"
    email: "max@example.com"
    password: "123456"
    birth_date: "1990-01-01T00:00:00.000Z"
  }) {
    id
    email
  }
}
```
Login
```bash
mutation {
  login(email: "max@example.com", password: "123456")
}
```
Authentifizierte Query
Header:
```bash
{
  "Authorization": "Bearer TOKEN_HIER"
}
```
Query
```bash
query {
  me {
    id
    email
  }
}
```
---
📤 Datei-Uploads
Uploads liegen lokal in:
```bash
backend/uploads/
```
Bereitgestellt unter:

- /uploads/profile

- /uploads/vehicles

- /uploads/trips

---
🔐 Auth Flow
1. Signup → Passwort wird gehasht

2. Login → JWT wird generiert

3. Guard prüft Token

4. me liefert eingeloggten User

5. updatePassword validiert altes PW

6. updateMe ändert Userdaten
---

🧰 Nützliche Commands
| Zweck          | Command                              |
| -------------- | ------------------------------------ |
| Prisma Studio  | `npx prisma studio`                  |
| Migration      | `npx prisma migrate dev`             |
| Docker stoppen | `docker compose down`                |
| DB Logs        | `docker logs backend-cargonaut_db-1` |

---
🧑‍🤝‍🧑 Team Workflow
- Arbeiten im dev Branch
- Backend liegt in /backend
- Frontend in /frontend
- Änderungen → Pull Request → Review → Merge

---

❤️ Support

Backend Lead: Can
Technologien: NestJS · Prisma · GraphQL · PostgreSQL