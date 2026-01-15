import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreateTripInput, TripType, Vehicle, createTrip, fetchMyVehicles } from "../app/api";
import ProfileAvatar from "../components/ProfileAvatar";
import MessageBox from "../components/ui/MessageBox";

const storageKey = "cargonaut-token";

const formatDateTimeLocal = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export default function DriverMenuPage() {
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

  useEffect(() => {
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

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles],
  );

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
        throw new Error("Bitte ein gültiges Startdatum wählen.");
      }
      const payload: CreateTripInput = {
        ...form,
        type: form.type as TripType,
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
    <main className="page-center">
      <section className="driver-menu__panel stack stack--lg">
        <div className="driver-menu__card stack stack--xl">
          <ProfileAvatar
            className="driver-menu__avatar"
            fallbackClassName="driver-menu__avatar-text"
            fallbackText="Profilbild"
            label="Profilbild"
          />

          <form className="driver-menu__offer stack stack--sm" onSubmit={handleSubmit}>
            <p className="driver-menu__offer-title">ANBIETEN / SUCHEN</p>
            <span className="driver-menu__offer-divider" aria-hidden="true" />

            <label className="field field--tight">
              <span className="driver-menu__field-label">ART</span>
              <select
                className="field__control driver-menu__input"
                name="type"
                value={form.type}
                onChange={(event) => handleChange("type", event.target.value)}
              >
                <option value="angebot">Angebot erstellen</option>
                <option value="gesuch">Gesuch erstellen</option>
              </select>
            </label>

            <label className="field field--tight">
              <span className="driver-menu__field-label">VON</span>
              <input
                className="field__control driver-menu__input"
                name="from_location"
                placeholder="Startadresse eingeben"
                value={form.from_location}
                onChange={(event) => handleChange("from_location", event.target.value)}
              />
            </label>

            <label className="field field--tight">
              <span className="driver-menu__field-label">NACH</span>
              <input
                className="field__control driver-menu__input"
                name="to_location"
                placeholder="Zieladresse eingeben"
                value={form.to_location}
                onChange={(event) => handleChange("to_location", event.target.value)}
              />
            </label>

            <label className="field field--tight">
              <span className="driver-menu__field-label">START</span>
              <input
                className="field__control driver-menu__input"
                type="datetime-local"
                value={startDateLocal}
                onChange={(event) => setStartDateLocal(event.target.value)}
              />
            </label>

            {vehicles.length > 0 ? (
              <label className="field field--tight">
                <span className="driver-menu__field-label">FAHRZEUG</span>
                <select
                  className="field__control driver-menu__input"
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
            ) : (
              <p className="driver-menu__hint">
                Kein Fahrzeug hinterlegt. Bitte zuerst in der Fahrzeugverwaltung ein Fahrzeug anlegen.
              </p>
            )}

            {selectedVehicle ? (
              <div className="driver-menu__vehicle">
                <p className="driver-menu__vehicle-title">Aktuelles Fahrzeug</p>
                <p className="driver-menu__vehicle-detail">
                  {selectedVehicle.name || "Fahrzeug"} · Ladefläche:{" "}
                  {selectedVehicle.load_area ? `${selectedVehicle.load_area} m²` : "k.A."}
                </p>
                {selectedVehicle.special_features ? (
                  <p className="driver-menu__vehicle-detail">{selectedVehicle.special_features}</p>
                ) : null}
              </div>
            ) : null}

            <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

            <button type="submit" className="driver-menu__cta" disabled={busy || !token}>
              {busy ? "Speichern..." : "Angebot speichern"}
            </button>
          </form>

          <div className="stack stack--sm">
            <Link to="/auth" className="driver-menu__link">
              FAHRZEUGE VERWALTEN
            </Link>
            <Link to="/profile" className="driver-menu__link">
              PROFIL
            </Link>
          </div>
        </div>

        {!token && (
          <div className="driver-menu__notice">
            <p>Bitte einloggen, um Fahrten anzulegen.</p>
            <Link to="/login" className="driver-menu__cta driver-menu__cta--ghost">
              Zum Login
            </Link>
          </div>
        )}

        <footer className="page__footer page__footer--xs page__footer--inverse">
          <Link to="/impressum" className="page__footer-link">
            IMPRESSUM
          </Link>
        </footer>
      </section>
    </main>
  );
}
