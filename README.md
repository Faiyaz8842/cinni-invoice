# Commercial Invoice Generator

A single-page tool for creating export commercial invoices with your company
details, GST/IEC info, buyer details, and multi-currency totals (USD, EUR,
GBP, CAD, AUD alongside INR). Fill the form, watch the live preview update,
then click **Generate & Download PDF**.

## Deploy to Vercel (no build step needed)

**Option A — Vercel dashboard (easiest)**
1. Go to https://vercel.com/new
2. Choose "Deploy without Git" / drag-and-drop, and drag this folder
   (or just the `index.html` file) into the upload area.
3. Click Deploy. Vercel will host it as a static site — done.

**Option B — Vercel CLI**
```bash
npm i -g vercel
cd invoice-app
vercel
```
Follow the prompts (any defaults are fine — it's a static file, no framework).

**Option C — GitHub**
1. Push this folder to a GitHub repo.
2. In Vercel, "Add New Project" → import the repo.
3. Framework preset: "Other" / static. No build command needed. Deploy.

## Sync invoices to Google Sheets (recommended)

Local browser storage can be cleared by your browser or OS. For a
permanent, cross-device record of every invoice, connect the tool to a
Google Sheet:

1. Open (or create) the Google Sheet you want invoices logged to.
2. In the Sheet, click **Extensions → Apps Script**.
3. Delete any starter code, and paste in the entire contents of
   `google-apps-script.gs` (included in this download).
4. Click the save icon, then **Deploy → New deployment**.
5. Click the gear icon next to "Select type" → choose **Web app**.
6. Set **Execute as: Me**, **Who has access: Anyone**, then **Deploy**.
7. Authorize when prompted (Advanced → Go to [project name] → Allow —
   safe, since it's your own script).
8. Copy the Web app URL (ends in `/exec`).
9. This is already wired in for you — the tool has your Web App URL built
   in as `DEFAULT_GSHEET_URL` near the top of the `<script>` in
   `index.html`. Every invoice now syncs to your Google Sheet silently in
   the background — there's no visible field or button for it in the
   interface, it just happens automatically on every "Generate & Download
   PDF". To confirm it's working, generate an invoice and check your
   sheet for the new row. If you ever redeploy the Apps Script (which
   generates a new URL), update `DEFAULT_GSHEET_URL` in `index.html`.

From then on, every time you click **Generate & Download PDF**, that
invoice's details are also written as a row in your Google Sheet
automatically — re-generating the same invoice number updates its existing
row instead of duplicating it. This works independently of local browser
storage, so it survives restarts, browser changes, and even switching
computers.

## Deploy to bill.cinniinternational.com

Since your main site (cinniinternational.com) is built with Lovable, keep
this tool as a **separate, independent Vercel project** rather than adding
it into the Lovable codebase — that way future Lovable edits can never
overwrite or interfere with it.

**1. Deploy this folder as its own Vercel project**
- Go to https://vercel.com/new
- Drag and drop this `invoice-app` folder (or use `vercel` CLI from inside
  it) as a brand new project — separate from your Lovable project.
- Give it any name, e.g. `cinni-invoice`. Deploy.

**2. Add the subdomain to that project**
- In the Vercel dashboard, open the `cinni-invoice` project → **Settings →
  Domains** → Add → type `bill.cinniinternational.com` → Add.
- Vercel will show you a DNS record to create (usually a **CNAME** record
  pointing `bill` to `cname.vercel-dns.com`).

**3. Add that DNS record**
- Go to wherever cinniinternational.com's DNS is managed (your domain
  registrar, or Cloudflare, or Lovable's domain settings if Lovable
  manages your DNS).
- Add a CNAME record: **Name/Host:** `bill` **Value/Target:** whatever
  Vercel showed you (e.g. `cname.vercel-dns.com`).
- Save. DNS usually propagates within a few minutes to a few hours.

**4. Confirm**
- Visit `https://bill.cinniinternational.com` — Vercel auto-issues an SSL
  certificate once DNS resolves, so it'll load securely.

## Login

The tool is gated behind a login screen before anything is visible. For
now, the test credentials are:
- **Username:** `admin`
- **Password:** `Faiyaz8842@`

These are hardcoded in `index.html` (search for `ADMIN_USER` and
`ADMIN_PASS`) — change them there before sharing the link with anyone
else. Login persists for the current browser tab/session; closing the
browser or a "Log out" click clears it and requires logging in again.

**Important limitation:** this is a simple front-end gate, not real
security — anyone who views the page's source code (or opens browser dev
tools) can read the hardcoded password directly. It's fine for keeping out
casual visitors or bots, but don't treat it as protecting sensitive data
from a determined person. If you want stronger protection later, Vercel's
Pro plan has built-in deployment password protection that works at the
server level instead of in the browser — I can help you set that up if
you upgrade.

## Notes

- Your seller details and logo are saved in the visitor's browser
  (localStorage), so they don't have to be re-entered every time on the same
  device/browser.
- Supported foreign currencies: USD ($), GBP (£), EUR (€), CAD (CA$),
  AUD (A$), NZD (NZ$) — or INR only, with no conversion.
- **Amount Method**: choose "Use exchange rate" to auto-fetch (or manually
  type) a rate that's multiplied against the INR total, or choose "Enter
  foreign amount directly" to type the exact dollar/pound/euro figure you
  actually charged the buyer, with no exchange-rate math at all.
- The exchange rate (when used) is fetched live from a free public API
  (open.er-api.com), but is always editable.
- PDFs are generated on A4 paper size, and downloaded as
  `InvoiceNo-Month.pdf` (e.g. `Retail00006-July.pdf`) based on the invoice
  number and the month of the invoice date.
- Totals are shown with the foreign currency on the **left** and INR on the
  **right**, both in the on-screen preview and in the PDF.
- Upload a logo image (PNG/JPG) once — it's stored in the browser and
  appears in both the live preview and the generated PDF automatically.
- Only the PDF invoice is downloadable from this tool — there is no local
  Excel/JSON export or import here. All invoice records live exclusively
  in your connected Google Sheet (see the sync section above).
- Everything happens in the browser — no backend, no external database.
  Invoice data itself is never sent anywhere (only the exchange-rate
  lookup touches the network, and only the rate, not your data).
- Everything about invoice data goes straight to your Google Sheet — no
  local backup/export file is needed or offered, so there's nothing to
  lose track of on this front. Seller details and your logo are still
  cached in the browser purely for convenience (so you don't retype them),
  but that's just a form-filling shortcut, not where invoice records live.
- To adjust currencies, wording, or styling, edit `index.html` — search for
  `FALLBACK_RATES` and `CURRENCY_SYMBOL` for currencies, or `buildRecord`
  for what gets sent to the Google Sheet.
