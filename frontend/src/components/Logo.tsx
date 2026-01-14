import { Link } from "react-router-dom";
import logo from "../assets/LOGO.png";

type Props = {
  alt?: string;
  className?: string;
  size?: number; // max-width in px
};

export default function Logo({ alt = "Logo", className, size = 220 }: Props) {
  const classes = ["logo", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <Link to="/" aria-label={alt}>
        <img src={logo} alt={alt} style={{ maxWidth: size, width: "100%", height: "auto" }} />
      </Link>
    </div>
  );
}
