import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WanderAI — AI Trip Planner",
  description: "Plan your perfect trip with AI-powered itineraries, budgets, and recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
