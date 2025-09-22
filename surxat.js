// server.js (contoh sederhana)
const express = require('express');
const bodyParser = require('body-parser');
const webpush = require('web-push');

const app = express();
app.use(bodyParser.json());

// --- Buat VAPID keys sekali (di mesin dev) ---
// const vapidKeys = webpush.generateVAPIDKeys();
// console.log(vapidKeys);
// Simpan public/private key di server config. Contoh (jangan commit ke public repo):
const VAPID_PUBLIC = '<const webpush = require('web-push');
const VAPID_PRIVATE = '<console.log(webpush.generateVAPIDKeys());>';>';

webpush.setVapidDetails(
  'mailto:you@example.com',
  VAPID_PUBLIC,
  VAPID_PRIVATE
);

// Simpan subscriptions di memory (produk: DB)
const subscriptions = []; // [{endpoint, keys:{p256dh, auth}}]

// endpoint untuk menyimpan subscription dari client
app.post('/save-subscription', (req, res) => {
  const sub = req.body;
  subscriptions.push(sub);
  res.json({ok: true});
});

// endpoint untuk mengirim notifikasi ke semua subscription
app.post('/send-all', async (req, res) => {
  const payload = JSON.stringify({
    title: req.body.title || 'Test Alert',
    body: req.body.body || 'This is a safe test push',
    data: req.body.data || {}
  });
  const results = [];
  for (const s of subscriptions) {
    try {
      await webpush.sendNotification(s, payload);
      results.push({ endpoint: s.endpoint, status: 'sent' });
    } catch (err) {
      results.push({ endpoint: s.endpoint, status: 'error', error: err.message });
    }
  }
  res.json(results);
});

app.listen(3000, ()=>console.log('Server listening on :3000'));