# Cargonaut

Cargonaut ist eine Plattform zur Organisation von Transportfahrten und Mitfahrgelegenheiten.

Das Projekt wurde im Rahmen des Moduls **KMS** entwickelt und besteht aus einem **Frontend (React + Vite)** und einem **Backend (NestJS + GraphQL + Prisma)** mit **PostgreSQL** als Datenbank.

Alle Services werden über **Docker Compose** gestartet.

---

# Voraussetzungen

Folgende Software muss installiert sein:

* Docker
* Docker Compose

Optional (für lokale Entwicklung):

* Node.js 20+
* npm

---

# Projekt starten

Im Repository-Root:

```
docker compose up --build
```

Beim ersten Start werden automatisch:

* PostgreSQL gestartet
* Datenbankmigrationen ausgeführt
* Seed-Daten geladen
* Backend gestartet
* Frontend gestartet

---

# Zugriff auf die Anwendung

Frontend:

```
http://localhost:5173
```

Backend (GraphQL API):

```
http://localhost:3000/graphql
```

---

# Projektstruktur

```
KMS2025
│
├── backend
│   ├── src
│   ├── prisma
│   └── Dockerfile
│
├── frontend
│   ├── src
│   └── vite.config.ts
│
└── docker-compose.yml
```

---

# Technologien

Frontend:

* React
* TypeScript
* Vite

Backend:

* NestJS
* GraphQL (Mercurius)
* Prisma ORM
* PostgreSQL

Containerisierung:

* Docker
* Docker Compose

---

# Hinweise

Beim Start werden automatisch:

* Prisma Migrationen ausgeführt
* Seed-Daten geladen
* Backend gestartet

Uploads werden lokal im Backend unter `backend/uploads/` gespeichert.
