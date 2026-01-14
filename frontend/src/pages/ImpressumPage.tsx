import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import Card from "../components/ui/Card";

export default function ImpressumPage() {
  return (
    <main className="page impressum page-stack">
      <header className="page__header page__header--center">
        <div>
          <Logo alt="Esuap" className="page__logo" size={180} />
          <h1>Impressum</h1>
          <p className="muted">Rechtliche Angaben und Kontakt.</p>
        </div>
      </header>

      <section className="page__content">
        <Card
          title="Kontakt"
          footer={
            <div className="impressum__footer">
              <Link to="/" className="btn btn--ghost">
                Zurück zur Startseite
              </Link>
            </div>
          }
        >
          <div className="impressum__details">
            <p>
              <strong>Esuap Transportations GmbH & Weihnachtsmann &amp; Co. KG</strong>
            </p>

            <address className="impressum__address">
              Esnikel Esuap
              <br />
              Adolph-Kolping-Str. 1
              <br />
              12345 Köthen
            </address>

            <p>E-Mail: kontakt@esuap.de</p>

            <p>
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
              <br />
              Esnikel Esuap
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}
