import type { Metadata } from "next";
import "@/app/globals.css";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Daily Coffee Manager",
  description: "Sabah toplantısına gelmeyenler kahve borçlarını ödemeliler."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <header className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                ☕ Daily Coffee Manager
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Sabah toplantısına gelmeyenler kahve borçlarını ödemeliler.
              </p>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 pb-6">{children}</main>
          <footer className="mt-auto border-t border-border pt-4 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>&copy; {new Date().getFullYear()} Daily Coffee Manager</span>
              <span>Powered by bodesere</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

