# 🧠 AI Code Review Buddy

An interactive, dual-engine code review, complexity analyzer, and CS programming tutor for **C, C++, Python, and Java**.

---

## ✨ Features

- **⚡ Dual Engine**:
  - **Instant Offline Static & Complexity Analyzer**: Heuristic AST & regex engine that runs deterministically with 0 latency.
  - **Live Gemini AI Integration**: Deep semantic code analysis, structured scoring, and tailored tutor explanations via Express.js backend.
- **📊 Review Dashboard**:
  - Code Health Score (0–100) with animated radial gauge.
  - Breakdown across Correctness, Performance, Readability, and Memory Safety.
  - Interactive issue cards with severity pills and one-click "Apply Fix" / "Copy Fix".
- **⏱️ Complexity & Scalability Analyzer**:
  - Estimates Time ($O(1)$, $O(\log n)$, $O(n)$, $O(n \log n)$, $O(n^2)$, $O(2^n)$) and Space complexity.
  - Interactive scalability comparison ($N=10$, $N=1,000$, $N=100,000$).
  - Computational bottleneck detection.
- **🚀 Optimize Mode**:
  - Side-by-side Before vs. After algorithmic comparison.
  - Algorithmic improvement explanations (e.g. Brute force $\to$ Hash map lookup).
  - One-click "Replace In Editor".
- **🎓 "Teach Me" Tutor Mode**:
  - Deep-dive into core computer science concepts (Array Indexing & Bounds, Heap vs Stack Memory, Call Stack Overflow, etc.).
  - Interactive visual memory layout diagrams.
- **🧪 Test Case Generator**:
  - Generates normal, edge, boundary, and scale stress tests for your code.
- **💻 Rich Code Editor**:
  - CodeMirror dark editor with syntax highlighting, active line highlight, bracket matching, and quick presets.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. (Optional) Configure Gemini API Key
To enable live AI reviews, create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```
And set your `GEMINI_API_KEY`:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
```
*(You can also set your API key directly inside the web UI under "AI Settings" without modifying `.env`)*

### 3. Start the Server
```bash
npm start
```
Open your browser at [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Structure

```
ai-code-review-buddy/
├── public/
│   ├── index.html            # Main UI layout & containers
│   ├── css/
│   │   ├── style.css         # Modern developer dark theme & layout
│   │   └── components.css    # Cards, badges, diff viewers, meters, tabs
│   └── js/
│       ├── app.js            # Main UI controller & state management
│       ├── staticAnalyzer.js # Local heuristic AST/Regex rule analyzer
│       ├── editor.js         # CodeMirror integration & presets
│       └── aiService.js      # Backend API connector with mock fallback
├── server/
│   ├── index.js              # Express.js server & API routes
│   └── geminiClient.js       # Structured Gemini API code reviewer
├── package.json              # Backend dependencies
├── .env.example              # Sample environment variables
└── README.md                 # Setup and usage guide
```
