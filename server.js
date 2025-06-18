import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/openai', async (req, res) => {
  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await openaiRes.json();
    res.status(openaiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'OpenAI proxy error' });
  }
});

app.post('/api/hypermode', async (req, res) => {
  try {
    const hyperRes = await fetch('https://api.hypermode.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_HYPERMODE_API_KEY || process.env.HYPERMODE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    const data = await hyperRes.json();
    res.status(hyperRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Hypermode proxy error' });
  }
});

app.listen(4000, () => console.log('Proxy server running on http://localhost:4000'));
