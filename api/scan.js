const https = require('https');

module.exports = function handler(req, res) {
  const urlObj = new URL(req.url, `https://${req.headers.host}`);
  const id = urlObj.searchParams.get('id');
  const redirect = urlObj.searchParams.get('redirect');

  if (id) {
    const body = JSON.stringify({
      qr_id: id,
      user_agent: req.headers['user-agent'] || null,
    });

    // Supabase URL parse
    const supabaseHost = process.env.SUPABASE_URL.replace('https://', '');

    const options = {
      hostname: supabaseHost,
      path: '/rest/v1/qr_scans',
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    console.log('Inserting scan for qr_id:', id); // ✅ Log for debugging

    const supabaseReq = https.request(options, (supabaseRes) => {
      console.log('Supabase status:', supabaseRes.statusCode); // ✅ Response log
      supabaseRes.on('data', (d) => console.log('Supabase response:', d.toString()));
    });

    supabaseReq.on('error', (e) => console.error('Supabase error:', e.message));
    supabaseReq.write(body);
    supabaseReq.end();
  }

  const target = redirect ? decodeURIComponent(redirect) : 'https://qrpulse.app';
  res.redirect(302, target);
};
