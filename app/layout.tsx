import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "EventFlow — Discover, organize and run better events",
    template: "%s | EventFlow",
  },
  description:
    "Event discovery, digital ticketing, UddoktaPay checkout, organizer operations, staff check-in and event analytics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
