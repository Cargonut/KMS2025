import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  deleteMe,
  fetchMyRatings,
  fetchProfile,
  Profile,
  setBalance,
  TripRatingDriver,
  TripRatingOverview,
  TripRatingPassenger,
  updateProfile,
  uploadProfileImage,
} from "../app/api";
import { PageFooter, PageLayout } from "../components/PageLayout";
import MessageBox from "../components/ui/MessageBox";
import type { Message } from "../features/types";
import Logo from "../components/Logo";

const storageKey = "cargonaut-token";
const previewSize = 140;
const outputSize = 512;

export default function ProfilePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem(storageKey);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<Message>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMessage, setDeleteMessage] = useState<Message>();
  const [deleting, setDeleting] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [balanceMessage, setBalanceMessage] = useState<Message>();
  const [updatingBalance, setUpdatingBalance] = useState(false);
  const [ratings, setRatings] = useState<TripRatingOverview>({ as_driver: [], as_passenger: [] });
  const [ratingsError, setRatingsError] = useState<string | null>(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      const data = await fetchProfile(token);
      setProfile(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [token]);

  const loadRatings = useCallback(async () => {
    if (!token) return;
    setRatingsLoading(true);
    setRatingsError(null);
    try {
      const result = await fetchMyRatings(token);
      setRatings(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setRatingsError(message);
    } finally {
      setRatingsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    loadProfile();
  }, [loadProfile, token]);

  useEffect(() => {
    if (!token) return;
    loadRatings();
  }, [loadRatings, token]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      setImageSize(null);
      setZoom(1);
      setMinZoom(1);
      setOffset({ x: 0, y: 0 });
      setDragging(false);
      dragStateRef.current = null;
      imageRef.current = null;
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    const image = new Image();
    image.onload = () => {
      imageRef.current = image;
      const nextMinZoom = Math.max(previewSize / image.width, previewSize / image.height);
      const nextZoom = nextMinZoom;
      const nextOffset = {
        x: (previewSize - image.width * nextZoom) / 2,
        y: (previewSize - image.height * nextZoom) / 2,
      };
      setImageSize({ width: image.width, height: image.height });
      setMinZoom(nextMinZoom);
      setZoom(nextZoom);
      setOffset(nextOffset);
    };
    image.onerror = () => {
      setUploadMessage({ tone: "error", text: "Bild konnte nicht geladen werden." });
      setPreviewUrl(null);
      setImageSize(null);
    };
    image.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
      imageRef.current = null;
    };
  }, [selectedFile]);

  const clampOffset = (nextX: number, nextY: number, zoomValue: number) => {
    if (!imageSize) return { x: nextX, y: nextY };

    const scaledWidth = imageSize.width * zoomValue;
    const scaledHeight = imageSize.height * zoomValue;
    const minX = Math.min(0, previewSize - scaledWidth);
    const minY = Math.min(0, previewSize - scaledHeight);

    return {
      x: Math.min(0, Math.max(minX, nextX)),
      y: Math.min(0, Math.max(minY, nextY)),
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!previewUrl || !imageSize) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (!dragState) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    const next = clampOffset(dragState.originX + deltaX, dragState.originY + deltaY, zoom);
    setOffset(next);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current) return;
    dragStateRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleZoomChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextZoom = Math.max(minZoom, Number(event.target.value));
    if (!imageSize) {
      setZoom(nextZoom);
      return;
    }

    const centerX = (previewSize / 2 - offset.x) / zoom;
    const centerY = (previewSize / 2 - offset.y) / zoom;
    const nextOffsetX = previewSize / 2 - centerX * nextZoom;
    const nextOffsetY = previewSize / 2 - centerY * nextZoom;
    const clamped = clampOffset(nextOffsetX, nextOffsetY, nextZoom);

    setZoom(nextZoom);
    setOffset(clamped);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadMessage(undefined);
  };

  const buildCroppedFile = async () => {
    if (!selectedFile) return null;
    const image = imageRef.current;
    if (!image || !imageSize) return selectedFile;

    const srcX = Math.max(0, Math.min(image.width, -offset.x / zoom));
    const srcY = Math.max(0, Math.min(image.height, -offset.y / zoom));
    const srcSize = previewSize / zoom;
    const srcWidth = Math.min(image.width - srcX, srcSize);
    const srcHeight = Math.min(image.height - srcY, srcSize);

    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Kein Canvas-Kontext.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, srcX, srcY, srcWidth, srcHeight, 0, 0, outputSize, outputSize);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (!result) {
            reject(new Error("Crop fehlgeschlagen."));
            return;
          }
          resolve(result);
        },
        selectedFile.type || "image/png",
        0.92,
      );
    });

    return new File([blob], selectedFile.name, { type: blob.type });
  };

  const handleUpload = async () => {
    if (!token || !selectedFile) return;
    setUploading(true);
    setUploadMessage(undefined);

    try {
      const croppedFile = await buildCroppedFile();
      if (!croppedFile) return;
      const imageUrl = await uploadProfileImage(croppedFile);
      const updated = await updateProfile({ profile_image: imageUrl }, token);
      setProfile(updated);
      setUploadMessage({ tone: "success", text: "Profilbild aktualisiert." });
      window.dispatchEvent(new Event("profile-updated"));
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setUploadMessage({ tone: "error", text: message });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!token) return;
    setDeleting(true);
    setDeleteMessage(undefined);
    try {
      if (!deletePassword.trim()) {
        throw new Error("Bitte Passwort eingeben.");
      }
      await deleteMe(deletePassword, token);
      localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event("auth-changed"));
      navigate("/", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unbekannter Fehler";
      setDeleteMessage({ tone: "error", text: message });
    } finally {
      setDeleting(false);
    }
  };

  if (!token) {
    return <Navigate to="/signup" replace />;
  }

  const zoomMax = Math.max(minZoom * 3, minZoom + 0.5);
  const birthDate = profile?.birth_date ? new Date(profile.birth_date) : null;
  const isBirthDateValid = birthDate && !Number.isNaN(birthDate.getTime());
  const birthParts = isBirthDateValid
    ? {
        day: String(birthDate.getDate()).padStart(2, "0"),
        month: ["JAN", "FEB", "MÄR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"][
          birthDate.getMonth()
        ],
        year: String(birthDate.getFullYear()),
      }
    : { day: "--", month: "---", year: "----" };

  const formatRatingDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unbekannt";
    return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const renderRatingCard = (
    entry: TripRatingDriver | TripRatingPassenger,
    label: string,
    counterpart?: { first_name: string; last_name: string } | null,
  ) => (
    <article key={entry.id} className="profile-page__rating-card">
      <div className="profile-page__rating-header">
        <span className="profile-page__rating-role">{label}</span>
        <span className="profile-page__rating-stars">{entry.stars}/5</span>
      </div>
      <p className="profile-page__rating-meta">
        {counterpart ? `${counterpart.first_name} ${counterpart.last_name}` : "Unbekannter Nutzer"}
        {" · "}
        {formatRatingDate(entry.created_at)}
      </p>
      {entry.trip ? (
        <p className="profile-page__rating-trip">
          {entry.trip.from_location} → {entry.trip.to_location}
        </p>
      ) : null}
      {entry.comment ? <p className="profile-page__rating-comment">"{entry.comment}"</p> : null}
    </article>
  );

  return (
    <PageLayout variant="center">
      <section className="profile-page__panel stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />

        <div className="profile-page__card stack stack--md">
          <div className="profile-page__avatar">
            <button
              type="button"
              className="profile-page__avatar-button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Profilbild ändern"
              disabled={uploading}
            >
              {profile?.profile_image ? (
                <img src={profile.profile_image} alt="Profilbild" />
              ) : (
                <span>Profilbild</span>
              )}
            </button>
            <input
              ref={fileInputRef}
              className="profile-page__file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          <div className="profile-page__header">
            <p className="profile-page__title">Profil</p>
            <span className="profile-page__divider" aria-hidden="true" />
          </div>

          {error && <MessageBox tone="error">{error}</MessageBox>}
          {busy && !profile && <p className="profile-page__hint">Lade Profil...</p>}

          {/* Guthaben-Anzeige - Prominent */}
          {profile && (
            <div className="profile-page__balance-display">
              <span className="profile-page__balance-label">Aktuelles Guthaben</span>
              <div className="profile-page__balance-value">
                {typeof profile.balance === "number"
                  ? `${profile.balance.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
                  : "0,00 EUR"}
              </div>
            </div>
          )}

          <div className="profile-page__grid profile-page__grid--two">
            <div className="profile-page__field">
              <span className="profile-page__label">Vorname</span>
              <div className="profile-page__value">{profile?.first_name || "-"}</div>
            </div>
            <div className="profile-page__field">
              <span className="profile-page__label">Nachname</span>
              <div className="profile-page__value">{profile?.last_name || "-"}</div>
            </div>
            <div className="profile-page__field profile-page__field--full">
              <span className="profile-page__label">E-Mail</span>
              <div className="profile-page__value">{profile?.email || "-"}</div>
            </div>
            <div className="profile-page__field profile-page__field--full">
              <span className="profile-page__label">Geburtsdatum</span>
              <div className="profile-page__date">
                <div className="profile-page__value profile-page__value--tight">
                  {birthParts.day}
                </div>
                <div className="profile-page__value profile-page__value--tight">
                  {birthParts.month}
                </div>
                <div className="profile-page__value profile-page__value--tight">
                  {birthParts.year}
                </div>
              </div>
            </div>
            <div className="profile-page__field profile-page__field--full">
              <span className="profile-page__label">Passwort</span>
              <div className="profile-page__value">************</div>
            </div>
            <div className="profile-page__field profile-page__field--full">
              <span className="profile-page__label">Passwort wiederholen</span>
              <div className="profile-page__value">************</div>
            </div>
          </div>

          <div className="profile-page__balance-section stack stack--sm">
            <label className="profile-page__field">
              <span className="profile-page__label">Guthaben aufladen</span>
              <input
                className="profile-page__input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Betrag eingeben (z.B. 50.00)"
                value={balanceInput}
                onChange={(event) => setBalanceInput(event.target.value)}
                disabled={updatingBalance}
              />
            </label>
            <MessageBox tone={balanceMessage?.tone}>{balanceMessage?.text}</MessageBox>
            <button
              type="button"
              className="profile-page__cta profile-page__cta--secondary"
              onClick={async () => {
                if (!token) return;
                const amount = parseFloat(balanceInput.replace(",", "."));
                if (isNaN(amount) || amount <= 0) {
                  setBalanceMessage({ tone: "error", text: "Bitte einen gültigen Betrag eingeben." });
                  return;
                }
                setUpdatingBalance(true);
                setBalanceMessage(undefined);
                try {
                  const updated = await setBalance(amount, token);
                  // Profil aktualisieren mit neuem Guthaben
                  setProfile(updated);
                  setBalanceInput("");
                  const balanceText = typeof updated.balance === "number"
                    ? updated.balance.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : "0,00";
                  setBalanceMessage({ tone: "success", text: `Guthaben erfolgreich auf ${balanceText} EUR aufgeladen.` });
                  // Profil neu laden, um sicherzustellen, dass alle Daten aktuell sind
                  await loadProfile();
                } catch (err) {
                  const message = err instanceof Error ? err.message : "Unbekannter Fehler";
                  setBalanceMessage({ tone: "error", text: message });
                } finally {
                  setUpdatingBalance(false);
                }
              }}
              disabled={updatingBalance || !balanceInput.trim()}
            >
              {updatingBalance ? "Lädt..." : "Guthaben aufladen"}
            </button>
          </div>

          <div className="profile-page__ratings stack stack--sm">
            <div className="profile-page__ratings-header">
              <p className="profile-page__section-title">Bewertungen</p>
              <button
                type="button"
                className="profile-page__cta profile-page__cta--ghost"
                onClick={loadRatings}
                disabled={ratingsLoading}
              >
                {ratingsLoading ? "Lädt..." : "Aktualisieren"}
              </button>
            </div>
            {ratingsError ? <MessageBox tone="error">{ratingsError}</MessageBox> : null}
            <div className="profile-page__ratings-group">
              <p className="profile-page__ratings-label">Als Fahrer</p>
              {ratingsLoading && (!ratings.as_driver || ratings.as_driver.length === 0) ? (
                <p className="profile-page__hint">Lade Bewertungen...</p>
              ) : null}
              {!ratingsLoading && (!ratings.as_driver || ratings.as_driver.length === 0) ? (
                <p className="profile-page__hint">Noch keine Bewertungen als Fahrer.</p>
              ) : null}
              {ratings.as_driver?.map((entry) =>
                renderRatingCard(entry, "Fahrer", entry.passenger ?? null),
              )}
            </div>
            <div className="profile-page__ratings-group">
              <p className="profile-page__ratings-label">Als Mitfahrer</p>
              {ratingsLoading && (!ratings.as_passenger || ratings.as_passenger.length === 0) ? (
                <p className="profile-page__hint">Lade Bewertungen...</p>
              ) : null}
              {!ratingsLoading && (!ratings.as_passenger || ratings.as_passenger.length === 0) ? (
                <p className="profile-page__hint">Noch keine Bewertungen als Mitfahrer.</p>
              ) : null}
              {ratings.as_passenger?.map((entry) =>
                renderRatingCard(entry, "Mitfahrer", entry.driver ?? null),
              )}
            </div>
          </div>

          <div className="profile-page__vehicles">
            <Link to="/vehicles" className="profile-page__section-link">
              Fahrzeuge
            </Link>
            <div className="profile-page__actions">
              <button
                type="button"
                className="profile-page__action"
                aria-label="Konto löschen"
                onClick={() => {
                  setDeletePassword("");
                  setDeleteMessage(undefined);
                  setDeleteOpen(true);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M9 3h6l1 2h5v2H3V5h5l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9z"
                    fill="currentColor"
                  />
                  <path d="M6 9h2v9H6V9z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>

          {previewUrl && imageSize && (
            <div className="profile-page__upload stack stack--sm">
              <div className="image-preview">
                <span className="profile-page__hint">Bild zuschneiden</span>
                <div
                  className={`image-preview__frame${dragging ? " image-preview__frame--dragging" : ""}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <img
                    className="image-preview__image"
                    src={previewUrl}
                    alt="Profilbild Vorschau"
                    style={{
                      width: imageSize.width * zoom,
                      height: imageSize.height * zoom,
                      transform: `translate(${offset.x}px, ${offset.y}px)`,
                    }}
                  />
                </div>
                <label className="profile-page__field">
                  <span className="profile-page__label">Zoom</span>
                  <input
                    className="profile-page__range"
                    type="range"
                    min={minZoom}
                    max={zoomMax}
                    step={0.01}
                    value={zoom}
                    onChange={handleZoomChange}
                    disabled={!imageSize}
                  />
                </label>
              </div>
              <MessageBox tone={uploadMessage?.tone}>{uploadMessage?.text}</MessageBox>
              <button
                type="button"
                className="profile-page__cta"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
              >
                {uploading ? "Upload läuft..." : "Profilbild speichern"}
              </button>
            </div>
          )}

          {!previewUrl && uploadMessage ? (
            <MessageBox tone={uploadMessage.tone}>{uploadMessage.text}</MessageBox>
          ) : null}
        </div>

        <PageFooter className="page__footer--sm page__footer--inverse" />

        {deleteOpen ? (
          <div className="profile-page__modal-backdrop" role="dialog" aria-modal="true">
            <div className="profile-page__modal">
              <p className="profile-page__modal-title">Konto löschen?</p>
              <p className="profile-page__modal-text">
                Bist du sicher, dass du dein Konto unwiderruflich löschen willst?
              </p>
              <label className="profile-page__field">
                <span className="profile-page__label">Passwort</span>
                <input
                  className="profile-page__input"
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  placeholder="Passwort eingeben"
                />
              </label>
              <MessageBox tone={deleteMessage?.tone}>{deleteMessage?.text}</MessageBox>
              <div className="profile-page__modal-actions">
                <button
                  type="button"
                  className="profile-page__cta profile-page__cta--ghost"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  className="profile-page__cta"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "Löschen..." : "Konto löschen"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </PageLayout>
  );
}
