/**
 * AI & Static Analysis Service Layer
 * Coordinates between Server/Gemini API and Local Static Analyzer.
 * Supports both Backend proxying and direct Client-Side Gemini calls for standalone usage.
 */

class AIService {
  static async analyzeCode(code, language, customApiKey = null, useAI = true) {
    // 1. Run local static analysis immediately as baseline
    const localResult = window.StaticAnalyzer.analyze(code, language);

    if (!useAI) {
      return {
        ...localResult,
        source: 'local-static-engine'
      };
    }

    const apiKey = customApiKey || localStorage.getItem('review_buddy_api_key');

    // 2. Try calling backend if running on http/https server
    if (window.location.protocol.startsWith('http')) {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            language,
            customApiKey: apiKey
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.success && resData.data) {
            return {
              ...resData.data,
              source: 'gemini-ai'
            };
          }
        }
      } catch (err) {
        console.log('Backend not reachable, falling back to direct API or local engine:', err.message);
      }
    }

    // 3. Direct Client-Side Gemini API call if API Key is available
    if (apiKey) {
      try {
        const directResult = await this.callDirectGemini(code, language, apiKey);
        if (directResult.success && directResult.data) {
          return {
            ...directResult.data,
            source: 'gemini-ai'
          };
        }
      } catch (err) {
        console.warn('Direct Gemini API call failed:', err.message);
      }
    }

    // 4. Return local static analyzer result
    return {
      ...localResult,
      aiNotice: apiKey ? 'Could not reach Gemini API. Showing high-precision local static analysis.' : 'Running with local static analyzer. Add a Gemini API key in Settings for AI semantic reviews.',
      source: 'local-static-engine'
    };
  }

  static async callDirectGemini(code, language, apiKey) {
    const systemPrompt = `You are "AI Code Review Buddy", an expert programming tutor, senior code reviewer, and computer science educator specializing in ${language}.
Your job is to analyze the user's code thoroughly and return a valid JSON object matching the exact schema specified below.

Schema:
{
  "score": <number 0-100>,
  "verdict": "<short one-line summary>",
  "categories": {
    "correctness": <number 0-100>,
    "performance": <number 0-100>,
    "readability": <number 0-100>,
    "memory": <number 0-100>
  },
  "complexity": {
    "time": "<e.g., O(n^2), O(n), O(log n), O(1)>",
    "space": "<e.g., O(1), O(n)>",
    "timeExplanation": "<concise explanation of time complexity>",
    "spaceExplanation": "<concise explanation of space complexity>",
    "bottlenecks": ["<bottleneck 1>", "<bottleneck 2>"]
  },
  "issues": [
    {
      "id": "<unique_id>",
      "type": "<critical | warning | optimization | style>",
      "title": "<short issue title>",
      "line": <line number or null>,
      "description": "<clear description of why this is a bug or problem>",
      "fix": "<corrected code snippet replacement>",
      "fixExplanation": "<why this fix solves it>"
    }
  ],
  "teachMe": {
    "concept": "<core CS concept involved>",
    "difficulty": "<Beginner | Intermediate | Advanced>",
    "explanation": "<tutor-style friendly deep-dive breakdown of the concept and why it happens in ${language}>",
    "keyTakeaways": ["<point 1>", "<point 2>", "<point 3>"]
  },
  "optimization": {
    "possibleTime": "<e.g., O(n)>",
    "possibleSpace": "<e.g., O(n) or O(1)>",
    "technique": "<e.g., Hash Map Lookup / Two Pointers>",
    "optimizedCode": "<clean fully rewritten optimized code in ${language}>",
    "whyBetter": "<detailed explanation of what changed and performance gain>"
  },
  "testCases": [
    {
      "name": "<e.g., Standard Case, Empty Input, Duplicate Values, Max Boundary>",
      "input": "<example input representation>",
      "expectedOutput": "<expected result>",
      "purpose": "<why this test case is crucial to verify>"
    }
  ]
}

Return ONLY the raw JSON without markdown formatting or code blocks.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + '\n\nCode to review:\n' + code }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`API Error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) throw new Error('Empty response from AI');

    return {
      success: true,
      data: JSON.parse(textOutput),
      source: 'gemini-ai'
    };
  }

  static async checkServerStatus() {
    if (!window.location.protocol.startsWith('http')) {
      return { status: 'standalone' };
    }
    try {
      const res = await fetch('/api/status');
      if (res.ok) return await res.json();
      return { status: 'standalone' };
    } catch {
      return { status: 'standalone' };
    }
  }
}

window.AIService = AIService;
