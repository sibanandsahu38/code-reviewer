# 🧠 AI Code Review Buddy (v2.4 Pro)

An interactive, dual-engine code review, complexity analyzer, and CS programming tutor for **C, C++, Python, Java, and JavaScript**.

---

## ✨ Key Features

- **⚡ Dual Engine**:
  - **Instant Offline Static & Complexity Analyzer**: Sub-15ms heuristic AST & regex engine that runs deterministically with 0 latency.
  - **Live Gemini AI Integration**: Deep semantic code analysis, structured scoring, and tailored tutor explanations via Express.js backend.
- **🎨 AI Developer Grid & 5 Multi-Color Themes**:
  - 🌌 **Developer Grid**: Midnight navy with glowing cyan & violet neural nodes.
  - 💻 **Matrix Cyber Rain**: Terminal neon phosphor green and matrix data streams.
  - 💜 **Cyberpunk Synthwave**: Obsidian purple with electric pink/magenta accents.
  - 💎 **Tokyo Sapphire**: Deep sapphire blue with electric cyan highlights.
  - ☕ **Minimal Obsidian**: Clean neutral dark with warm amber gold accents.
- **⏱️ Complexity & Scalability Analyzer with Live Probes**:
  - Estimates Time ($O(1)$, $O(\log n)$, $O(n)$, $O(n \log n)$, $O(n^2)$, $O(2^n)$) and Space complexity.
  - **Interactive Asymptotic Scaling Curves**: Dynamic slider ($N = 10 \dots 10,000$) with real-time glowing probe tracking dots and operation counters.
- **🛠️ 1-Click In-Place Code Repair**:
  - Directly fixes memory leaks, array bounds, and missing headers in the code editor with animated line-level glowing highlights.
- **🚀 Optimize Mode**:
  - Complete standalone, runnable optimized programs with side-by-side analysis.
- **🎓 "Teach Me" Tutor Mode**:
  - Deep-dive into core computer science concepts with visual **Stack vs Heap** memory layout diagrams.
- **🧪 Test Case Generator**:
  - Generates normal, edge, boundary, duplicate, and scale stress tests with expected outputs.
- **🏠 Product Showcase & Landing Website**:
  - Modern high-converting product showcase website with an embedded interactive Big-O simulator.

---

## 📂 Project Structure

```
ai-code-review-buddy/
├── public/
│   ├── index.html            # Interactive Studio IDE
│   ├── landing.html          # Product Showcase & Landing Website
│   ├── css/
│   │   ├── style.css         # Core layout, 5 color themes & design tokens
│   │   ├── components.css    # Glass cards, score dial, complexity curves & probes
│   │   └── landing.css       # Product landing page styles
│   └── js/
│       ├── app.js            # Studio IDE controller & state management
│       ├── staticAnalyzer.js # Local heuristic AST/Regex rule analyzer
│       ├── editor.js         # CodeMirror integration & presets
│       ├── aiService.js      # Backend API connector with mock fallback
│       └── landing.js        # Landing page particle canvas & interactive teaser
├── server/
│   ├── index.js              # Express.js server & API routes
│   └── geminiClient.js       # Structured Gemini API code reviewer
├── vercel.json               # Vercel deployment configuration
├── netlify.toml              # Netlify deployment configuration
├── package.json              # Dependencies and scripts
├── .env.example              # Sample environment variables
├── .gitignore                # Git ignore rules
└── README.md                 # Documentation
```

---

## 🚀 Quick Start (Local)

### 1. Install & Run (Node.js)
```bash
npm install
npm start
```
Open **[https://code-reviewer-two-nu.vercel.app](https://code-reviewer-two-nu.vercel.app/)** in your browser.

### 2. Standalone Windows (No Node Required)
Run `server.ps1` in PowerShell or double-click `start.bat`.

---

## 🌐 Public Deployment

- **Vercel**: Import the GitHub repo into [Vercel](https://vercel.com/new). `vercel.json` is pre-configured!
- **Netlify**: Drag and drop the `public/` folder to [Netlify Drop](https://app.netlify.com/drop).
- **GitHub Pages**: Set build source to branch `main` in repo Settings $\to$ Pages.

---

## 📄 License
MIT License © 2026 AI Code Review Buddy
