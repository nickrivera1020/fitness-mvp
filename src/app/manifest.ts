import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ember — learn fitness, build habits",
    short_name: "Ember",
    description:
      "Short lessons and real-world challenges for fitness beginners.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf9f7",
    theme_color: "#e85d1f",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
