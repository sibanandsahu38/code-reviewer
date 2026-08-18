/**
 * Gemini AI Client for AI Code Review Buddy
 * Interacts with Gemini models using structured JSON responses.
 */

async function generateAIReview(code, language, mode = 'full', customApiKey = null) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY_MISSING',
      message: 'No Gemini API Key found in environment or request header. Using high-precision local static analyzer.'
    };
  }

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
    "concept": "<core CS concept involved, e.g., Array Bounds & Pointer Arithmetic>",
    "difficulty": "<Beginner | Intermediate | Advanced>",
    "explanation": "<tutor-style friendly deep-dive breakdown of the concept and why it happens in ${language}>",
    "keyTakeaways": ["<point 1>", "<point 2>", "<point 3>"]
  },
  "optimization": {
    "possibleTime": "<e.g., O(n)>",
    "possibleSpace": "<e.g., O(n) or O(1)>",
    "technique": "<e.g., Hash Map Lookup / Two Pointers / Dynamic Programming>",
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

Ensure all JSON strings are properly escaped. Do not wrap with markdown backticks or code blocks; return ONLY the raw JSON.`;

  const userPrompt = `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\``;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt + '\n\n' + userPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const textOutput = candidate?.content?.parts?.[0]?.text;

    if (!textOutput) {
      throw new Error('No response text received from Gemini');
    }

    const parsedJson = JSON.parse(textOutput);
    return {
      success: true,
      data: parsedJson,
      source: 'gemini-ai'
    };
  } catch (error) {
    console.error('Gemini call failed:', error.message);
    return {
      success: false,
      error: error.message,
      message: 'Failed to contact Gemini API. Falling back to local static analyzer.'
    };
  }
}

module.exports = { generateAIReview };
