import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchProfile, Profile } from "../app/api";

const storageKey = "cargonaut-token";

export default function ProfileShortcut() {
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);

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

  useEffect(() => {
    const handleAuthChange = () => loadProfile();
    window.addEventListener("auth-changed", handleAuthChange);
    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, [loadProfile]);

  const fallback = useMemo(() => {
    if (!profile) return "Profil";
    const first = profile.first_name?.[0] ?? "";
    const last = profile.last_name?.[0] ?? "";
    const initials = `${first}${last}`.trim();
    return initials || "Profil";
  }, [profile]);

  if (!token) return null;

  return (
    <Link to="/profile" className="profile-shortcut" aria-label="Zum Profil">
      {profile?.profile_image ? (
        <img className="profile-shortcut__image" src={profile.profile_image} alt="Profilbild" />
      ) : (
        <span className="profile-shortcut__fallback">{fallback}</span>
      )}
    </Link>
  );
}
