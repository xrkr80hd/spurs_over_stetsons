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
      {
        src: "/spurs-over-stetsons-logo.webp",
        sizes: "any",
        type: "image/webp",
        purpose: "any maskable",
      },
    ],
  };
}
