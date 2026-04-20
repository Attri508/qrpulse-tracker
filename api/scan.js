export default async function handler(req, res) {
  const { id, redirect } = req.query;

  if (id) {
    try {
      await fetch(`${process.env.SUPABASE_URL}/rest/v1/qr_scans`, {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ qr_id: id }),
      });
    } catch (e) {
      console.error('Scan log error:', e);
    }
  }

  const target = redirect ? decodeURIComponent(redirect) : 'https://qrpulse.app';
  res.redirect(302, target);
}
