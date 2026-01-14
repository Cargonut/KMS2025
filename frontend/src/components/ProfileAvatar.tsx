import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchProfile, Profile } from "../app/api";

const storageKey = "cargonaut-token";

type ProfileAvatarProps = {
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
  fallbackText?: string;
  label?: string;
};

export default function ProfileAvatar({
  className,
  imageClassName = "avatar-image",
  fallbackClassName,
  fallbackText,
  label = "Profilbild",
}: ProfileAvatarProps) {
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(() => {
    let active = true;
    const stored = localStorage.getItem(storageKey);
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

  useEffect(() => loadProfile(), [loadProfile]);

  useEffect(() => {
    const handleProfileChange = () => loadProfile();
    window.addEventListener("auth-changed", handleProfileChange);
    window.addEventListener("profile-updated", handleProfileChange);
    return () => {
      window.removeEventListener("auth-changed", handleProfileChange);
      window.removeEventListener("profile-updated", handleProfileChange);
    };
  }, [loadProfile]);

  const fallback = useMemo(() => {
    if (fallbackText) return fallbackText;
    if (!profile) return "Profil";
    const first = profile.first_name?.[0] ?? "";
    const last = profile.last_name?.[0] ?? "";
    const initials = `${first}${last}`.trim();
    return initials || "Profil";
  }, [fallbackText, profile]);

  return (
    <div className={className} aria-label={label}>
      {profile?.profile_image ? (
        <img className={imageClassName} src={profile.profile_image} alt={label} />
      ) : (
        <span className={fallbackClassName}>{fallback}</span>
      )}
    </div>
  );
}
