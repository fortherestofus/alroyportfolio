// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://alroyndhlovu.com",
  output: "static",
  trailingSlash: "always",
  /*
   * The three product build stories moved out of /case-studies/ when
   * the sections were split by what they prove (see the `kind` note in
   * src/data/case-studies.ts). These URLs were live and linked, so they
   * keep resolving rather than 404ing. On a static build Astro emits a
   * small meta-refresh page with a canonical pointing at the target.
   */
  redirects: {
    "/case-studies/hakkan/": "/products/hakkan/",
    "/case-studies/inspiritintruth/": "/products/inspiritintruth/",
    "/case-studies/tapa/": "/products/tapa/",
  },
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: "auto",
  },
});
