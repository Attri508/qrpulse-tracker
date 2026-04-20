const https = require('https');

module.exports = async function handler(req, res) {
  const urlObj = new URL(req.url, `https://${req.headers.host}`);
  const id = urlObj.searchParams.get('id');
  const redirect = urlObj.searchParams.get('redirect');

  if (id) {
    const body = JSON.stringify({
      qr_id: id,
      user_agent: req.headers['user-agent'] || null,
    });

    const supabaseHost = process.env.SUPABASE_URL.replace('https://', '');

    console.log('Attempting insert for qr_id:', id);
    console.log('Supabase host:', supabaseHost);

    // ✅ Promise wrap — redirect se PEHLE Supabase call complete hoga
    await new Promise((resolve) => {
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

      const supabaseReq = https.request(options, (supabaseRes) => {
        console.log('Supabase status:', supabaseRes.statusCode);
        let data = '';
        supabaseRes.on('data', (chunk) => data += chunk);
        supabaseRes.on('end', () => {
          console.log('Supabase response body:', data);
          resolve();
        });
      });

      supabaseReq.on('error', (e) => {
        console.error('Supabase request error:', e.message);
        resolve(); // error pe bhi redirect karo
      });

      supabaseReq.write(body);
      supabaseReq.end();
    });
  }

  const target = redirect ? decodeURIComponent(redirect) : 'https://qrpulse.app';
  res.redirect(302, target);
};
