import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found promo-container">
      <span className="eyebrow">LET’S FIND YOUR WAY BACK</span>
      <h1>A little off the path.</h1>
      <p>This page is not here, but your next small pause can be.</p>
      <Link href="/" className="download-button">
        Back to InnenFlow
      </Link>
      <Link href="/download" className="text-link">
        Find the Android app →
      </Link>
    </main>
  );
}
