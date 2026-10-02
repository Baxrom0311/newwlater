import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // These packages resolve worker scripts / native binaries via real __dirname
  // and must run as native require() rather than being bundled by Turbopack
  // (otherwise e.g. tesseract's worker path is inlined as a nonexistent
  // "/ROOT/..." string at runtime).
  serverExternalPackages: [
    'tesseract.js',
    'pdf-parse',
    'pdfjs-dist',
    '@napi-rs/canvas',
    'pdf-lib',
    '@pdf-lib/fontkit',
  ],
  // Ensure the Unicode font used for scanned-PDF text is traced into the
  // standalone output for the convert route.
  outputFileTracingIncludes: {
    '/api/convert': ['./public/fonts/**'],
  },
};

export default nextConfig;
