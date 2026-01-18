import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Vehicle, fetchMyVehicles } from "../app/api";
import Logo from "../components/Logo";
import { PageFooter, PageLayout } from "../components/PageLayout";
import MessageBox from "../components/ui/MessageBox";

const storageKey = "cargonaut-token";

export default function VehiclesPage() {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey) || "");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "info" | "success"; text: string }>();
  const hasError = message?.tone === "error";

  const refreshVehicles = useCallback(() => {
    if (!token) {
      setVehicles([]);
      setMessage(undefined);
      setLoading(false);
      return;
    }
    setLoading(true);
    setMessage(undefined);
    fetchMyVehicles(token)
      .then((data) => {
        setVehicles(data);
      })
      .catch((err: Error) => {
        setVehicles([]);
        setMessage({ tone: "error", text: err.message });
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem(storageKey) || "");
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  useEffect(() => {
    refreshVehicles();
  }, [refreshVehicles]);

  useEffect(() => {
    const handleVehiclesChanged = () => {
      refreshVehicles();
    };
    window.addEventListener("vehicles-changed", handleVehiclesChanged);
    return () => window.removeEventListener("vehicles-changed", handleVehiclesChanged);
  }, [refreshVehicles]);

  return (
    <PageLayout variant="center" className="page-theme page-theme--driver">
      <section className="vehicles-page__panel stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />
        <div className="vehicles-page__card stack stack--lg">
          <header className="vehicles-page__header">
            <div>
              <p className="vehicles-page__title">Fahrzeuge</p>
              <span className="vehicles-page__divider" aria-hidden="true" />
              <p className="vehicles-page__subtitle">Übersicht deiner Fahrzeuge</p>
            </div>
          </header>

          <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

          {loading ? (
            <p className="vehicles-page__hint">Fahrzeuge werden geladen...</p>
          ) : vehicles.length === 0 ? (
            <p className="vehicles-page__hint">
              {hasError
                ? "Fahrzeuge konnten nicht geladen werden."
                : "Noch kein Fahrzeug hinterlegt."}
            </p>
          ) : (
            <div className="vehicles-page__list">
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="vehicles-page__item">
                  <div className="vehicles-page__thumb">
                    {vehicle.image_urls?.[0] ? (
                      <img src={vehicle.image_urls[0]} alt="Fahrzeug" />
                    ) : (
                      <span>Bild</span>
                    )}
                  </div>
                  <div className="vehicles-page__details">
                    <div className="vehicles-page__row">
                      <p className="vehicles-page__name">
                        {vehicle.name || `Fahrzeug #${vehicle.id}`}
                      </p>
                      <Link
                        to={`/vehicle-editor?vehicle=${vehicle.id}`}
                        className="vehicles-page__edit"
                      >
                        Bearbeiten
                      </Link>
                    </div>
                    <div className="vehicles-page__meta">
                      <span>Ladefläche: {vehicle.load_area ?? "k.A."} m²</span>
                      <span>Motor: {vehicle.motor_type ?? "k.A."}</span>
                    </div>
                    {vehicle.special_features ? (
                      <p className="vehicles-page__note">{vehicle.special_features}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="vehicles-page__actions">
            <Link to="/vehicle-editor?new=1" className="vehicles-page__cta">
              Fahrzeug erstellen
            </Link>
            <button
              type="button"
              className="vehicles-page__cta vehicles-page__cta--ghost"
              onClick={refreshVehicles}
              disabled={loading}
            >
              {loading ? "Aktualisieren..." : "Liste aktualisieren"}
            </button>
          </div>
        </div>

        {!token ? (
          <div className="vehicles-page__notice">
            <p>Bitte anmelden, um Fahrzeuge zu sehen.</p>
            <Link to="/login" className="vehicles-page__cta vehicles-page__cta--ghost">
              Zum Anmelden
            </Link>
          </div>
        ) : null}

        <PageFooter className="page__footer--sm page__footer--inverse" />
      </section>
    </PageLayout>
  );
}
