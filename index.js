const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { generateAIReview } = require('./geminiClient');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health & Status endpoint
app.get('/api/status', (req, res) => {
  const hasEnvKey = !!process.env.GEMINI_API_KEY;
  res.json({
    status: 'online',
    version: '1.0.0',
    hasEnvKey: hasEnvKey,
    supportedLanguages: ['c', 'cpp', 'python', 'java', 'javascript']
  });
});

// Code Review Endpoint
app.post('/api/analyze', async (req, res) => {
  const { code, language = 'c', mode = 'full', customApiKey } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Code string is required'
    });
  }

  // Attempt Gemini review if key is available
  const result = await generateAIReview(code, language, mode, customApiKey);

  res.json(result);
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 AI Code Review Buddy Server Running`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`🔑 Gemini API Key configured: ${!!process.env.GEMINI_API_KEY ? 'Yes' : 'No (Using local analyzer)'}`);
  console.log(`=================================================`);
});
