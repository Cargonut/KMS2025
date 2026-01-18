import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isValidPlzInput, normalizePlzInput } from "../app/plz";
import Logo from "../components/Logo";
import ProfileAvatar from "../components/ProfileAvatar";
import { PageFooter, PageLayout } from "../components/PageLayout";
import MessageBox from "../components/ui/MessageBox";
import usePlzSuggestions from "../hooks/usePlzSuggestions";

export default function DriverMenuPage() {
  const navigate = useNavigate();
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const fromSuggestions = usePlzSuggestions(fromInput);
  const toSuggestions = usePlzSuggestions(toInput);
  const offerHref = useMemo(() => {
    const params = new URLSearchParams();
    const fromValue = normalizePlzInput(fromInput);
    const toValue = normalizePlzInput(toInput);
    if (fromValue) {
      params.set("from", fromValue);
    }
    if (toValue) {
      params.set("to", toValue);
    }
    const query = params.toString();
    return query ? `/trip-publication?${query}` : "/trip-publication";
  }, [fromInput, toInput]);

  const handleOffer = async () => {
    setInputError(null);
    const fromValue = normalizePlzInput(fromInput);
    const toValue = normalizePlzInput(toInput);
    if (!fromValue || !toValue) {
      setInputError("Bitte Von und Nach als PLZ + Stadt angeben.");
      return;
    }
    try {
      const [fromValid, toValid] = await Promise.all([
        isValidPlzInput(fromValue),
        isValidPlzInput(toValue),
      ]);
      if (!fromValid || !toValid) {
        setInputError("Bitte PLZ und Stadt aus der Liste wählen.");
        return;
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : "PLZ-Daten konnten nicht geladen werden.";
      setInputError(text);
      return;
    }
    navigate(offerHref);
  };

  const selectFrom = (value: string) => {
    setFromInput(normalizePlzInput(value));
    setInputError(null);
  };

  const selectTo = (value: string) => {
    setToInput(normalizePlzInput(value));
    setInputError(null);
  };

  // Fahrer-Ansicht nutzt das gemeinsame Template.
  return (
    <PageLayout variant="center" className="page-theme page-theme--driver">
      <section className="driver-menu__panel stack stack--lg">
        <Logo alt="Esuap" size={180} className="page__logo" />
        <div className="driver-menu__card stack stack--xl">
          <ProfileAvatar
            className="driver-menu__avatar"
            fallbackClassName="driver-menu__avatar-text"
            fallbackText="Profilbild"
            label="Profilbild"
          />

          <div className="driver-menu__offer stack stack--sm">
            <p className="driver-menu__offer-title">Fahrt anbieten</p>
            <span className="driver-menu__offer-divider" aria-hidden="true" />

            <div className="stack stack--xs plz-field">
              <p className="driver-menu__field-label">VON</p>
              <div className="driver-menu__field-box">
                <input
                  className="driver-menu__input"
                  type="text"
                  placeholder="PLZ Stadt eingeben"
                  value={fromInput}
                  onChange={(event) => {
                    setFromInput(event.target.value);
                    setInputError(null);
                  }}
                />
              </div>
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
            </div>

            <div className="stack stack--xs plz-field">
              <p className="driver-menu__field-label">NACH</p>
              <div className="driver-menu__field-box">
                <input
                  className="driver-menu__input"
                  type="text"
                  placeholder="PLZ Stadt eingeben"
                  value={toInput}
                  onChange={(event) => {
                    setToInput(event.target.value);
                    setInputError(null);
                  }}
                />
              </div>
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
            </div>

            {inputError ? <MessageBox tone="error">{inputError}</MessageBox> : null}

            <button type="button" className="driver-menu__cta" onClick={handleOffer}>
              Fahrt anbieten
            </button>
          </div>

          <div className="stack stack--sm">
            <Link to="/my-trips" className="driver-menu__link">
              Meine Fahrten
            </Link>
            <Link to="/vehicles" className="driver-menu__link">
              Fahrzeuge
            </Link>
          </div>
        </div>

        <PageFooter className="page__footer--sm" />
      </section>
    </PageLayout>
  );
}
