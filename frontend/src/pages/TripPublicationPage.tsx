import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CreateTripInput, Vehicle, createTrip, fetchMyVehicles } from "../app/api";
import { isValidPlzInput, normalizePlzInput } from "../app/plz";
import Logo from "../components/Logo";
import { PageFooter, PageLayout } from "../components/PageLayout";
import ProfileAvatar from "../components/ProfileAvatar";
import MessageBox from "../components/ui/MessageBox";
import usePlzSuggestions from "../hooks/usePlzSuggestions";

const storageKey = "cargonaut-token";

const formatDateTimeLocal = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export default function TripPublicationPage() {
  const [searchParams] = useSearchParams();
  const queryFrom = searchParams.get("from") ?? "";
  const queryTo = searchParams.get("to") ?? "";
  const [token, setToken] = useState<string>(() => localStorage.getItem(storageKey) || "");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string }>();
  const [form, setForm] = useState<CreateTripInput>(() => ({
    type: "angebot",
    from_location: queryFrom,
    to_location: queryTo,
    start_date: new Date().toISOString(),
  }));
  const [startDateLocal, setStartDateLocal] = useState(formatDateTimeLocal(new Date()));
  const [priceInput, setPriceInput] = useState("");
  const [seatsInput, setSeatsInput] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const fromSuggestions = usePlzSuggestions(form.from_location ?? "");
  const toSuggestions = usePlzSuggestions(form.to_location ?? "");

  useEffect(() => {
    if (!queryFrom && !queryTo) {
      return;
    }
    setForm((prev) => {
      let changed = false;
      const next = { ...prev };
      if (queryFrom && !prev.from_location) {
        next.from_location = queryFrom;
        changed = true;
      }
      if (queryTo && !prev.to_location) {
        next.to_location = queryTo;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [queryFrom, queryTo]);

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
          const firstId = Number(data[0]?.id);
          setSelectedVehicleId((current) => current ?? (Number.isFinite(firstId) ? firstId : null));
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
    () =>
      selectedVehicleId === null
        ? null
        : (vehicles.find((vehicle) => Number(vehicle.id) === selectedVehicleId) ?? null),
    [selectedVehicleId, vehicles],
  );
  const isVehicleReady =
    Boolean(selectedVehicle) &&
    typeof selectedVehicle?.load_area === "number" &&
    Number.isFinite(selectedVehicle.load_area) &&
    selectedVehicle.load_area > 0 &&
    typeof selectedVehicle?.weight === "number" &&
    Number.isFinite(selectedVehicle.weight) &&
    selectedVehicle.weight > 0;

  const title = "Fahrt anbieten";

  const handleChange = (name: keyof CreateTripInput, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const selectFrom = (value: string) => {
    handleChange("from_location", normalizePlzInput(value));
  };

  const selectTo = (value: string) => {
    handleChange("to_location", normalizePlzInput(value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setMessage({ tone: "error", text: "Bitte zuerst anmelden." });
      return;
    }
    setBusy(true);
    setMessage(undefined);
    try {
      const fromValue = normalizePlzInput(form.from_location ?? "");
      const toValue = normalizePlzInput(form.to_location ?? "");
      if (!fromValue || !toValue) {
        throw new Error("Bitte Start und Ziel angeben.");
      }
      const [fromValid, toValid] = await Promise.all([
        isValidPlzInput(fromValue),
        isValidPlzInput(toValue),
      ]);
      if (!fromValid || !toValid) {
        throw new Error("Bitte PLZ und Stadt aus der Liste wählen.");
      }
      if (!selectedVehicle) {
        throw new Error("Bitte zuerst ein Fahrzeug auswählen.");
      }
      if (!isVehicleReady) {
        throw new Error("Bitte ein Fahrzeug mit Ladefläche und Zuladung auswählen.");
      }
      const startDate = new Date(startDateLocal);
      if (Number.isNaN(startDate.getTime())) {
        throw new Error("Bitte ein gültiges Startdatum wählen.");
      }
      const normalizedPrice = priceInput.replace(",", ".").trim();
      const price = normalizedPrice ? Number(normalizedPrice) : undefined;
      if (normalizedPrice && (Number.isNaN(price) || price < 0)) {
        throw new Error("Bitte einen gültigen Preis angeben.");
      }
      const normalizedSeats = seatsInput.trim();
      const seats = normalizedSeats ? Number(normalizedSeats) : undefined;
      if (normalizedSeats && (!Number.isFinite(seats) || seats <= 0)) {
        throw new Error("Bitte gültige Sitzplätze angeben.");
      }
      const payload: CreateTripInput = {
        ...form,
        type: "angebot",
        from_location: fromValue,
        to_location: toValue,
        start_date: startDate.toISOString(),
        vehicle_id: selectedVehicle ? Number(selectedVehicle.id) : undefined,
        price,
        seats,
      };
      await createTrip(payload, token);
      setMessage({ tone: "success", text: "Angebot wurde gespeichert." });
      setForm((prev) => ({
        ...prev,
        from_location: "",
        to_location: "",
      }));
      setPriceInput("");
      setSeatsInput("");
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

            <label className="field field--tight plz-field">
              <span className="trip-publication__label">Von</span>
              <input
                className="field__control trip-publication__input"
                name="from_location"
                placeholder="PLZ Stadt eingeben"
                value={form.from_location}
                onChange={(event) => handleChange("from_location", event.target.value)}
              />
              {fromSuggestions.length > 0 ? (
                <ul className="plz-suggestions" role="listbox">
                  {fromSuggestions.map((entry) => (
                    <li key={`${entry.plz}-${entry.ort}`}>
                      <button
                        type="button"
                        className="plz-suggestion"
                        onClick={() => selectFrom(entry.label)}
                      >
                        {entry.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </label>

            <label className="field field--tight plz-field">
              <span className="trip-publication__label">Nach</span>
              <input
                className="field__control trip-publication__input"
                name="to_location"
                placeholder="PLZ Stadt eingeben"
                value={form.to_location}
                onChange={(event) => handleChange("to_location", event.target.value)}
              />
              {toSuggestions.length > 0 ? (
                <ul className="plz-suggestions" role="listbox">
                  {toSuggestions.map((entry) => (
                    <li key={`${entry.plz}-${entry.ort}`}>
                      <button
                        type="button"
                        className="plz-suggestion"
                        onClick={() => selectTo(entry.label)}
                      >
                        {entry.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </label>

            <label className="field field--tight">
              <span className="trip-publication__label">Start</span>
              <input
                className="field__control trip-publication__input"
                type="datetime-local"
                value={startDateLocal}
                onChange={(event) => setStartDateLocal(event.target.value)}
              />
            </label>

            <label className="field field--tight">
              <span className="trip-publication__label">Preis (EUR)</span>
              <input
                className="field__control trip-publication__input"
                type="number"
                min="0"
                step="0.01"
                placeholder="z. B. 12.50"
                value={priceInput}
                onChange={(event) => setPriceInput(event.target.value)}
              />
            </label>

            <label className="field field--tight">
              <span className="trip-publication__label">Sitzplätze</span>
              <input
                className="field__control trip-publication__input"
                type="number"
                min="1"
                step="1"
                placeholder="z. B. 3"
                value={seatsInput}
                onChange={(event) => setSeatsInput(event.target.value)}
              />
            </label>

            {vehicles.length > 0 ? (
              <label className="field field--tight">
                <span className="trip-publication__label">Fahrzeug</span>
                <select
                  className="field__control trip-publication__input"
                  value={selectedVehicleId ?? undefined}
                  onChange={(event) => {
                    const nextId = Number(event.target.value);
                    setSelectedVehicleId(Number.isFinite(nextId) ? nextId : null);
                  }}
                >
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name || `Fahrzeug #${vehicle.id}`}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="trip-publication__notice">
                <p>Bitte zuerst ein Fahrzeug anlegen, damit du Fahrten anbieten kannst.</p>
                <Link to="/vehicles" className="trip-publication__cta trip-publication__cta--ghost">
                  Fahrzeuge verwalten
                </Link>
              </div>
            )}

            {selectedVehicle ? (
              <div className="trip-publication__vehicle">
                <p className="trip-publication__vehicle-title">Fahrzeug</p>
                <div className="trip-publication__vehicle-row">
                  <span className="trip-publication__vehicle-label">Typ</span>
                  <span className="trip-publication__vehicle-value">
                    {selectedVehicle.motor_type || selectedVehicle.name || "k.A."}
                  </span>
                </div>
                <div className="trip-publication__vehicle-row">
                  <span className="trip-publication__vehicle-label">Ladefläche</span>
                  <span className="trip-publication__vehicle-value">
                    {selectedVehicle.load_area ? `${selectedVehicle.load_area} m²` : "k.A."}
                  </span>
                </div>
                <div className="trip-publication__vehicle-row">
                  <span className="trip-publication__vehicle-label">Zuladung</span>
                  <span className="trip-publication__vehicle-value">
                    {selectedVehicle.weight ? `${selectedVehicle.weight} kg` : "k.A."}
                  </span>
                </div>
              </div>
            ) : null}

            <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

            <button
              type="submit"
              className="trip-publication__cta"
              disabled={busy || !token || !selectedVehicle || !isVehicleReady}
            >
              {busy ? "Speichern..." : "Veröffentlichen"}
            </button>
          </form>

          <div className="trip-publication__links">
            <Link to="/vehicles" className="trip-publication__link">
              Fahrzeuge verwalten
            </Link>
            <Link to="/profile" className="trip-publication__link">
              Profil
            </Link>
          </div>
        </div>

        {!token && (
          <div className="trip-publication__notice">
            <p>Bitte anmelden, um Fahrten anzulegen.</p>
            <Link to="/login" className="trip-publication__cta trip-publication__cta--ghost">
              Zum Anmelden
            </Link>
          </div>
        )}

        <PageFooter className="page__footer--sm page__footer--inverse" />
      </section>
    </PageLayout>
  );
}
