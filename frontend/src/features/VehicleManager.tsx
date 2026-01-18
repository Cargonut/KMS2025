import { FormEvent, useState } from "react";
import { MotorType, Vehicle, createVehicle, deleteVehicle, uploadVehicleImage } from "../app/api";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import MessageBox from "../components/ui/MessageBox";
import type { Message } from "./types";

type VehicleForm = {
  name: string;
  load_area: string;
  motor_type: MotorType;
  special_features: string;
  weight: string;
  dimensions: string;
  image_urls: string[];
};

const initialVehicle: VehicleForm = {
  name: "",
  load_area: "",
  motor_type: "benzin",
  special_features: "",
  weight: "",
  dimensions: "",
  image_urls: [],
};

type VehicleManagerProps = {
  token: string;
  vehicles: Vehicle[];
  onRefresh: () => void;
};

export default function VehicleManager({ token, vehicles, onRefresh }: VehicleManagerProps) {
  const [form, setForm] = useState<VehicleForm>(initialVehicle);
  const [message, setMessage] = useState<Message>();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const motorLabels: Record<MotorType, string> = {
    benzin: "Benzin",
    diesel: "Diesel",
    hybrid: "Hybrid",
    elektro: "Elektro",
    gas: "Gas",
    sonstiges: "Sonstiges",
  };

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMotorChange = (value: MotorType) =>
    setForm((prev) => ({ ...prev, motor_type: value }));

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(undefined);
    try {
      const urls = await Promise.all(Array.from(files).map((file) => uploadVehicleImage(file)));
      setForm((prev) => ({ ...prev, image_urls: [...(prev.image_urls || []), ...urls] }));
    } catch (err) {
      const text = err instanceof Error ? err.message : "Upload fehlgeschlagen.";
      setMessage({ tone: "error", text });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setForm((prev) => ({
      ...prev,
      image_urls: (prev.image_urls || []).filter((item) => item !== url),
    }));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setMessage(undefined);
    try {
      const loadArea = Number(form.load_area);
      const weight = form.weight ? Number(form.weight) : undefined;
      if (!form.name || Number.isNaN(loadArea) || loadArea <= 0) {
        throw new Error("Bitte Name und Ladefläche angeben.");
      }
      await createVehicle(
        {
          name: form.name,
          load_area: loadArea,
          motor_type: form.motor_type,
          special_features: form.special_features || null,
          dimensions: form.dimensions || null,
          weight,
          image_urls: form.image_urls || [],
        },
        token,
      );
      setMessage({ tone: "success", text: "Fahrzeug gespeichert." });
      setForm(initialVehicle);
      onRefresh();
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unbekannter Fehler";
      setMessage({ tone: "error", text });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number | undefined) => {
    if (!id) return;
    setBusy(true);
    setMessage(undefined);
    try {
      await deleteVehicle(id, token);
      setMessage({ tone: "success", text: "Fahrzeug entfernt." });
      onRefresh();
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unbekannter Fehler";
      setMessage({ tone: "error", text });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Fahrzeugverwaltung">
      <form className="stack" onSubmit={submit}>
        <Field
          label="Fahrzeugname"
          name="name"
          required
          value={form.name}
          onChange={handleChange}
        />
        <div className="grid grid--two">
          <label className="field">
            <span>Ladefläche (m²)</span>
            <input
              className="field__control"
              name="load_area"
              type="number"
              min="0"
              step="0.1"
              required
              value={form.load_area}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            />
          </label>
          <label className="field">
            <span>Motortyp</span>
            <select
              className="field__control"
              name="motor_type"
              value={form.motor_type}
              onChange={(e) => handleMotorChange(e.target.value as MotorType)}
            >
              <option value="benzin">Benzin</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="elektro">Elektro</option>
              <option value="gas">Gas</option>
              <option value="sonstiges">Sonstiges</option>
            </select>
          </label>
        </div>
        <div className="grid grid--two">
          <label className="field">
            <span>Max. Zuladung (kg)</span>
            <input
              className="field__control"
              name="weight"
              type="number"
              min="0"
              step="0.1"
              value={form.weight}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            />
          </label>
          <Field
            label="Abmessungen (optional)"
            name="dimensions"
            value={form.dimensions || ""}
            onChange={handleChange}
            placeholder="z. B. 2.3m x 1.7m"
          />
        </div>
        <label className="field">
          <span>Besonderheiten</span>
          <textarea
            className="field__control"
            name="special_features"
            value={form.special_features || ""}
            onChange={(e) => handleChange(e.target.name, e.target.value)}
            rows={3}
            placeholder="z. B. Gurte, Rampe, Kühlung"
          />
        </label>
        <label className="field">
          <span>Fahrzeugbilder hochladen</span>
          <input
            className="field__control"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleUpload(e.target.files)}
          />
          {uploading && <span className="muted">Upload läuft...</span>}
        </label>
        {form.image_urls && form.image_urls.length > 0 && (
          <div className="vehicle__images">
            {form.image_urls.map((url) => (
              <div key={url} className="vehicle__image">
                <img className="vehicle__image-preview" src={url} alt="Fahrzeugbild" />
                <button type="button" className="btn btn--ghost" onClick={() => removeImage(url)}>
                  Entfernen
                </button>
              </div>
            ))}
          </div>
        )}
        <MessageBox tone={message?.tone}>{message?.text}</MessageBox>
        <button type="submit" className="btn" disabled={busy || uploading}>
          {busy ? "Speichern..." : "Fahrzeug speichern"}
        </button>
      </form>
      <div className="vehicle__list">
        <h3>Deine Fahrzeuge</h3>
        {vehicles.length === 0 ? (
          <p className="muted">Noch kein Fahrzeug hinterlegt.</p>
        ) : (
          <div className="vehicle__grid">
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="vehicle__card">
                <div className="vehicle__card-header">
                  <strong>{vehicle.name}</strong>
                  {vehicle.id ? (
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => handleDelete(vehicle.id)}
                      disabled={busy}
                    >
                      Löschen
                    </button>
                  ) : null}
                </div>
                <p className="muted">Ladefläche: {vehicle.load_area ?? "k.A."} m²</p>
                <p className="muted">
                  Motor: {vehicle.motor_type ? motorLabels[vehicle.motor_type] : "k.A."}
                </p>
                {vehicle.special_features && <p>{vehicle.special_features}</p>}
                {vehicle.image_urls && vehicle.image_urls.length > 0 && (
                  <div className="vehicle__thumbs">
                    {vehicle.image_urls.map((url) => (
                      <img key={url} className="vehicle__thumb" src={url} alt="Fahrzeug" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
