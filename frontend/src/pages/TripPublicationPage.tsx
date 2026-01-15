import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreateTripInput, Vehicle, createTrip, fetchMyVehicles } from "../app/api";
import Logo from "../components/Logo";
import { PageFooter, PageLayout } from "../components/PageLayout";
import ProfileAvatar from "../components/ProfileAvatar";
import MessageBox from "../components/ui/MessageBox";
import VehicleManager from "../features/VehicleManager";

const storageKey = "cargonaut-token";

const formatDateTimeLocal = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export default function TripPublicationPage() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(storageKey) || "");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string }>();
  const [form, setForm] = useState<CreateTripInput>({
    type: "angebot",
    from_location: "",
    to_location: "",
    start_date: new Date().toISOString(),
  });
  const [startDateLocal, setStartDateLocal] = useState(formatDateTimeLocal(new Date()));
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem(storageKey) || "");
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const refreshVehicles = useCallback(() => {
    if (!token) {
      setVehicles([]);
      setSelectedVehicleId(null);
      return;
    }
    fetchMyVehicles(token)
      .then((data) => {
        setVehicles(data);
        if (data.length > 0) {
          setSelectedVehicleId((current) => current ?? data[0]?.id ?? null);
        }
      })
      .catch((err: Error) => {
        setMessage({ tone: "error", text: err.message });
      });
  }, [token]);

  useEffect(() => {
    refreshVehicles();
  }, [refreshVehicles]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles],
  );

  const title = "FAHRT ANBIETEN";

  const handleChange = (name: keyof CreateTripInput, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setMessage({ tone: "error", text: "Bitte zuerst einloggen." });
      return;
    }
    setBusy(true);
    setMessage(undefined);
    try {
      if (!form.from_location || !form.to_location) {
        throw new Error("Bitte Start und Ziel angeben.");
      }
      const startDate = new Date(startDateLocal);
      if (Number.isNaN(startDate.getTime())) {
        throw new Error("Bitte ein gueltiges Startdatum waehlen.");
      }
      const payload: CreateTripInput = {
        ...form,
        type: "angebot",
        start_date: startDate.toISOString(),
        vehicle_id: selectedVehicle?.id ?? undefined,
      };
      await createTrip(payload, token);
      setMessage({ tone: "success", text: "Angebot wurde gespeichert." });
      setForm((prev) => ({
        ...prev,
        from_location: "",
        to_location: "",
      }));
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unbekannter Fehler.";
      setMessage({ tone: "error", text });
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageLayout variant="center" className="page-theme page-theme--driver">
      <section className="trip-publication__panel stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />
        <div className="trip-publication__card stack stack--lg">
          <ProfileAvatar
            className="trip-publication__avatar"
            fallbackClassName="trip-publication__avatar-text"
            fallbackText="Profilbild"
            label="Profilbild"
          />

          <form className="trip-publication__form stack stack--sm" onSubmit={handleSubmit}>
            <p className="trip-publication__title">{title}</p>
            <span className="trip-publication__divider" aria-hidden="true" />

            <label className="field field--tight">
              <span className="trip-publication__label">VON</span>
              <input
                className="field__control trip-publication__input"
                name="from_location"
                placeholder="Startadresse eingeben"
                value={form.from_location}
                onChange={(event) => handleChange("from_location", event.target.value)}
              />
            </label>

            <label className="field field--tight">
              <span className="trip-publication__label">NACH</span>
              <input
                className="field__control trip-publication__input"
                name="to_location"
                placeholder="Zieladresse eingeben"
                value={form.to_location}
                onChange={(event) => handleChange("to_location", event.target.value)}
              />
            </label>

            <label className="field field--tight">
              <span className="trip-publication__label">START</span>
              <input
                className="field__control trip-publication__input"
                type="datetime-local"
                value={startDateLocal}
                onChange={(event) => setStartDateLocal(event.target.value)}
              />
            </label>

            {vehicles.length > 0 ? (
              <label className="field field--tight">
                <span className="trip-publication__label">FAHRZEUG</span>
                <select
                  className="field__control trip-publication__input"
                  value={selectedVehicleId ?? undefined}
                  onChange={(event) => setSelectedVehicleId(Number(event.target.value))}
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name || `Fahrzeug #${vehicle.id}`}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {selectedVehicle ? (
              <div className="trip-publication__vehicle">
                <p className="trip-publication__vehicle-title">FAHRZEUG</p>
                <div className="trip-publication__vehicle-row">
                  <span className="trip-publication__vehicle-label">TYP</span>
                  <span className="trip-publication__vehicle-value">
                    {selectedVehicle.motor_type || selectedVehicle.name || "k.A."}
                  </span>
                </div>
                <div className="trip-publication__vehicle-row">
                  <span className="trip-publication__vehicle-label">STAURAUM</span>
                  <span className="trip-publication__vehicle-value">
                    {selectedVehicle.dimensions ||
                      (selectedVehicle.load_area ? `${selectedVehicle.load_area} m2` : "k.A.")}
                  </span>
                </div>
                <div className="trip-publication__vehicle-row">
                  <span className="trip-publication__vehicle-label">SITZPLAETZE</span>
                  <span className="trip-publication__vehicle-value">k.A.</span>
                </div>
              </div>
            ) : null}

            <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

            <button type="submit" className="trip-publication__cta" disabled={busy || !token}>
              {busy ? "Speichern..." : "Veroeffentlichen"}
            </button>
          </form>

          <div className="trip-publication__links">
            <Link to="/vehicle-editor" className="trip-publication__link">
              FAHRZEUGE VERWALTEN
            </Link>
            <Link to="/profile" className="trip-publication__link">
              PROFIL
            </Link>
          </div>
        </div>

        {token && vehicles.length === 0 ? (
          <div className="trip-publication__manager">
            <VehicleManager token={token} vehicles={vehicles} onRefresh={refreshVehicles} />
          </div>
        ) : null}

        {!token && (
          <div className="trip-publication__notice">
            <p>Bitte einloggen, um Fahrten anzulegen.</p>
            <Link to="/login" className="trip-publication__cta trip-publication__cta--ghost">
              Zum Login
            </Link>
          </div>
        )}

        <PageFooter className="page__footer--sm page__footer--inverse" />
      </section>
    </PageLayout>
  );
}
