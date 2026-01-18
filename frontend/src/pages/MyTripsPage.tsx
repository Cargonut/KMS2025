import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trip, deleteTrip, fetchProfile, fetchTrips } from "../app/api";
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
  if (typeof value !== "number" || !Number.isFinite(value)) return "Plätze: k.A.";
  return `Plätze: ${value}`;
};

const formatMotorType = (value: string | null | undefined) => {
  if (!value) return "Motor: k.A.";
  return `Motor: ${value.charAt(0).toUpperCase()}${value.slice(1)}`;
};

const formatLoad = (value: number | null | undefined) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Zuladung: k.A.";
  return `Zuladung: ${value} kg`;
};

export default function MyTripsPage() {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey) || "");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "info" | "success"; text: string }>();
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<{
    tone: "error" | "info" | "success";
    text: string;
  }>();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem(storageKey) || "");
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const loadTrips = useCallback(async () => {
    if (!token) {
      setTrips([]);
      setMessage(undefined);
      return;
    }
    setLoading(true);
    setMessage(undefined);
    try {
      const profile = await fetchProfile(token);
      const userId = Number(profile.id);
      if (!Number.isFinite(userId)) {
        throw new Error("Ungültige Nutzer-ID.");
      }
      const data = await fetchTrips();
      const filtered = data.filter((trip) => Number(trip.user_id) === userId);
      setTrips(filtered);
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unbekannter Fehler.";
      setMessage({ tone: "error", text });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleDeleteRequest = (trip: Trip) => {
    setDeleteMessage(undefined);
    setDeleteTarget(trip);
  };

  const handleConfirmDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    setDeleteMessage(undefined);
    try {
      await deleteTrip(deleteTarget.id, token);
      setTrips((prev) => prev.filter((trip) => trip.id !== deleteTarget.id));
      setDeleteTarget(null);
      setMessage({ tone: "success", text: "Fahrt gelöscht." });
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unbekannter Fehler.";
      setDeleteMessage({ tone: "error", text });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageLayout variant="center" className="page-theme page-theme--driver">
      <section className="trips-page__panel stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />
        <div className="trips-page__card stack stack--lg">
          <header className="trips-page__header">
            <p className="trips-page__title">Meine Fahrten</p>
            <span className="trips-page__divider" aria-hidden="true" />
            <p className="trips-page__subtitle">Übersicht deiner veröffentlichten Fahrten</p>
          </header>

          <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

          {loading ? (
            <p className="trips-page__empty">Fahrten werden geladen...</p>
          ) : trips.length === 0 ? (
            <p className="trips-page__empty">Noch keine Fahrten veröffentlicht.</p>
          ) : (
            <div className="trips-page__list">
              {trips.map((trip) => (
                <article key={trip.id} className="trips-page__item">
                  <div className="trips-page__row">
                    <div>
                      <p className="trips-page__route">
                        {trip.from_location} - {trip.to_location}
                      </p>
                      <p className="trips-page__meta">{formatTripDateTime(trip.start_date)}</p>
                    </div>
                    <button
                      type="button"
                      className="trips-page__delete"
                      onClick={() => handleDeleteRequest(trip)}
                      disabled={deleting}
                    >
                      Löschen
                    </button>
                  </div>
                  <p className="trips-page__vehicle">
                    Fahrzeug:{" "}
                    {trip.vehicle?.name ||
                      (trip.vehicle_id ? `Fahrzeug #${trip.vehicle_id}` : "k.A.")}
                  </p>
                  <div className="trips-page__details">
                    <span>{formatPrice(trip.price)}</span>
                    <span>{formatSeats(trip.seats)}</span>
                    <span>{formatMotorType(trip.vehicle?.motor_type)}</span>
                    <span>{formatLoad(trip.vehicle?.weight)}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {!token ? (
          <div className="trips-page__notice">
            <p>Bitte anmelden, um deine Fahrten zu sehen.</p>
            <Link to="/login" className="trips-page__cta trips-page__cta--ghost">
              Zum Anmelden
            </Link>
          </div>
        ) : null}

        <PageFooter className="page__footer--sm page__footer--inverse" />

        {deleteTarget ? (
          <div className="profile-page__modal-backdrop" role="dialog" aria-modal="true">
            <div className="profile-page__modal">
              <p className="profile-page__modal-title">Fahrt löschen?</p>
              <p className="profile-page__modal-text">
                Bist du sicher, dass du die Fahrt von {deleteTarget.from_location} nach{" "}
                {deleteTarget.to_location} löschen willst?
              </p>
              <MessageBox tone={deleteMessage?.tone}>{deleteMessage?.text}</MessageBox>
              <div className="profile-page__modal-actions">
                <button
                  type="button"
                  className="profile-page__cta profile-page__cta--ghost"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  className="profile-page__cta"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Löschen..." : "Fahrt löschen"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </PageLayout>
  );
}
