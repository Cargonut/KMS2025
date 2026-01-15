import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { fetchProfile, Profile, updateProfile, uploadProfileImage } from "../app/api";
import { PageFooter, PageLayout } from "../components/PageLayout";
import Card from "../components/ui/Card";
import MessageBox from "../components/ui/MessageBox";
import ProfileView from "../features/ProfileView";
import type { Message } from "../features/types";

const storageKey = "cargonaut-token";
const previewSize = 140;
const outputSize = 512;

export default function ProfilePage() {
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
  const dragStateRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    if (!token) return;
    loadProfile();
  }, [loadProfile, token]);

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

  if (!token) {
    return <Navigate to="/signup" replace />;
  }

  const zoomMax = Math.max(minZoom * 3, minZoom + 0.5);

  // Profilseite bleibt funktional gleich, Rahmen kommt aus dem Template.
  return (
    <PageLayout
      variant="stack"
      header={{
        align: "center",
        logo: { alt: "Esuap", size: 180 },
        title: "Profil",
        subtitle: "Deine hinterlegten Daten.",
        actions: (
          <Link to="/center" className="btn btn--ghost">
            Zur Auswahl
          </Link>
        ),
      }}
      contentWrap
      contentClassName="stack stack--lg"
      footer={<PageFooter className="page__footer--sm" />}
    >
      {error && <MessageBox tone="error">{error}</MessageBox>}
      {busy && !profile && <p className="muted">Lade Profil...</p>}
      <Card title="Profilbild aktualisieren">
        <div className="stack stack--sm">
          <label className="field">
            <span>Bilddatei auswaehlen</span>
            <input
              ref={fileInputRef}
              className="field__control"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <p className="muted">
            {selectedFile ? `Ausgewaehlt: ${selectedFile.name}` : "Noch keine Datei ausgewaehlt."}
          </p>
          {previewUrl && imageSize && (
            <div className="image-preview">
              <span className="muted">Vorschau</span>
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
              <span className="muted image-preview__hint">Ziehen, um den Ausschnitt zu verschieben.</span>
              <label className="field field--tight">
                <span>Zoom</span>
                <input
                  className="field__control image-preview__range"
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
          )}
          <MessageBox tone={uploadMessage?.tone}>{uploadMessage?.text}</MessageBox>
          <button type="button" className="btn" onClick={handleUpload} disabled={!selectedFile || uploading}>
            {uploading ? "Upload laeuft..." : "Profilbild hochladen"}
          </button>
        </div>
      </Card>
      <ProfileView profile={profile} refresh={loadProfile} />
    </PageLayout>
  );
}
