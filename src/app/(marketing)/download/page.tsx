import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Smartphone } from "lucide-react";
import { DownloadButton } from "@/components/DownloadButton";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
export const metadata = pageMetadata({
  title: "Download InnenFlow for Android",
  description:
    "Get InnenFlow from Google Play. A private journal, meditation and daily check-ins for your Android phone. This website is promotional only.",
  path: "/download",
});
export default function DownloadPage() {
  return (
    <>
      <section className="download-page promo-container">
        <div className="download-page-copy">
          <span className="eyebrow">
            <Smartphone size={16} /> TAKE YOUR LITTLE PAUSE WITH YOU
          </span>
          <h1>
            A quieter place.
            <br />
            <em>Right on your phone.</em>
          </h1>
          <p>
            Keep your journal, take a breathing break and make a small practice
            your own. Download InnenFlow from the official Google Play listing.
          </p>
          <DownloadButton />
          <ul className="download-checklist">
            <li>
              <Check size={17} /> Free to use
            </li>
            <li>
              <Check size={17} /> For Android devices
            </li>
            <li>
              <Check size={17} /> Check device compatibility on Google Play
            </li>
          </ul>
          <p className="platform-note">
            On an iPhone? An iOS App Store release is not available at present.
            This website explains the app; it does not offer browser journaling
            or accounts.
          </p>
        </div>
        <div className="download-visual">
          <Image
            src="/icon.svg"
            alt="InnenFlow app icon"
            width={96}
            height={96}
          />
          <h2>InnenFlow</h2>
          <p>A quieter place to think</p>
          <div className="download-card-line" />
          <span>OFFICIAL ANDROID DOWNLOAD</span>
          <DownloadButton label="Open Google Play" />
          <a
            href={site.playUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="download-qr"
            aria-label="Open the official Google Play listing"
          >
            <Image
              src="/images/google-play-qr.svg"
              width={140}
              height={140}
              alt="QR code for the official InnenFlow Google Play listing"
            />
            <span>On a computer? Scan with your Android phone.</span>
          </a>
          {!site.resetReleased && (
            <p className="version-note">
              The next-update screens on this website preview version 1.8.0.
              Download the current available release from Google Play.
            </p>
          )}
        </div>
      </section>
      <section className="download-instructions">
        <div className="promo-container">
          <div>
            <span className="eyebrow">FROM DOWNLOAD TO YOUR FIRST MOMENT</span>
            <h2>
              Start small.
              <br />
              That is the whole idea.
            </h2>
          </div>
          <ol>
            {[
              ["Open Google Play", "Use the official download button above."],
              ["Install InnenFlow", "Check compatibility and tap Install."],
              [
                "Make a little space",
                "Open the app and start with a check-in, a journal entry or a breathing break.",
              ],
            ].map(([title, body], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="promo-container download-help">
        <h2>Something not working?</h2>
        <p>We will help with installing the app or finding your account.</p>
        <Link href="/support" className="text-link">
          Visit help & support <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
