import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  'upgrade-insecure-requests',
].join('; ');

// Vite's dev server injects inline scripts for HMR, so the policy is only
// applied to production builds. `frame-ancestors` is omitted because browsers
// ignore it when a policy is delivered through a meta element; clickjacking
// protection has to come from a response header at the host.
function securityHeaders(): Plugin {
  return {
    name: 'oei-security-headers',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: contentSecurityPolicy },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [react(), securityHeaders()],
});
