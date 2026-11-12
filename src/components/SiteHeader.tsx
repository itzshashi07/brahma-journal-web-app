"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { DownloadButton } from "./DownloadButton";
const links = [
  { href: "/features", label: "The app" },
  { href: "/moments", label: "Your kind of day" },
  { href: "/inside", label: "A look inside" },
  { href: "/#relatable", label: "Too relatable" },
];
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  return (
    <header className="site-header">
      <div className="promo-container header-inner">
        <Link href="/" className="wordmark" aria-label="InnenFlow home">
          <Logo className="brand-symbol" />
          <span>
            InnenFlow<span className="brand-dot">.</span>
          </span>
        </Link>
        <nav className="desktop-navigation" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <DownloadButton compact label="Download app" />
          <button
            ref={toggle}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="mobile-navigation"
          aria-label="Mobile navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
              <ArrowUpRight size={16} />
            </Link>
          ))}
          <Link href="/support" onClick={() => setOpen(false)}>
            Help & support
            <ArrowUpRight size={16} />
          </Link>
        </nav>
      )}
    </header>
  );
}
