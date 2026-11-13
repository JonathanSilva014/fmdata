import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Letra dos títulos: Archivo larga (eixo wdth) e itálica. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "fmdata | Music Analytics",
  description:
    "Dashboard de estatísticas musicais com dados do Last.fm.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-fundo text-texto">
        <Header />

        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-rodape text-sm text-white/75">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6 px-4 py-8 sm:px-6">
            <div>
              <p className="font-display text-lg font-black italic text-white [font-stretch:125%]">fmdata.</p>
              <p className="mt-1">Projeto final de frontend</p>
            </div>
            <div>
              <p>Dados: Last.fm, através da API fmdata</p>
              <p className="mt-1">Fotos de artistas: Wikimedia Commons</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
