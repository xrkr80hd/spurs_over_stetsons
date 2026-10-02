import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "Spurs Over Stetsons", template: "%s | Spurs Over Stetsons" },
  description: "Country dance instruction and dance-floor experiences coming soon to Alexandria, Louisiana.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icons/spurs-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/spurs-180.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Spurs Over Stetsons",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
