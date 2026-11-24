import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site = process.env.PUBLIC_SITE_URL || "https://agentregistrar.directory";

export default defineConfig({
  site,
  output: "static",
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes("/badges/") &&
        !page.endsWith(".json") &&
        !page.endsWith(".txt"),
    }),
  ],
});
