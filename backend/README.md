🚀 MyCargonaut – Backend

NestJS + GraphQL (Mercurius) + Prisma + PostgreSQL

Dieses Backend stellt alle Kernfunktionen für die MyCargonaut-Plattform bereit:

Nutzerverwaltung (Signup, Login, Profil, Passwort ändern)

Authentifizierung via JWT

Fahrten, Fahrzeuge, Bewertungen

Dateiupload für Profilbilder, Fahrzeuge und Trips

Prisma ORM und PostgreSQL

📂 Projektstruktur
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
├── uploads/            # Datei-Uploads (wird nicht committed)
│
├── .env                # Lokale Umgebungsvariablen (nicht committen)
└── .env.example        # Vorlage für alle Teammitglieder

🛠 Voraussetzungen

Installiert werden müssen:

Node.js 20+

npm oder yarn/pnpm

Docker (für das PostgreSQL-DB Setup)

WSL2 (unter Windows empfohlen)

🔧 1. Projekt initial klonen
git clone https://github.com/Cargonut/KMS2025.git
cd KMS2025/backend

🔐 2. .env Datei erstellen

Kopiere die Vorlage:

cp .env.example .env


Dann ersetzen oder eintragen:

DATABASE_URL="postgresql://postgres:password@localhost:5432/cargonaut?schema=public"

JWT_SECRET="DEIN_GEHEIMER_JWT_KEY"
JWT_EXPIRES_IN="1d"

PORT=3000

UPLOADS_DIR="./uploads"
PROFILE_UPLOAD_DIR="./uploads/profile"
VEHICLE_UPLOAD_DIR="./uploads/vehicles"
TRIP_UPLOAD_DIR="./uploads/trips"


👉 Den JWT-Key erzeugst du so:

openssl rand -hex 32

🐘 3. Datenbank starten (Docker)

Im Backend-Ordner ausführen:

docker compose up -d


Dadurch startet:

PostgreSQL DB (localhost:5432)

🗄 4. Prisma Setup ausführen
Prisma Client generieren
npx prisma generate

(Optional) DB Migrations anwenden
npx prisma migrate deploy

🚀 5. Backend starten
Entwicklung (Hot Reload):
npm run start:dev

Produktion:
npm run build
npm run start:prod

🧪 6. GraphQL Playground

Wenn das Backend läuft, öffne:

👉 http://localhost:3000/graphiql

Hier kannst du Queries testen, z. B.:

Signup
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

Login
mutation {
  login(email: "max@example.com", password: "123456")
}


Das Ergebnis ist ein JWT Token.

Authentifizierte Query

Header:

{
  "Authorization": "Bearer MEIN_JWT_TOKEN"
}


Query:

query {
  me {
    id
    email
  }
}

📤 Uploads

Uploads werden über Fastify bereitgestellt:

/uploads/profile
/uploads/vehicles
/uploads/trips


Die tatsächlichen Dateien liegen in:

backend/uploads/


Diese Ordner werden nicht committed (.gitignore).

🔐 Auth Flow (Kurzfassung)

Signup: Passwort wird gehasht und gespeichert

Login: Passwort wird geprüft → JWT wird erstellt

Authorization:

Jede geschützte Query/Mutation nutzt @UseGuards(GqlAuthGuard)

Token wird geprüft via JWTStrategy

me: Gibt den eingeloggten User zurück

updatePassword: Validiert altes Passwort und schreibt ein neues Hash

🧰 Nützliche Commands
Zweck	Command
Prisma Studio öffnen	npx prisma studio
DB neu generieren	npx prisma migrate dev
Container stoppen	docker compose down
Logausgabe Docker	docker logs backend-cargonaut_db-1
🧑‍🤝‍🧑 Team Workflow

Dev Branch verwenden

Änderungen in backend/ machen

Pull Request → Code Review

Merge in dev

Deployment folgt später

❤️ Support / Entwicklung

Backend Lead: Can
Technologien: NestJS · Prisma · GraphQL · PostgreSQL

Bei Fragen einfach melden — oder ChatGPT fragen 😄

🎉 Viel Erfolg beim Entwickeln!
