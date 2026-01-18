# Frontend Dev Documentation

Kurz und praktisch: Diese Doku beschreibt ausschließlich das Frontend in `frontend/`.

## Voraussetzungen
- Node.js >= 20 empfohlen (Vite 7 + React Router 7).  
- npm 9+.

## Quick Start
```bash
cd frontend
npm install
npm run dev
```

Weitere Befehle:
- `npm run build` – Production Build
- `npm run lint` – ESLint
- `npm run format` – Prettier
- `npm run format:check` – Prettier (Check)
- `npm run typecheck` – TypeScript (no emit)
- `npm run check` – Format-Check + Lint + Typecheck

## Projektstruktur (Frontend)
- `frontend/src/app/` – Routing und API-Client
- `frontend/src/pages/` – Seitenkomponenten
- `frontend/src/components/` – Wiederverwendbare UI-Bausteine
- `frontend/src/features/` – Größere Feature-Module/Formulare
- `frontend/src/styles/` – Basisthema + Seitenstyles
- `frontend/public/` – statische Assets

## Seiten anlegen
1. Neue Datei in `frontend/src/pages/` erstellen.
2. `PageLayout` + optional `PageFooter` verwenden.
3. Route in `frontend/src/app/routes.tsx` hinzufügen.

### Beispiel
```tsx
import { Link } from "react-router-dom";
import { PageFooter, PageLayout } from "../components/PageLayout";

export default function NeueSeite() {
  return (
    <PageLayout
      variant="stack"
      header={{
        align: "center",
        logo: { alt: "Esuap", size: 180 },
        title: "Neue Seite",
        subtitle: "Kurze Beschreibung.",
        actions: (
          <Link to="/" className="btn btn--ghost">
            Zur Startseite
          </Link>
        ),
      }}
      contentWrap
    >
      <p className="muted">Inhalt kommt hier rein.</p>
      <PageFooter className="page__footer--sm" />
    </PageLayout>
  );
}
```

## Styling-Guide (Simpel-Look)
- Farb- und Schattenvariablen in `frontend/src/styles/index.css` nutzen.
  - Zentrale Tokens: `--color-accent`, `--color-surface`, `--color-border`, `--shadow-soft`.
- Layout-Utilities verwenden: `.stack`, `.grid`, `.page__content`.
- Für thematische Seiten (Fahrer/Mitfahrer): `PageLayout` mit `page-theme page-theme--driver` oder
  `page-theme page-theme--passenger` kombinieren.
- Keine harten Schatten, keine Vollflächen in Primärfarben – alles bewusst reduziert.
- Überschriften und Buttons in Satzschreibung, keine Forced-Upscale/All-Caps.

## Copy & Sprache
- UI-Texte sind Deutsch, konsistent und mit korrekten Umlauten.
- Einheitliche Begriffe:
  - Anmelden / Registrieren / Abmelden
  - Fahrzeuge / Fahrten
- Fehlende Werte mit `k.A.` kennzeichnen.

## Formatierung
- Prettier: `frontend/.prettierrc.json`  
  - `npm run format`
- ESLint: `frontend/eslint.config.js`  
  - `npm run lint`
- Gesamtcheck:  
  - `npm run check`

## Troubleshooting
- `Expected Iterable, but did not find one for field "Query.myVehicles/vehicles"`  
  - Datenbank-Schema ist nicht aktuell. Backend neu starten und Prisma migrieren.
  - Dev-Fix: `npx prisma db push` (im Backend-Container/Verzeichnis).
- `column Vehicle.load_area does not exist`  
  - Migrationen fehlen. Prisma-Migrationen anwenden und Backend neu starten.


