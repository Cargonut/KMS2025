import { Link, Navigate } from "react-router-dom";

export default function CenterPage() {
  const token = localStorage.getItem("cargonaut-token");
  if (!token) {
    return <Navigate to="/signup" replace />;
  }

  return (
    <main className="center page-center">
      <section className="center__panel">
        <div className="center__avatar" aria-label="Profilepicture">
          <span>Profilepicture</span>
        </div>

        <div className="center__actions">
          <button type="button" className="btn center__action">
            Fahrer
          </button>
          <button type="button" className="btn btn--ghost center__action">
            Mitfahrer
          </button>
        </div>

        <footer className="page__footer page__footer--sm">
          <Link to="/impressum">Impressum</Link>
        </footer>
      </section>
    </main>
  );
}
