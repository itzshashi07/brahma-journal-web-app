import { site } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({
  title: "Delete your InnenFlow account",
  description:
    "How to delete your InnenFlow account inside the Android app or request account-deletion help by email.",
  path: "/delete-account",
});
export default function DeleteAccountPage() {
  return (
    <article className="legal-document promo-container">
      <span className="eyebrow">YOUR ACCOUNT, YOUR CHOICE</span>
      <h1>Account deletion</h1>
      <p className="legal-summary">
        You can delete your account from the InnenFlow Android app. You do not
        need to sign in on this website.
      </p>
      <h2>From the Android app</h2>
      <ol>
        <li>Open InnenFlow and sign in to your account.</li>
        <li>Open Profile and select “Delete my account”.</li>
        <li>Read the confirmation carefully and follow the instructions.</li>
      </ol>
      <h2>If you cannot access the app</h2>
      <p>
        Email{" "}
        <a
          href={`mailto:${site.contactEmail}?subject=InnenFlow%20account%20deletion`}
        >
          {site.contactEmail}
        </a>{" "}
        with the subject “InnenFlow account deletion”. Use the email address
        associated with your account. We may need to verify account ownership
        before acting on a request. Do not send your password.
      </p>
      <h2>What deletion covers</h2>
      <p>
        See the account-deletion and retention sections of the{" "}
        <a href="/privacy">privacy policy</a> for the application data removed
        and the records that may be retained. This page does not itself delete
        an account.
      </p>
    </article>
  );
}
