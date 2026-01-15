import { useState } from "react";
import Logo from "../components/Logo";
import ProfileAvatar from "../components/ProfileAvatar";
import { PageFooter, PageLayout } from "../components/PageLayout";

type Offer = {
  id: number;
  from: string;
  to: string;
  date: string;
  time: string;
  price: string;
  seats: number;
};


const MOCK_OFFERS: Offer[] = [
  {
    id: 1,
    from: "35390 Gießen, Bahnhofstraße 1",
    to: "60326 Frankfurt, Hauptbahnhof",
    date: "2025-01-19",
    time: "08:15",
    price: "9,50 €",
    seats: 2,
  },
  {
    id: 2,
    from: "35390 Gießen, Marktplatz",
    to: "60311 Frankfurt, Römerberg",
    date: "2025-01-19",
    time: "10:45",
    price: "11,00 €",
    seats: 3,
  },
  {
    id: 3,
    from: "35578 Wetzlar, Domplatz",
    to: "65183 Wiesbaden, Schlossplatz",
    date: "2025-01-20",
    time: "09:00",
    price: "12,50 €",
    seats: 1,
  },
  {
    id: 4,
    from: "60326 Frankfurt, Hauptbahnhof",
    to: "60549 Frankfurt, Flughafen",
    date: "2025-01-19",
    time: "14:30",
    price: "6,00 €",
    seats: 4,
  },
];

export default function PassengerMenuPage() {
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<Offer[]>([]);

  const handleSearch = () => {
    const filtered = MOCK_OFFERS.filter((offer) => {
      const matchesFrom = fromInput
          ? offer.from.toLowerCase().includes(fromInput.toLowerCase())
          : true;
      const matchesTo = toInput
          ? offer.to.toLowerCase().includes(toInput.toLowerCase())
          : true;
      const matchesDate = dateInput ? offer.date === dateInput : true;

      return matchesFrom && matchesTo && matchesDate;
    });

    setResults(filtered);
    setHasSearched(true);
  };


  return (
    <PageLayout variant="center" className="page-theme page-theme--passenger">
      <section className="passenger-menu__panel stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />
        <p className="passenger-menu__title">MITFAHRER MENU</p>

        <div className="passenger-menu__card stack stack--xl">
          <ProfileAvatar
            className="passenger-menu__avatar"
            fallbackClassName="passenger-menu__avatar-text"
            fallbackText="Profilbild"
            label="Profilbild"
          />

          <div className="passenger-menu__offer stack stack--sm">
            <p className="passenger-menu__offer-title">SUCHEN</p>
            <span className="passenger-menu__offer-divider" aria-hidden="true" />

            <div className="stack stack--xs passenger-menu__field">
              <p className="passenger-menu__field-label">VON</p>
              <div className="passenger-menu__field-box">
                <input
                  className="passenger-menu__input"
                  type="text"
                  placeholder="Adresse eingeben"
                  value={fromInput}
                  onChange={(event) => setFromInput(event.target.value)}
                />
              </div>

            </div>

            <div className="stack stack--xs passenger-menu__field">
              <p className="passenger-menu__field-label">NACH</p>
              <div className="passenger-menu__field-box">
                <input
                  className="passenger-menu__input"
                  type="text"
                  placeholder="Adresse eingeben"
                  value={toInput}
                  onChange={(event) => setToInput(event.target.value)}
                />
              </div>
             
            </div>

            <div className="stack stack--xs">
              <p className="passenger-menu__field-label">DATUM</p>
              <div className="passenger-menu__field-box">
                <input
                  className="passenger-menu__input"
                  type="date"
                  value={dateInput}
                  onChange={(event) => setDateInput(event.target.value)}
                />
              </div>
            </div>

            <button type="button" className="passenger-menu__cta" onClick={handleSearch}>
              SUCHEN
            </button>
          </div>

          <div className="passenger-menu__results stack stack--xs">
            <p className="passenger-menu__results-title">ANGEBOTE</p>
            {hasSearched ? (
              results.length > 0 ? (
                results.map((offer) => (
                  <article key={offer.id} className="passenger-menu__result-card">
                    <div>
                      <p className="passenger-menu__result-route">
                        {offer.from} → {offer.to}
                      </p>
                      <p className="passenger-menu__result-meta">
                        {offer.date} · {offer.time}
                      </p>
                    </div>
                    <div className="passenger-menu__result-details">
                      <span>{offer.price}</span>
                      <span>{offer.seats} Plätze</span>
                    </div>
                  </article>
                ))
              ) : (
                <p className="passenger-menu__result-empty">
                  Keine passenden Angebote gefunden. Bitte Suchkriterien anpassen.
                </p>
              )
            ) : (
              <p className="passenger-menu__result-empty">
                Suche starten, um verfügbare Fahrten anzuzeigen.
              </p>
            )}
          </div>

          <div className="stack stack--sm">
            <button type="button" className="passenger-menu__link">
              UBERSICHT
            </button>
          </div>
        </div>

        <PageFooter className="page__footer--sm page__footer--inverse" />
      </section>
    </PageLayout>
  );
}
