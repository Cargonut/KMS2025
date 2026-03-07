import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNearbyDrivers, NearbyDriver } from "../app/api";
import { PageFooter, PageLayout } from "../components/PageLayout";
import MessageBox from "../components/ui/MessageBox";

const DEFAULT_CENTER = { lat: 50.9375, lng: 6.9603 };

const createMapUrl = (lat: number, lng: number) => {
  const delta = 0.08;
  const bbox = `${lng - delta}%2C${lat - delta}%2C${lng + delta}%2C${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`;
};

export default function NearbyDriversPage() {
  const [radiusKm, setRadiusKm] = useState(15);
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [drivers, setDrivers] = useState<NearbyDriver[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setMessage("Geolocation wird nicht unterstützt. Es wird Köln als Zentrum verwendet.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (geo) => {
        setPosition({ lat: geo.coords.latitude, lng: geo.coords.longitude });
      },
      () => {
        setMessage("Standort konnte nicht bestimmt werden. Es wird Köln als Zentrum verwendet.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const items = await fetchNearbyDrivers(position.lat, position.lng, radiusKm);
        if (!active) return;
        setDrivers(items);
      } catch (err) {
        if (!active) return;
        const text = err instanceof Error ? err.message : "Fehler beim Laden der Fahrerdaten.";
        setMessage(text);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, 12000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [position.lat, position.lng, radiusKm]);

  const nearest = useMemo(() => (drivers.length > 0 ? drivers[0] : null), [drivers]);

  return (
    <PageLayout
      variant="stack"
      className="nearby-page"
      header={{
        title: "Nächster Fahrer auf Karte",
        subtitle: "Live-Suche im Radius mit automatischer Aktualisierung.",
        actions: (
          <Link to="/center" className="btn btn--ghost">
            Zurück
          </Link>
        ),
      }}
      contentWrap
    >
      <section className="nearby-page__card stack stack--md">
        <label className="nearby-page__radius">
          Radius: <strong>{radiusKm} km</strong>
          <input
            type="range"
            min={2}
            max={50}
            value={radiusKm}
            onChange={(event) => setRadiusKm(Number(event.target.value))}
          />
        </label>

        <div className="nearby-page__map-wrap">
          <iframe
            title="OpenStreetMap"
            className="nearby-page__map"
            src={createMapUrl(position.lat, position.lng)}
          />
        </div>

        {nearest ? (
          <MessageBox tone="success">
            Nächster Fahrer: {nearest.from_location} → {nearest.to_location} ({nearest.distance_km.toFixed(1)} km)
          </MessageBox>
        ) : (
          <MessageBox tone="info">
            {loading ? "Suche läuft …" : "Keine aktiven Fahrer im gewählten Radius gefunden."}
          </MessageBox>
        )}

        {message ? <MessageBox tone="error">{message}</MessageBox> : null}

        <div className="nearby-page__list stack stack--sm">
          {drivers.map((driver, index) => (
            <article
              key={`${driver.trip_id}-${driver.updated_at}`}
              className={`nearby-page__item ${index === 0 ? "nearby-page__item--nearest" : ""}`}
            >
              <p>
                {driver.from_location} → {driver.to_location}
              </p>
              <p className="muted">
                Distanz: {driver.distance_km.toFixed(2)} km · Letztes Update: {new Date(driver.updated_at).toLocaleTimeString("de-DE")}
              </p>
            </article>
          ))}
        </div>
      </section>

      <PageFooter className="page__footer--sm" />
    </PageLayout>
  );
}
