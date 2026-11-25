import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// PrintEase Printer Kiosk - Vite config
// Runs on the PC connected to the printer inside the college.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow access from LAN if the kiosk PC is accessed remotely for setup
    port: 5174,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
