import { Link } from "react-router-dom";
import Card from "../components/ui/Card";
import { PageLayout } from "../components/PageLayout";

export default function ImpressumPage() {
  // Impressum bleibt eigenstaendig, nutzt aber das Template fuer den Rahmen.
  return (
    <PageLayout
      variant="stack"
      className="page--contrast"
      header={{
        align: "center",
        logo: { alt: "Esuap", size: 180 },
        title: "Impressum",
        subtitle: "Rechtliche Angaben und Kontakt.",
      }}
      contentWrap
    >
      <Card
        title="Kontakt"
        footer={
          <div className="impressum__footer">
            <Link to="/" className="btn btn--ghost">
              Zurueck zur Startseite
            </Link>
          </div>
        }
      >
        <div className="impressum__details stack">
          <p>
            <strong>Esuap Transportations GmbH & Weihnachtsmann &amp; Co. KG</strong>
          </p>

          <address className="impressum__address">
            Esnikel Esuap
            <br />
            Adolph-Kolping-Str. 1
            <br />
            12345 Koethen
          </address>

          <p>E-Mail: kontakt@esuap.de</p>

          <p>
            Verantwortlich fuer den Inhalt nach Paragraph 55 Abs. 2 RStV:
            <br />
            Esnikel Esuap
          </p>
        </div>
      </Card>
    </PageLayout>
  );
}
