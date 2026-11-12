import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
