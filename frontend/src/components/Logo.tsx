import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/LOGO.png";

type Props = {
  alt?: string;
  className?: string;
  size?: number; // max-width in px
};

const storageKey = "cargonaut-token";

export default function Logo({ alt = "Logo", className, size = 220 }: Props) {
  const classes = ["logo", className].filter(Boolean).join(" ");
  const [token, setToken] = useState(() => localStorage.getItem(storageKey) || "");

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem(storageKey) || "");
    };
    window.addEventListener("auth-changed", handleAuthChange);
    return () => window.removeEventListener("auth-changed", handleAuthChange);
  }, []);

  const target = token ? "/center" : "/";

  return (
    <div className={classes}>
      <Link to={target} className="logo__link" aria-label={alt}>
        <img className="logo__image" src={logo} alt={alt} style={{ maxWidth: size }} />
      </Link>
    </div>
  );
}
