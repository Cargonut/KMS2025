import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TripPassenger, fetchMyTripBookings } from "../app/api";
import Logo from "../components/Logo";
import { PageFooter, PageLayout } from "../components/PageLayout";
import MessageBox from "../components/ui/MessageBox";

const storageKey = "cargonaut-token";

const formatTripDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  const pad = (part: number) => String(part).padStart(2, "0");
  const dateText = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const timeText = date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  return `${dateText} ${timeText}`;
};

const formatPrice = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Preis: k.A.";
  return `Preis: ${value.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`;
};

const formatSeats = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Plaetze: k.A.";
  return `Plaetze: ${value}`;
};

const formatMotorType = (value: string | null | undefined) => {
  if (!value) return "Motor: k.A.";
  return `Motor: ${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

const formatLoad = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Zuladung: k.A.";
  return `Zuladung: ${value} kg`;
};

const formatStatus = (value: string | null | undefined) => {
  if (!value) return "Status: k.A.";
  return `Status: ${value}`;
};

export default function PassengerOverviewPage() {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey) || "");
  const [bookings, setBookings] = useState<TripPassenger[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "info"; text: string }>();

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem(storageKey) || "");
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const loadBookings = useCallback(async () => {
    if (!token) {
      setBookings([]);
      setMessage(undefined);
      return;
    }
    setLoading(true);
    setMessage(undefined);
    try {
      const data = await fetchMyTripBookings(token);
      setBookings(data);
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unbekannter Fehler.";
      setMessage({ tone: "error", text });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return (
    <PageLayout variant="center" className="page-theme page-theme--passenger">
      <section className="trips-page__panel stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />
        <div className="trips-page__card stack stack--lg">
          <header className="trips-page__header">
            <p className="trips-page__title">UEBERSICHT</p>
            <span className="trips-page__divider" aria-hidden="true" />
            <p className="trips-page__subtitle">Deine gebuchten Fahrten</p>
          </header>

          <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

          {loading ? (
            <p className="trips-page__empty">Fahrten werden geladen...</p>
          ) : bookings.length === 0 ? (
            <p className="trips-page__empty">Noch keine Fahrten gebucht.</p>
          ) : (
            <div className="trips-page__list">
              {bookings.map((booking) => {
                const trip = booking.trip;
                return (
                  <article key={booking.id} className="trips-page__item">
                    <div className="trips-page__row">
                      <div>
                        <p className="trips-page__route">
                          {trip ? `${trip.from_location} - ${trip.to_location}` : "Fahrt nicht verfuegbar"}
                        </p>
                        <p className="trips-page__meta">
                          {trip ? formatTripDateTime(trip.start_date) : "--"}
                        </p>
                      </div>
                    </div>
                    <p className="trips-page__vehicle">{formatStatus(booking.status)}</p>
                    {trip ? (
                      <>
                        <p className="trips-page__vehicle">
                          Fahrzeug: {trip.vehicle?.name || (trip.vehicle_id ? `Fahrzeug #${trip.vehicle_id}` : "k.A.")}
                        </p>
                        <div className="trips-page__details">
                          <span>{formatPrice(trip.price)}</span>
                          <span>{formatSeats(trip.seats)}</span>
                          <span>{formatMotorType(trip.vehicle?.motor_type)}</span>
                          <span>{formatLoad(trip.vehicle?.weight)}</span>
                        </div>
                      </>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {!token ? (
          <div className="trips-page__notice">
            <p>Bitte einloggen, um deine Buchungen zu sehen.</p>
            <Link to="/login" className="trips-page__cta trips-page__cta--ghost">
              Zum Login
            </Link>
          </div>
        ) : null}

        <PageFooter className="page__footer--sm page__footer--inverse" />
      </section>
    </PageLayout>
  );
}
