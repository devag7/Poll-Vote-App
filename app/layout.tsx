import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Poll & Voting App",
  description: "Create polls, vote, and track live results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
