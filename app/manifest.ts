import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Spurs Over Stetsons Dance Hall",
    short_name: "Spurs Over Stetsons",
    description: "Country dance instruction and dance-floor experiences in Alexandria, Louisiana.",
    start_url: "/",
    display: "standalone",
    background_color: "#0d0c0a",
    theme_color: "#0d0c0a",
    icons: [
      { src: "/icons/spurs-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/spurs-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
