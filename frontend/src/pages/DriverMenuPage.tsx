import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import ProfileAvatar from "../components/ProfileAvatar";
import { PageFooter, PageLayout } from "../components/PageLayout";

export default function DriverMenuPage() {
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

            <Link to="/trip-publication" className="driver-menu__cta">
              ANBIETEN
            </Link>
          </div>

          <div className="stack stack--sm">
            <button type="button" className="driver-menu__link">
              MEINE FAHRTEN
            </button>
            <Link to="/vehicles" className="driver-menu__link">
              FAHRZEUGE
            </Link>
          </div>
        </div>

        <PageFooter className="page__footer--sm page__footer--inverse" />
      </section>
    </PageLayout>
  );
}
