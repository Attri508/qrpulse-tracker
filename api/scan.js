const https = require('https');
const url = require('url');

module.exports = function handler(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const { id, redirect } = parsedUrl.query;

  if (id) {
    const body = JSON.stringify({
      qr_id: id,
      user_agent: req.headers['user-agent'] || null,
    });

    const supabaseUrl = new URL(
      '/rest/v1/qr_scans',
      process.env.SUPABASE_URL
    );

    const options = {
      hostname: supabaseUrl.hostname,
      path: supabaseUrl.pathname,
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    // Non-blocking — redirect wait nahi karega
    const reqHttp = https.request(options, () => {});
    reqHttp.on('error', (e) => console.error('Supabase error:', e));
    reqHttp.write(body);
    reqHttp.end();
  }

  const target = redirect
    ? decodeURIComponent(redirect)
    : 'https://qrpulse.app';
  res.redirect(302, target);
};
