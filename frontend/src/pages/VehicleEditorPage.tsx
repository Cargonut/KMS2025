import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MotorType,
  UpdateVehicleInput,
  Vehicle,
  createVehicle,
  deleteVehicle,
  fetchMyVehicles,
  updateVehicle,
  uploadVehicleImage,
} from "../app/api";
import Logo from "../components/Logo";
import { PageFooter, PageLayout } from "../components/PageLayout";
import MessageBox from "../components/ui/MessageBox";

const storageKey = "cargonaut-token";

type VehicleForm = {
  name: string;
  load_area: string;
  motor_type: MotorType;
  special_features: string;
  weight: string;
  image_urls: string[];
};

const emptyForm: VehicleForm = {
  name: "",
  load_area: "",
  motor_type: "benzin",
  special_features: "",
  weight: "",
  image_urls: [],
};

export default function VehicleEditorPage() {
  const [token, setToken] = useState(() => localStorage.getItem(storageKey) || "");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [message, setMessage] = useState<{ tone: "success" | "error" | "info"; text: string }>();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

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
        if (data.length === 0) {
          setSelectedVehicleId(null);
          return;
        }
        setSelectedVehicleId((current) => current ?? data[0]?.id ?? null);
      })
      .catch((err: Error) => setMessage({ tone: "error", text: err.message }));
  }, [token]);

  useEffect(() => {
    refreshVehicles();
  }, [refreshVehicles]);

  const selectedVehicle = useMemo(
    () => vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null,
    [selectedVehicleId, vehicles],
  );

  useEffect(() => {
    if (!selectedVehicle) {
      setForm(emptyForm);
      return;
    }
    setForm({
      name: selectedVehicle.name ?? "",
      load_area: selectedVehicle.load_area ? String(selectedVehicle.load_area) : "",
      motor_type: selectedVehicle.motor_type ?? "benzin",
      special_features: selectedVehicle.special_features ?? "",
      weight: selectedVehicle.weight ? String(selectedVehicle.weight) : "",
      image_urls: selectedVehicle.image_urls ?? [],
    });
  }, [selectedVehicle]);

  const handleChange = (name: keyof VehicleForm, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(undefined);
    try {
      const urls = await Promise.all(Array.from(files).map((file) => uploadVehicleImage(file)));
      setForm((prev) => ({ ...prev, image_urls: [...prev.image_urls, ...urls] }));
    } catch (err) {
      const text = err instanceof Error ? err.message : "Upload fehlgeschlagen.";
      setMessage({ tone: "error", text });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setForm((prev) => ({ ...prev, image_urls: prev.image_urls.filter((item) => item !== url) }));
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
      const name = form.name.trim();
      const normalizedLoadArea = form.load_area.replace(",", ".").trim();
      const loadArea = Number(normalizedLoadArea);
      const weight = form.weight ? Number(form.weight) : undefined;
      if (!name) {
        throw new Error("Bitte einen Namen fuer das Fahrzeug angeben.");
      }
      if (!normalizedLoadArea || Number.isNaN(loadArea) || loadArea <= 0) {
        throw new Error("Bitte eine gueltige Ladeflaeche angeben.");
      }

      const payload: UpdateVehicleInput = {
        name,
        load_area: loadArea,
        motor_type: form.motor_type,
        special_features: form.special_features || null,
        weight: weight ?? null,
        image_urls: form.image_urls,
      };

      if (selectedVehicleId) {
        await updateVehicle(selectedVehicleId, payload, token);
        setMessage({ tone: "success", text: "Fahrzeug aktualisiert." });
      } else {
        await createVehicle(
          {
            name,
            load_area: payload.load_area || 0,
            motor_type: payload.motor_type || "benzin",
            special_features: payload.special_features,
            weight: payload.weight ?? undefined,
            image_urls: payload.image_urls ?? [],
          },
          token,
        );
        setMessage({ tone: "success", text: "Fahrzeug gespeichert." });
        setSelectedVehicleId(null);
      }

      refreshVehicles();
      window.dispatchEvent(new Event("vehicles-changed"));
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unbekannter Fehler.";
      setMessage({ tone: "error", text });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !selectedVehicleId) return;
    setBusy(true);
    setMessage(undefined);
    try {
      await deleteVehicle(selectedVehicleId, token);
      setSelectedVehicleId(null);
      setMessage({ tone: "success", text: "Fahrzeug entfernt." });
      refreshVehicles();
      window.dispatchEvent(new Event("vehicles-changed"));
    } catch (err) {
      const text = err instanceof Error ? err.message : "Unbekannter Fehler.";
      setMessage({ tone: "error", text });
    } finally {
      setBusy(false);
    }
  };

  const handleNew = () => {
    setSelectedVehicleId(null);
    setForm(emptyForm);
    setMessage(undefined);
  };

  return (
    <PageLayout variant="center" className="page-theme page-theme--driver">
      <section className="vehicle-editor__panel stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />
        <div className="vehicle-editor__card stack stack--lg">
          <div className="vehicle-editor__toolbar">
            <button type="button" className="vehicle-editor__new" onClick={handleNew} aria-label="Neues Fahrzeug">
              +
            </button>
            <div>
              <p className="vehicle-editor__title">FAHRZEUGE</p>
              <span className="vehicle-editor__divider" aria-hidden="true" />
              <p className="vehicle-editor__subtitle">Erstelle oder bearbeite dein Fahrzeug</p>
            </div>
          </div>

          <form className="vehicle-editor__form" onSubmit={handleSubmit}>
            <label className="vehicle-editor__field">
              <span>Name</span>
              <input
                className="vehicle-editor__input"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder="VW Bus '89"
              />
            </label>

            <div className="vehicle-editor__image-row">
              <div className="vehicle-editor__image-preview">
                {form.image_urls[0] ? (
                  <img src={form.image_urls[0]} alt="Fahrzeug" />
                ) : (
                  <span>Kein Bild</span>
                )}
              </div>
              <label className="vehicle-editor__image-add">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleUpload(event.target.files)}
                  disabled={uploading}
                />
                <span>+</span>
              </label>
            </div>

            {form.image_urls.length > 1 ? (
              <div className="vehicle-editor__thumbs">
                {form.image_urls.slice(1).map((url) => (
                  <button
                    key={url}
                    type="button"
                    className="vehicle-editor__thumb"
                    onClick={() => removeImage(url)}
                  >
                    <img src={url} alt="Fahrzeug" />
                    <span className="vehicle-editor__thumb-remove">x</span>
                  </button>
                ))}
              </div>
            ) : null}

            <label className="vehicle-editor__field">
              <span>Ladeflaeche (m2)</span>
              <input
                className="vehicle-editor__input"
                type="number"
                min="0"
                step="0.1"
                value={form.load_area}
                onChange={(event) => handleChange("load_area", event.target.value)}
              />
            </label>

            <label className="vehicle-editor__field">
              <span>Motortyp</span>
              <select
                className="vehicle-editor__input"
                value={form.motor_type}
                onChange={(event) => handleChange("motor_type", event.target.value)}
              >
                <option value="benzin">Benzin</option>
                <option value="diesel">Diesel</option>
                <option value="hybrid">Hybrid</option>
                <option value="elektro">Elektro</option>
                <option value="gas">Gas</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </label>

            <label className="vehicle-editor__field">
              <span>Max. Zuladung (kg)</span>
              <input
                className="vehicle-editor__input"
                type="number"
                min="0"
                step="0.1"
                value={form.weight}
                onChange={(event) => handleChange("weight", event.target.value)}
              />
            </label>

            <label className="vehicle-editor__field">
              <span>Besonderheiten</span>
              <textarea
                className="vehicle-editor__textarea"
                rows={4}
                value={form.special_features}
                onChange={(event) => handleChange("special_features", event.target.value)}
                placeholder="z. B. Klima, Rampe, Gurte"
              />
            </label>

            <MessageBox tone={message?.tone}>{message?.text}</MessageBox>

            <div className="vehicle-editor__actions">
              <button type="submit" className="vehicle-editor__cta" disabled={busy || uploading || !token}>
                {busy ? "Speichern..." : "Fahrzeug speichern"}
              </button>
              {selectedVehicleId ? (
                <button type="button" className="vehicle-editor__delete" onClick={handleDelete} disabled={busy}>
                  Fahrzeug loeschen
                </button>
              ) : null}
            </div>
          </form>
        </div>

        {!token ? (
          <div className="vehicle-editor__notice">
            <p>Bitte einloggen, um Fahrzeuge zu verwalten.</p>
            <Link to="/login" className="vehicle-editor__cta vehicle-editor__cta--ghost">
              Zum Login
            </Link>
          </div>
        ) : null}

        <PageFooter className="page__footer--sm page__footer--inverse" />
      </section>
    </PageLayout>
  );
}
