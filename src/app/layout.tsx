import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OnMangeQuoi - Générateur de Menu Hebdomadaire",
  description: "Générez votre menu hebdomadaire et liste de courses facilement",
  icons: {
    icon: '/favicon.ico',
  },
};

function Header() {
  return (
    <header className="bg-[var(--card)] border-b border-[var(--border)] py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-[var(--primary)]">
          OnMangeQuoi
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-[var(--primary)] transition-colors">
                Accueil
              </Link>
            </li>
            <li>
              <Link href="/recipes" className="hover:text-[var(--primary)] transition-colors">
                Recettes
              </Link>
            </li>
            <li>
              <Link href="/add-recipe" className="hover:text-[var(--primary)] transition-colors">
                Ajouter une Recette
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[var(--card)] border-t border-[var(--border)] py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-[var(--foreground)] opacity-70">
          &copy; {new Date().getFullYear()} OnMangeQuoi - Générateur de Menu Hebdomadaire
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
