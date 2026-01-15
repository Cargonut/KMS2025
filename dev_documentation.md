# Dev Documentation (Frontend)

Kurz und praktisch: Neue Seiten sollen das gemeinsame Template nutzen, damit Header/Footer/Layout konsistent bleiben.

## Neue Seite anlegen
1. Datei in `frontend/src/pages/` erstellen, z. B. `frontend/src/pages/NeueSeite.tsx`.
2. `PageLayout` und optional `PageFooter` verwenden.
3. Route in `frontend/src/app/routes.tsx` eintragen.

## Template nutzen (Kurzform)
- `PageLayout` in `frontend/src/components/PageLayout.tsx`
  - `variant`: `"default" | "center" | "stack"`
  - `header`: Titel, Untertitel, Logo und Aktionen (Buttons/Links)
  - `contentWrap`: legt den Content in `.page__content`
  - `contentClassName`: zusaetzliche Klassen, z. B. `stack stack--lg`
- `PageFooter` fuer den Impressum-Link

## Beispiel
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

## Wiederverwendbare Bausteine
- `Logo`, `ProfileAvatar`, `ProfileShortcut`
- UI-Komponenten: `Card`, `Field`, `MessageBox`
- Layout-Utilities: `.stack`, `.grid`, `.page__content`

## Styling-Hinweis
Nutze vorhandene Klassen aus `frontend/src/styles/index.css` und `frontend/src/styles/pages.css`, damit Farben und Typo konsistent bleiben. Neue Klassen nur anlegen, wenn es wirklich noetig ist.
