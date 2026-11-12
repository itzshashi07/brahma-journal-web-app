import Link from "next/link";
import { Mail, ArrowUpRight } from "lucide-react";
import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Help & support",
  description:
    "Help with the InnenFlow Android app, installation, account access and deletion requests.",
  path: "/support",
});
export default function SupportPage() {
  return (
    <section className="promo-container support-page">
      <span className="eyebrow">A PERSON ON THE OTHER SIDE</span>
      <h1>
        Need a hand?
        <br />
        <em>We are an email away.</em>
      </h1>
      <p>
        For installation issues, account access, a bug or a question about
        InnenFlow, contact support. Include your app version, device model and a
        short description of what happened.
      </p>
      <a
        href={`mailto:${site.contactEmail}?subject=InnenFlow%20app%20support`}
        className="support-email"
      >
        <Mail size={24} />
        <span>{site.contactEmail}</span>
        <ArrowUpRight size={20} />
      </a>
      <p className="support-note">
        Please do not email your password, payment credentials or private
        journal content. Email support is not an emergency service.
      </p>
      <div className="support-topics">
        <article>
          <h2>Installing the app</h2>
          <p>Use the official Play listing and check device compatibility.</p>
          <Link href="/download" className="text-link">
            Download help <ArrowUpRight size={16} />
          </Link>
        </article>
        <article>
          <h2>Deleting an account</h2>
          <p>Find the in-app deletion option or request help by email.</p>
          <Link href="/delete-account" className="text-link">
            Account deletion <ArrowUpRight size={16} />
          </Link>
        </article>
        <article>
          <h2>A question about privacy</h2>
          <p>Read about app data, journal privacy and optional public posts.</p>
          <Link href="/privacy" className="text-link">
            Privacy policy <ArrowUpRight size={16} />
          </Link>
        </article>
      </div>
    </section>
  );
}
