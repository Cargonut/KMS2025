import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

type HeaderConfig = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  align?: "left" | "center";
  actions?: ReactNode;
  logo?: {
    alt?: string;
    size?: number;
    className?: string;
  };
};

type PageLayoutProps = {
  variant?: "default" | "center" | "stack";
  className?: string;
  header?: HeaderConfig;
  contentWrap?: boolean;
  contentClassName?: string;
  footer?: ReactNode;
  as?: "main" | "div";
  children: ReactNode;
};

type PageFooterProps = {
  to?: string;
  label?: string;
  className?: string;
  linkClassName?: string;
};

// Zentrales Seiten-Template fuer Header, Content und Footer.
export function PageLayout({
  variant = "default",
  className,
  header,
  contentWrap = false,
  contentClassName,
  footer,
  as: Element = "main",
  children,
}: PageLayoutProps) {
  const variantClass =
    variant === "center" ? "page-center" : variant === "stack" ? "page page-stack" : "page";
  const rootClassName = [variantClass, className].filter(Boolean).join(" ");
  const alignCenter = header?.align === "center";
  const headerClassName = ["page__header", alignCenter ? "page__header--center" : ""]
    .filter(Boolean)
    .join(" ");
  const contentClass = ["page__content", contentClassName].filter(Boolean).join(" ");
  const showHeader = Boolean(
    header?.eyebrow || header?.title || header?.subtitle || header?.actions || header?.logo,
  );

  return (
    <Element className={rootClassName}>
      {showHeader ? (
        <header className={headerClassName}>
          <div>
            {header?.eyebrow ? <p className="eyebrow">{header.eyebrow}</p> : null}
            {header?.logo ? (
              <Logo
                alt={header.logo.alt ?? "Esuap"}
                size={header.logo.size}
                className={["page__logo", header.logo.className].filter(Boolean).join(" ")}
              />
            ) : null}
            {header?.title ? <h1 className="heading heading--xl">{header.title}</h1> : null}
            {header?.subtitle ? <p className="muted">{header.subtitle}</p> : null}
          </div>
          {header?.actions ? (
            <div
              className={["session", alignCenter ? "session--center" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              {header.actions}
            </div>
          ) : null}
        </header>
      ) : null}

      {contentWrap ? <section className={contentClass}>{children}</section> : children}

      {footer}
    </Element>
  );
}

// Standard-Footer mit Impressum-Link, damit die Seiten schlank bleiben.
export function PageFooter({
  to = "/impressum",
  label = "Impressum",
  className,
  linkClassName,
}: PageFooterProps) {
  return (
    <footer className={["page__footer", className].filter(Boolean).join(" ")}>
      <Link to={to} className={["page__footer-link", linkClassName].filter(Boolean).join(" ")}>
        {label}
      </Link>
    </footer>
  );
}
