import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trip, bookTrip, fetchMyTripBookings, fetchTrips } from "../app/api";
import Logo from "../components/Logo";
import ProfileAvatar from "../components/ProfileAvatar";
import { PageFooter, PageLayout } from "../components/PageLayout";
import MessageBox from "../components/ui/MessageBox";

const storageKey = "cargonaut-token";

const formatTripDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatTripTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
};

const formatPrice = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "k.A.";
  return `${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
};

const formatSeats = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Plätze k.A.";
  return `${value} Plätze`;
};

const formatMotorType = (value: string | null | undefined) => {
  if (!value) return "Motor: k.A.";
  return `Motor: ${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

const formatLoad = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Zuladung: k.A.";
  return `Zuladung: ${value} kg`;
};

export default function PassengerMenuPage() {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey) || "");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [offers, setOffers] = useState<Trip[]>([]);
  const [results, setResults] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "info" | "success"; text: string }>();
  const [bookedTripIds, setBookedTripIds] = useState<number[]>([]);
  const [bookingTripId, setBookingTripId] = useState<number | null>(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem(storageKey) || "");
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMessage(undefined);
    fetchTrips()
      .then((data) => {
        if (!active) return;
        const filtered = data.filter((trip) => trip.type === "angebot" && trip.is_active);
        setOffers(filtered);
      })
      .catch((err: Error) => {
        if (!active) return;
        setMessage({ tone: "error", text: err.message });
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setBookedTripIds([]);
      return;
    }
    let active = true;
    fetchMyTripBookings(token)
      .then((data) => {
        if (!active) return;
        setBookedTripIds(data.map((entry) => entry.trip_id));
      })
      .catch((err: Error) => {
        if (!active) return;
        setMessage({ tone: "error", text: err.message });
      });

    return () => {
      active = false;
    };
  }, [token]);

  const handleSearch = () => {
    const fromQuery = fromInput.trim().toLowerCase();
    const toQuery = toInput.trim().toLowerCase();
    const filtered = offers.filter((trip) => {
      const fromValue = trip.from_location?.toLowerCase() ?? "";
      const toValue = trip.to_location?.toLowerCase() ?? "";
      const matchesFrom = fromQuery ? fromValue.includes(fromQuery) : true;
      const matchesTo = toQuery ? toValue.includes(toQuery) : true;
      const matchesDate = dateInput ? formatTripDate(trip.start_date) === dateInput : true;
      return matchesFrom && matchesTo && matchesDate;
    });

    setResults(filtered);
    setHasSearched(true);
  };

  const handleBook = async (tripId: number) => {
    if (!token) {
      setMessage({ tone: "error", text: "Bitte zuerst anmelden." });
      return;
    }
    setBookingTripId(tripId);
    setMessage(undefined);
    try {
      await bookTrip(tripId, token);
      setBookedTripIds((prev) => (prev.includes(tripId) ? prev : [...prev, tripId]));
      setMessage({ tone: "success", text: "Fahrt gebucht." });
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unbekannter Fehler.";
      setMessage({ tone: "error", text });
    } finally {
      setBookingTripId(null);
    }
  };

  return (
    <PageLayout variant="center" className="page-theme page-theme--passenger">
      <section className="passenger-menu__panel stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />
        <p className="passenger-menu__title">Mitfahrer-Menü</p>

        <div className="passenger-menu__card stack stack--xl">
          <ProfileAvatar
            className="passenger-menu__avatar"
            fallbackClassName="passenger-menu__avatar-text"
            fallbackText="Profilbild"
            label="Profilbild"
          />

          <div className="passenger-menu__offer stack stack--sm">
            <p className="passenger-menu__offer-title">Suchen</p>
            <span className="passenger-menu__offer-divider" aria-hidden="true" />

            <div className="stack stack--xs passenger-menu__field">
              <p className="passenger-menu__field-label">Von</p>
              <div className="passenger-menu__field-box">
                <input
                  className="passenger-menu__input"
                  type="text"
                  placeholder="Adresse eingeben"
                  value={fromInput}
                  onChange={(event) => setFromInput(event.target.value)}
                />
              </div>
            </div>

            <div className="stack stack--xs passenger-menu__field">
              <p className="passenger-menu__field-label">Nach</p>
              <div className="passenger-menu__field-box">
                <input
                  className="passenger-menu__input"
                  type="text"
                  placeholder="Adresse eingeben"
                  value={toInput}
                  onChange={(event) => setToInput(event.target.value)}
                />
              </div>
            </div>

            <div className="stack stack--xs">
              <p className="passenger-menu__field-label">Datum</p>
              <div className="passenger-menu__field-box">
                <input
                  className="passenger-menu__input"
                  type="date"
                  value={dateInput}
                  onChange={(event) => setDateInput(event.target.value)}
                />
              </div>
            </div>

            <button type="button" className="passenger-menu__cta" onClick={handleSearch}>
              Suchen
            </button>
          </div>

          <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

          <div className="passenger-menu__results stack stack--xs">
            <p className="passenger-menu__results-title">Angebote</p>
            {loading ? (
              <p className="passenger-menu__result-empty">Angebote werden geladen...</p>
            ) : hasSearched ? (
              results.length > 0 ? (
                results.map((trip) => (
                  <article key={trip.id} className="passenger-menu__result-card">
                    <div className="passenger-menu__result-head">
                      <div className="passenger-menu__result-thumb">
                        {trip.vehicle?.image_urls?.[0] ? (
                          <img src={trip.vehicle.image_urls[0]} alt="Fahrzeug" />
                        ) : (
                          <span>Bild</span>
                        )}
                      </div>
                      <div>
                        <p className="passenger-menu__result-route">
                          {trip.from_location} - {trip.to_location}
                        </p>
                        <p className="passenger-menu__result-meta">
                          {formatTripDate(trip.start_date) || "--"}{" "}
                          {formatTripTime(trip.start_date)}
                        </p>
                        <p className="passenger-menu__result-vehicle">
                          {formatMotorType(trip.vehicle?.motor_type)} -{" "}
                          {formatLoad(trip.vehicle?.weight)}
                        </p>
                      </div>
                    </div>
                    <div className="passenger-menu__result-details">
                      <span>{formatPrice(trip.price)}</span>
                      <span>{formatSeats(trip.seats)}</span>
                    </div>
                    <div className="passenger-menu__result-actions">
                      <button
                        type="button"
                        className="passenger-menu__result-cta"
                        onClick={() => handleBook(trip.id)}
                        disabled={bookingTripId === trip.id || bookedTripIds.includes(trip.id)}
                      >
                        {bookedTripIds.includes(trip.id)
                          ? "Gebucht"
                          : bookingTripId === trip.id
                            ? "Buchen..."
                            : "Buchen"}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="passenger-menu__result-empty">
                  Keine passenden Angebote gefunden. Bitte Suchkriterien anpassen.
                </p>
              )
            ) : (
              <p className="passenger-menu__result-empty">
                Suche starten, um verfügbare Fahrten anzuzeigen.
              </p>
            )}
          </div>

          <div className="stack stack--sm">
            <Link to="/passenger-overview" className="passenger-menu__link">
              UBERSICHT
            </Link>
          </div>
        </div>

        <PageFooter className="page__footer--sm" />
      </section>
    </PageLayout>
  );
}
