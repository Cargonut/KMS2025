import { FormEvent, useEffect, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import { SignupInput, calculateAge, uploadProfileImage } from "../app/api";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import MessageBox from "../components/ui/MessageBox";
import type { Message } from "./types";

export type SignupFormData = SignupInput & { emailConfirm: string };

export const getSignupValidationError = (form: SignupFormData): string | null => {
  if (form.email !== form.emailConfirm) {
    return "E-Mail und Bestätigung stimmen nicht überein.";
  }
  const age = calculateAge(form.birth_date);
  if (age === null || age < 18) {
    return "Du musst mindestens 18 Jahre alt sein.";
  }
  return null;
};

export const toSignupInput = (form: SignupFormData): SignupInput => ({
  first_name: form.first_name,
  last_name: form.last_name,
  email: form.email,
  password: form.password,
  birth_date: new Date(form.birth_date).toISOString(),
  phone: form.phone || null,
  profile_image: form.profile_image || null,
  additional_note: form.additional_note || null,
});

const initialSignup: SignupFormData = {
  first_name: "",
  last_name: "",
  email: "",
  emailConfirm: "",
  password: "",
  birth_date: "",
  phone: "",
  profile_image: "",
  additional_note: "",
};

const previewSize = 140;
const outputSize = 512;

type SignupFormProps = {
  onSubmit: (data: SignupFormData, reset: () => void) => void;
  busy: boolean;
  message?: Message;
};

export default function SignupForm({ onSubmit, busy, message }: SignupFormProps) {
  const [form, setForm] = useState<SignupFormData>(initialSignup);
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
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<Message>();

  const handleChange = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(form, () => {
      setForm(initialSignup);
      clearSelectedFile();
    });
  };

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

  const clearSelectedFile = (clearMessage = true) => {
    setSelectedFile(null);
    if (clearMessage) {
      setUploadMessage(undefined);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    if (!selectedFile) return;
    setUploading(true);
    setUploadMessage(undefined);
    try {
      const croppedFile = await buildCroppedFile();
      if (!croppedFile) return;
      const imageUrl = await uploadProfileImage(croppedFile);
      setForm((prev) => ({ ...prev, profile_image: imageUrl }));
      setUploadMessage({ tone: "success", text: "Profilbild gespeichert." });
      clearSelectedFile(false);
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unbekannter Fehler";
      setUploadMessage({ tone: "error", text });
    } finally {
      setUploading(false);
    }
  };

  const zoomMax = Math.max(minZoom * 3, minZoom + 0.5);

  return (
    <Card title="Registrieren">
      <form className="stack" onSubmit={submit}>
        <div className="grid grid--two">
          <Field
            label="Vorname"
            name="first_name"
            required
            value={form.first_name}
            onChange={handleChange}
          />
          <Field
            label="Nachname"
            name="last_name"
            required
            value={form.last_name}
            onChange={handleChange}
          />
        </div>
        <div className="grid grid--two">
          <Field
            label="E-Mail"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />
          <Field
            label="E-Mail bestätigen"
            name="emailConfirm"
            type="email"
            required
            value={form.emailConfirm}
            onChange={handleChange}
          />
        </div>
        <Field
          label="Passwort"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
        />
        <Field
          label="Geburtstag"
          name="birth_date"
          type="date"
          required
          value={form.birth_date}
          onChange={handleChange}
        />
        <div className="grid grid--two">
          <Field
            label="Handynummer (intern)"
            name="phone"
            value={form.phone || ""}
            onChange={handleChange}
            placeholder="optional, später verpflichtend für Angebote"
          />
          <div className="stack stack--sm">
            <label className="field">
              <span>Profilbild</span>
              <input
                ref={fileInputRef}
                className="field__control"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            {!previewUrl && form.profile_image ? (
              <div className="profile__avatar" aria-label="Profilbild Vorschau">
                <img className="profile__avatar-image" src={form.profile_image} alt="Profilbild" />
              </div>
            ) : null}
          </div>
        </div>
        {previewUrl && imageSize ? (
          <div className="image-preview">
            <span className="muted">Bild zuschneiden</span>
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
            <label className="field">
              <span>Zoom</span>
              <input
                className="image-preview__range"
                type="range"
                min={minZoom}
                max={zoomMax}
                step={0.01}
                value={zoom}
                onChange={handleZoomChange}
                disabled={!imageSize}
              />
            </label>
            <div className="grid grid--two">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={clearSelectedFile}
                disabled={uploading}
              >
                Bild verwerfen
              </button>
              <button type="button" className="btn" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Upload läuft..." : "Profilbild speichern"}
              </button>
            </div>
          </div>
        ) : null}
        {uploadMessage ? (
          <MessageBox tone={uploadMessage.tone}>{uploadMessage.text}</MessageBox>
        ) : null}
        <label className="field">
          <span>Notiz</span>
          <textarea
            className="field__control"
            name="additional_note"
            value={form.additional_note || ""}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            rows={3}
            placeholder="Hinweise für Mitfahrer*innen"
          />
        </label>
        <MessageBox tone={message?.tone}>{message?.text}</MessageBox>
        <button type="submit" className="btn" disabled={busy || uploading}>
          {busy ? "Wird gesendet..." : "Registrieren"}
        </button>
      </form>
    </Card>
  );
}
