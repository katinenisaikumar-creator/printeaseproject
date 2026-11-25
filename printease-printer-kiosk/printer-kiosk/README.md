# PrintEase Printer Kiosk

Standalone React + Material UI kiosk app. Runs on the PC connected to the
printer inside the college. This is **not** part of the Admin Panel — it's
its own project with its own `package.json`.

## Flow

1. **PIN screen** — user enters a 4-digit PIN.
2. On `VERIFY`, calls `POST /verify-pin`. On success, shows the print job:
   file name, pages, copies, amount, status.
3. On `PRINT`, calls `PUT /print-job/:id/complete`.
4. Shows "Printing Completed Successfully", then automatically returns to
   the PIN screen after 4 seconds.

## Project structure

```text
printer-kiosk/
├── src/
│   ├── pages/
│   │   └── Printer.jsx      # PIN entry -> job details -> success, all screens
│   ├── services/
│   │   └── api.js           # axios calls to the Express backend
│   ├── theme.js              # MUI blue kiosk theme
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and point it at your Express + PostgreSQL backend:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Run (development)

```bash
npm run dev
```

Opens at `http://localhost:5173`.

## Build for the kiosk PC (production)

```bash
npm run build
npm run preview
```

`npm run build` outputs static files to `dist/`. On the actual kiosk
machine, serve `dist/` with any static server (or `npm run preview`) and
open it full-screen in kiosk mode in the browser (e.g. Chrome
`--kiosk` flag) so students only ever see the PrintEase screen.

## Backend contract

**Verify PIN**

```
POST /verify-pin
Body:    { "pin": "1234" }
Success: { "success": true, "print_job": { id, pin, file_name, page_count, copies, total_amount, print_status } }
```

**Complete print job**

```
PUT /print-job/:id/complete
Effect: sets print_status = 'completed'
```

## Notes

- Built with Vite + React 18 + MUI 6.
- Buttons disable automatically while a request is in flight, with an
  inline loading spinner.
- Errors (wrong PIN, network issues, failed print) surface via a Snackbar
  and the PIN screen resets automatically.
- The theme lives in `src/theme.js` if you want to adjust the blue palette
  or typography later.
