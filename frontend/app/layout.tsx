import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const nunito = Nunito({
    variable: "--font-nunito",
    subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Code Review",
  description: "AI Code Review Tool. Get feedback on your code from an AI.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${nunito.variable} antialiased`}>
        <div>
          <Navbar />
          <div className="flex flex-col items-center w-full p-8" aria-label="Form container">
            <div className="flex flex-col gap-4 card-holo-container container-glow w-full h-full">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
