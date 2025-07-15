import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Geek Glossary",
  description: "Glosario geek con definiciones y productos recomendados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} bg-gray-900 text-gray-100`}
      >
        <header className="bg-gray-800 text-white p-4 shadow-lg">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-3xl font-extrabold text-purple-400 hover:text-purple-300 transition-colors duration-300">
              Geek Glossary
            </Link>
          </nav>
        </header>
        <main className="container mx-auto p-6 bg-gray-800 rounded-lg shadow-xl my-8">
          {children}
        </main>
      </body>
    </html>
  );
}
