import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import ProfileAvatar from "../components/ProfileAvatar";
import { PageFooter, PageLayout } from "../components/PageLayout";

export default function DriverMenuPage() {
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const offerHref = useMemo(() => {
    const params = new URLSearchParams();
    const fromValue = fromInput.trim();
    const toValue = toInput.trim();
    if (fromValue) {
      params.set("from", fromValue);
    }
    if (toValue) {
      params.set("to", toValue);
    }
    const query = params.toString();
    return query ? `/trip-publication?${query}` : "/trip-publication";
  }, [fromInput, toInput]);
  // Fahrer-Ansicht nutzt das gemeinsame Template.
  return (
    <PageLayout variant="center" className="page-theme page-theme--driver">
      <section className="driver-menu__panel stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />
        <div className="driver-menu__card stack stack--xl">
          <ProfileAvatar
            className="driver-menu__avatar"
            fallbackClassName="driver-menu__avatar-text"
            fallbackText="Profilbild"
            label="Profilbild"
          />

          <div className="driver-menu__offer stack stack--sm">
            <p className="driver-menu__offer-title">Fahrt anbieten</p>
            <span className="driver-menu__offer-divider" aria-hidden="true" />

            <div className="stack stack--xs">
              <p className="driver-menu__field-label">VON</p>
              <div className="driver-menu__field-box">
                <input
                  className="driver-menu__input"
                  type="text"
                  placeholder="Adresse eingeben"
                  value={fromInput}
                  onChange={(event) => setFromInput(event.target.value)}
                />
              </div>
            </div>

            <div className="stack stack--xs">
              <p className="driver-menu__field-label">NACH</p>
              <div className="driver-menu__field-box">
                <input
                  className="driver-menu__input"
                  type="text"
                  placeholder="Adresse eingeben"
                  value={toInput}
                  onChange={(event) => setToInput(event.target.value)}
                />
              </div>
            </div>

            <Link to={offerHref} className="driver-menu__cta">
              Fahrt anbieten
            </Link>
          </div>

          <div className="stack stack--sm">
            <Link to="/my-trips" className="driver-menu__link">
              Meine Fahrten
            </Link>
            <Link to="/vehicles" className="driver-menu__link">
              Fahrzeuge
            </Link>
          </div>
        </div>

        <PageFooter className="page__footer--sm" />
      </section>
    </PageLayout>
  );
}
