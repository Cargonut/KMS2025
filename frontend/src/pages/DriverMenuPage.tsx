import { Link } from "react-router-dom";
import ProfileAvatar from "../components/ProfileAvatar";

export default function DriverMenuPage() {
  return (
    <main className="page-center">
      <section className="driver-menu__panel stack stack--lg">
        <div className="driver-menu__card stack stack--xl">
          <ProfileAvatar
            className="driver-menu__avatar"
            fallbackClassName="driver-menu__avatar-text"
            fallbackText="Profilbild"
            label="Profilbild"
          />

          <div className="driver-menu__offer stack stack--sm">
            <p className="driver-menu__offer-title">ANBIETEN</p>
            <span className="driver-menu__offer-divider" aria-hidden="true" />

            <div className="stack stack--xs">
              <p className="driver-menu__field-label">VON</p>
              <div className="driver-menu__field-box">
                <p className="driver-menu__field-text">Wiesenstr. 14,</p>
                <p className="driver-menu__field-text">35390 Giessen</p>
              </div>
            </div>

            <div className="stack stack--xs">
              <p className="driver-menu__field-label">NACH</p>
              <div className="driver-menu__field-box">
                <p className="driver-menu__field-text">Weilburger Str. 22,</p>
                <p className="driver-menu__field-text">60326 Frankfurt</p>
              </div>
            </div>

            <button type="button" className="driver-menu__cta">
              ANBIETEN
            </button>
          </div>

          <div className="stack stack--sm">
            <button type="button" className="driver-menu__link">
              MEINE FAHRTEN
            </button>
            <button type="button" className="driver-menu__link">
              FAHRZEUGE
            </button>
          </div>
        </div>

        <footer className="page__footer page__footer--xs page__footer--inverse">
          <Link to="/impressum" className="page__footer-link">
            IMPRESSUM
          </Link>
        </footer>
      </section>
    </main>
  );
}
