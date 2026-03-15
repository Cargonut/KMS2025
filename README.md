# Cargonaut

Cargonaut ist eine Plattform zur Organisation von Transportfahrten und Mitfahrgelegenheiten.

Das Projekt wurde im Rahmen des Moduls **KMS** entwickelt und besteht aus einem **Frontend (React + Vite)** und einem **Backend (NestJS + GraphQL + Prisma)** mit **PostgreSQL** als Datenbank.

# KMS2025

Zentraler Einstieg fuer Frontend und Backend.

## Schnellstart

Voraussetzungen:

- Node.js 20+
- npm
- Docker

Im Projektroot reicht jetzt:

```bash
npm run dev
```

Das Script erledigt automatisch:

- `backend/.env` aus `backend/.env.example` erzeugen, falls noetig
- fehlende Werte in `backend/.env` ergaenzen
- `JWT_SECRET` automatisch generieren, falls er noch fehlt
- Abhaengigkeiten in `backend/` und `frontend/` installieren
- PostgreSQL per Docker Compose starten
- Prisma Client generieren
- Prisma Migrationen ausfuehren
- Backend und Frontend parallel starten

## Weitere Befehle

```bash
npm run setup
```

Bereitet alles vor, startet aber keine Dev-Server.

```bash
npm run backend
```

Startet nur das Backend inklusive Setup.

```bash
npm run frontend
```

Startet nur das Frontend.

```bash
npm run db:down
```

Stoppt die Datenbank.

## Standard-URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- GraphiQL: `http://localhost:3000/graphiql`

## Bereichsdokumentation

- `backend/README.md`
- `frontend/README.md`
