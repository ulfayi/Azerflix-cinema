export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-background-secondary/70 py-6 text-center">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-2 px-4 text-xs text-foreground-muted sm:flex-row sm:px-6 lg:px-10">
        <span className="font-display font-semibold text-foreground-secondary">
          <span className="text-accent">Netflix</span> Azərbaycan
        </span>
        <p>Bu qeyri-rəsmi tədris layihəsidir və Netflix ilə əlaqəli deyil</p>
      </div>
    </footer>
  );
}
