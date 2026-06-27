// DeFlock Safford — Petition signature API
//
// Privacy-first by design. This service is the ONLY thing that holds the
// Supabase service key. The static site posts here; the browser never sees
// the key. The signer list is never read back out to the public — only an
// aggregate count and (optionally) consented display names are exposed.
//
// Required environment variables (set in Railway, NEVER in git):
//   SUPABASE_URL          - your project URL, e.g. https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY  - the service_role key (secret; server-side only)
//   ALLOWED_ORIGIN        - your site origin, e.g. https://mnehmos.github.io
//   PORT                  - provided automatically by Railway

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';

const {
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  ALLOWED_ORIGIN = '*',
  PORT = 8080,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('FATAL: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.');
  process.exit(1);
}

// Service-role client. Stays on the server. Never shipped to the browser.
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

const app = express();
app.set('trust proxy', 1); // Railway sits behind a proxy; needed for rate-limit
app.use(express.json({ limit: '8kb' }));

// Lock CORS to the site origin so random sites can't post through this API.
app.use(cors({
  origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN.split(','),
  methods: ['GET', 'POST'],
}));

// Rate limit: a town petition does not need high throughput. This blunts
// spam and scripted floods without inconveniencing real signers.
const signLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,                    // 5 sign attempts per IP per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});

// ── Helpers ──────────────────────────────────────────────────
const clean = (v, max) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const emailLooksValid = (e) =>
  typeof e === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 254;

// ── Routes ───────────────────────────────────────────────────

// Health check for Railway.
app.get('/health', (_req, res) => res.json({ ok: true }));

// Public signature count (no rows exposed).
app.get('/count', async (_req, res) => {
  try {
    const { data, error } = await supabase.rpc('signature_count');
    if (error) throw error;
    res.json({ count: Number(data) || 0 });
  } catch (err) {
    console.error('count error:', err.message);
    res.status(500).json({ error: 'Could not fetch count.' });
  }
});

// Optional: consented public display names only (for a signer wall).
app.get('/public-signatures', async (_req, res) => {
  try {
    const { data, error } = await supabase.rpc('public_signatures');
    if (error) throw error;
    res.json({ signatures: data || [] });
  } catch (err) {
    console.error('public-signatures error:', err.message);
    res.status(500).json({ error: 'Could not fetch signatures.' });
  }
});

// Sign the petition.
app.post('/sign', signLimiter, async (req, res) => {
  try {
    const email = clean(req.body?.email, 254).toLowerCase();
    const displayName = clean(req.body?.display_name, 80);
    const city = clean(req.body?.city, 80);
    const publicConsent = req.body?.public_consent === true;

    if (!emailLooksValid(email)) {
      return res.status(400).json({ error: 'Please enter a valid email.' });
    }

    // Honeypot: if a hidden field is filled, silently accept and drop (bots).
    if (clean(req.body?.website, 100)) {
      return res.json({ ok: true });
    }

    const { error } = await supabase.from('signatures').insert({
      email,
      display_name: displayName || null,
      city: city || null,
      public_consent: publicConsent,
    });

    if (error) {
      // Unique-violation = already signed. Treat as success, don't leak status.
      if (error.code === '23505') {
        return res.json({ ok: true, already: true });
      }
      throw error;
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('sign error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Petition API listening on port ${PORT}`);
});
