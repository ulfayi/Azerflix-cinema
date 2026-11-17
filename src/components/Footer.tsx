import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-background-secondary/80 py-6 text-center transition-colors">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-4 text-xs text-foreground-muted sm:flex-row sm:px-6 lg:px-10">
        <BrandLogo size="sm" />
        <p>Bu qeyri-rəsmi tədris layihəsidir və Netflix ilə əlaqəli deyil</p>
      </div>
    </footer>
  );
}
