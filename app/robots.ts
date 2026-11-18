import type { MetadataRoute } from "next";

// Every page is either a sign-in screen or behind authentication, so nothing should be crawled.
// There is deliberately no sitemap.xml, llms.txt or structured data: there is no public content.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
