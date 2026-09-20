import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "Spurs Over Stetsons", template: "%s | Spurs Over Stetsons" },
  description: "Country dance instruction and dance-floor experiences coming soon to Alexandria, Louisiana.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
