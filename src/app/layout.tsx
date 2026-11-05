import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Quiet Battles™ — Wear Your Battles",
    template: "%s — Quiet Battles™",
  },
  description:
    "Armor for the modern daily struggle. Discover Quiet Battles™ Series 01: The Gentle Armor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CartDrawer />
      </body>
    </html>
  );
}