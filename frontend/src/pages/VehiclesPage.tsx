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
  const [message, setMessage] = useState<{ tone: "error" | "info" | "success"; text: string }>();

  const refreshVehicles = useCallback(() => {
    if (!token) {
      setVehicles([]);
      setMessage(undefined);
      return;
    }
    setMessage(undefined);
    fetchMyVehicles(token)
      .then(setVehicles)
      .catch((err: Error) => {
        setVehicles([]);
        setMessage({ tone: "error", text: err.message });
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
              <p className="vehicles-page__title">FAHRZEUGE</p>
              <span className="vehicles-page__divider" aria-hidden="true" />
              <p className="vehicles-page__subtitle">Uebersicht deiner Fahrzeuge</p>
            </div>
          </header>

          <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

          {vehicles.length === 0 ? (
            <p className="vehicles-page__hint">Noch kein Fahrzeug hinterlegt.</p>
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
                      <p className="vehicles-page__name">{vehicle.name || `Fahrzeug #${vehicle.id}`}</p>
                      <Link to={`/vehicle-editor?vehicle=${vehicle.id}`} className="vehicles-page__edit">
                        Bearbeiten
                      </Link>
                    </div>
                    <div className="vehicles-page__meta">
                      <span>Ladeflaeche: {vehicle.load_area ?? "k.A."} m2</span>
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
          </div>
        </div>

        {!token ? (
          <div className="vehicles-page__notice">
            <p>Bitte einloggen, um Fahrzeuge zu sehen.</p>
            <Link to="/login" className="vehicles-page__cta vehicles-page__cta--ghost">
              Zum Login
            </Link>
          </div>
        ) : null}

        <PageFooter className="page__footer--sm page__footer--inverse" />
      </section>
    </PageLayout>
  );
}
