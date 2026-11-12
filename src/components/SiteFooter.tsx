import Link from "next/link";
import { Logo } from "./Logo";
import { site } from "@/lib/site";
import { ArrowUpRight } from "lucide-react";
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="promo-container">
        <div className="footer-main">
          <div>
            <Link href="/" className="wordmark">
              <Logo className="brand-symbol" />
              <span>
                InnenFlow<span className="brand-dot">.</span>
              </span>
            </Link>
            <p>
              A quieter place to think.
              <br />A little space that belongs to you.
            </p>
            <span className="footer-origin">Thoughtfully made in India.</span>
          </div>
          <div className="footer-links">
            <span>Explore</span>
            <Link href="/features">App features</Link>
            <Link href="/download">Download for Android</Link>
            <Link href="/about">Our story</Link>
            <Link href="/support">Help & support</Link>
          </div>
          <div className="footer-links">
            <span>The important things</span>
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Terms of service</Link>
            <Link href="/delete-account">Account deletion</Link>
            <a href={site.instagram} target="_blank" rel="noopener noreferrer">
              Instagram <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} InnenFlow</p>
          <p>
            For everyday reflection. Not medical advice, treatment or emergency
            care.
          </p>
          <span>Android app · Promotional website</span>
        </div>
      </div>
    </footer>
  );
}
