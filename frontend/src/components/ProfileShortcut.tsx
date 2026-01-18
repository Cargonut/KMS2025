import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchProfile, Profile } from "../app/api";

const storageKey = "cargonaut-token";

export default function ProfileShortcut() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const loadProfile = useCallback(() => {
    let active = true;
    const stored = localStorage.getItem(storageKey);
    setToken(stored);
    if (!stored) {
      setProfile(null);
      return () => {
        active = false;
      };
    }
    fetchProfile(stored)
      .then((data) => {
        if (active) setProfile(data);
      })
      .catch(() => {
        if (active) setProfile(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => loadProfile(), [loadProfile, location.key]);
  useEffect(() => setOpen(false), [location.key]);

  useEffect(() => {
    const handleAuthChange = () => loadProfile();
    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("profile-updated", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("profile-updated", handleAuthChange);
    };
  }, [loadProfile]);

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target || !containerRef.current) return;
      if (containerRef.current.contains(target)) return;
      setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const fallback = useMemo(() => {
    if (!profile) return "Profil";
    const first = profile.first_name?.[0] ?? "";
    const last = profile.last_name?.[0] ?? "";
    const initials = `${first}${last}`.trim();
    return initials || "Profil";
  }, [profile]);

  const handleLogout = () => {
    localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event("auth-changed"));
    setToken(null);
    setProfile(null);
    setOpen(false);
    navigate("/");
  };

  if (!token) return null;

  return (
    <div className="profile-shortcut" ref={containerRef}>
      <button
        type="button"
        className="profile-shortcut__button"
        aria-label="Profilmenü öffnen"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {profile?.profile_image ? (
          <img className="profile-shortcut__image" src={profile.profile_image} alt="Profilbild" />
        ) : (
          <span className="profile-shortcut__fallback">{fallback}</span>
        )}
      </button>

      {open ? (
        <div className="profile-menu" role="menu">
          <Link
            to="/profile"
            className="profile-menu__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Profil
          </Link>
          <button
            type="button"
            className="profile-menu__item"
            role="menuitem"
            onClick={handleLogout}
          >
            Abmelden
          </button>
        </div>
      ) : null}
    </div>
  );
}
