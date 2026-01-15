import ProfileAvatar from "../components/ProfileAvatar";
import { PageFooter, PageLayout } from "../components/PageLayout";

export default function PassengerMenuPage() {
  // Mitfahrer-Ansicht nutzt das gemeinsame Template.
  return (
    <PageLayout variant="center" className="page-theme page-theme--passenger">
      <section className="passenger-menu__panel stack stack--lg">
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

            <div className="stack stack--xs">
              <p className="passenger-menu__field-label">VON</p>
              <div className="passenger-menu__field-box">
                <p className="passenger-menu__field-text">35390 Giessen</p>
              </div>
            </div>

            <div className="stack stack--xs">
              <p className="passenger-menu__field-label">NACH</p>
              <div className="passenger-menu__field-box">
                <p className="passenger-menu__field-text">60326 Frankfurt</p>
              </div>
            </div>

            <div className="stack stack--xs">
              <p className="passenger-menu__field-label">DATUM</p>
              <div className="passenger-menu__date">
                <div className="passenger-menu__date-item">19</div>
                <div className="passenger-menu__date-item">JAN</div>
                <div className="passenger-menu__date-item">2025</div>
              </div>
            </div>

            <button type="button" className="passenger-menu__cta">
              SUCHEN
            </button>
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
