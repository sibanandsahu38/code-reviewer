```markdown
# 🧠 CodeLens AI

> **Intelligent Code Review · Complexity Analysis · AI Tutoring**

CodeLens AI is an interactive developer tool that helps programmers review, understand, optimize, and learn from their code. It combines a fast local static-analysis engine with Gemini-powered semantic analysis to detect common programming issues, estimate algorithmic complexity, suggest improvements, generate test cases, and explain computer science concepts behind the code.

Write code ──► Analyze ──► Understand ──► Fix ──► Optimize ──► Learn
```

---

## 🚀 Live Demo

🌐 **[Try CodeLens AI](https://code-reviewer-two-nu.vercel.app/)**  
*Experience the interactive code-review studio, complexity visualizer, AI tutor, optimization tools, and developer themes.*

---

## ✨ Why CodeLens AI?

Most code-review tools simply tell you **what** is wrong.  
**CodeLens AI** focuses on **why** it is wrong and **how** to improve.

```text
             YOUR CODE
                 │
        ┌────────┴────────┐
        ▼                 ▼
  LOCAL ANALYZER      AI ENGINE
     ⚡ Fast          🤖 Gemini
        │                 │
        └────────┬────────┘
                 ▼
            CODE REVIEW
                 │
  ┌──────────────┼──────────────┐
  ▼              ▼              ▼
Detect        Explain        Improve
  │              │              │
  ▼              ▼              ▼
Bugs &       Teach Me       Optimize
Issues         Mode           Code
```

---

## ⚡ Core Features

### 🧠 Hybrid Dual-Engine Analysis
CodeLens AI uses two complementary analysis systems:

* **Local Analysis**: Fast, deterministic analysis that functions without an AI API key. Detects common structural patterns such as:
  * 🔴 Potential array-bound violations
  * ⚠️ Nested loops
  * 🧠 Recursion
  * 💾 Possible memory leaks
  * 🔄 Suspicious assignments
  * ♾️ Potential infinite loops
  * ⏱️ Common complexity patterns
* **Gemini AI Analysis**: Deeper semantic analysis providing:
  * Intelligent code review & quality scoring
  * Optimization recommendations
  * In-depth bug explanations
  * Computer science concept tutoring
  * Comprehensive edge-case generation

> [!NOTE]
> If Gemini is unavailable, CodeLens AI automatically falls back to local static analysis capabilities.

---

### ⏱️ Complexity Analyzer & Scaling Visualization
Understand how your algorithm scales across complexity classes: $O(1)$, $O(\log n)$, $O(n)$, $O(n \log n)$, $O(n^2)$, and $O(2^n)$.

```text
Operations
   │
   │            ╱ O(2ⁿ)
   │          ╱
   │        ╱ O(n²)
   │      ╱
   │    ╱ O(n log n)
   │  ─────────────── O(n)
   └──────────────────────────► N
```

*Move the interactive input-size slider in the UI to observe scaling behavior in real time.*

---

### 🛠️ One-Click Code Repair
When CodeLens detects a supported issue, apply suggested fixes directly inside the editor without manual copying and pasting:
* Array-bound corrections
* Missing header inclusions
* Memory-management fixes
* Automated pattern repairs

---

### 🚀 Optimize Mode
Compare your original code side-by-side with an optimized solution.

```text
┌─────────────────────┐      ┌─────────────────────┐
│       BEFORE        │      │        AFTER        │
│                     │      │                     │
│     Brute Force     │  →   │      Hash Map       │
│        O(n²)        │      │        O(n)         │
└─────────────────────┘      └─────────────────────┘
```

The system details:
1. What changed
2. Why the new approach is superior
3. Expected complexity improvements
4. Core algorithmic ideas behind the optimization

---

### 🎓 Teach Me Mode
Acts as a personal computer science tutor by explaining the underlying theory when bugs are detected:
* **Array Out of Bounds**: Zero-based indexing, valid ranges, loop boundaries.
* **Memory Issues**: Stack vs Heap, `malloc()` / `free()`, ownership models.
* **Recursion**: Call stack frame execution, base case design, stack overflow prevention.

---

### 🧪 AI Test Case Generator
Automatically builds test suites engineered to expose subtle edge cases:

* ✅ **Normal Cases**: Typical inputs and standard execution paths
* 🎯 **Boundary Cases**: Upper/lower limits, structural extremes
* ⚠️ **Edge Cases**: Empty structures, null references, unexpected inputs
* 🔁 **Duplicates**: Repeated elements, uniform data arrays
* 📦 **Empty / Small Inputs**: Minimum size scenarios
* 📈 **Stress Inputs**: Large dataset scaling tests

```text
Problem: Binary Search
Generated Tests:
 ├── ✓ Target exists
 ├── ✓ Target missing
 ├── ✓ One-element array
 ├── ✓ Empty array
 ├── ✓ First element
 ├── ✓ Last element
 ├── ✓ Duplicate values
 └── ✓ Large sorted input
```

---

### 🎨 Developer-Focused UI Themes
Designed for visual clarity during long programming sessions:
* 🌌 **Developer Grid**: Midnight navy with cyan & violet accents
* 💻 **Matrix Cyber Rain**: Terminal-inspired green data streams
* 💜 **Cyberpunk Synthwave**: Dark purple with electric pink highlights
* 💎 **Tokyo Sapphire**: Deep sapphire with cyan accents
* ☕ **Minimal Obsidian**: Clean dark interface with warm amber highlights

---

### 🏠 Product Showcase & Landing Page
Includes a landing page featuring:
* Product overview & interactive feature demonstrations
* Interactive Big-O simulator
* Animated developer-themed visuals

---

## 💻 Supported Languages

| Language | Local Analysis | AI Review |
| :--- | :---: | :---: |
| **C** | ✅ | ✅ |
| **C++** | ✅ | ✅ |
| **Python** | ✅ | ✅ |
| **Java** | ✅ | ✅ |
| **JavaScript** | ✅ | ✅ |

---

## 🏗️ Project Architecture

```text
┌─────────────────────────────────────────┐
│               CodeLens AI               │
├─────────────────────────────────────────┤
│  CodeMirror Editor                      │
│        │                                │
│   ┌────┴────┐                           │
│   ▼         ▼                           │
│ Local    Express Backend                │
│ Analyzer    │                           │
│             ▼                           │
│          Gemini API                     │
│             │                           │
│   ┌─────────┘                           │
│   ▼                                     │
│ Unified Results                         │
│   │                                     │
│   ├───────────┬────────────┐            │
│   ▼           ▼            ▼            │
│ Review   Complexity    Learning         │
│ Dashboard Analysis     Tools            │
└─────────────────────────────────────────┘
```

---

## 📂 Project Structure

```text
code-reviewer/
├── public/
│   ├── index.html
│   ├── landing.html
│   ├── css/
│   │   ├── style.css
│   │   ├── components.css
│   │   └── landing.css
│   └── js/
│       ├── app.js
│       ├── staticAnalyzer.js
│       ├── editor.js
│       ├── aiService.js
│       └── landing.js
├── server/
│   ├── index.js
│   └── geminiClient.js
├── vercel.json
├── netlify.toml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/sibanandsahu38/code-reviewer.git
cd code-reviewer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

> [!WARNING]
> Never commit your real `.env` file or Gemini API key to public version control.

### 4. Start the application
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

CodeLens AI can be deployed to modern hosting platforms such as **Vercel** or **Netlify**:

* Deployment configuration files (`vercel.json`, `netlify.toml`) are included.
* Ensure you set `GEMINI_API_KEY` as an environment variable in your deployment platform settings.

---

## 🗺️ Roadmap

### ✅ Current Features
* [x] Interactive CodeMirror editor
* [x] Fast local static analysis engine
* [x] Algorithmic complexity estimator
* [x] Gemini AI integration
* [x] One-click code repair
* [x] Side-by-side Optimize Mode
* [x] CS Concept Teach Me Mode
* [x] AI Test Case Generator
* [x] Custom developer themes
* [x] Product landing page & Big-O simulator

### 🔮 Planned Features
* [ ] AST-based deep code analysis
* [ ] Automated unit test execution
* [ ] GitHub repository & PR review integration
* [ ] Code quality history tracking
* [ ] User accounts & personalized learning analytics
* [ ] Repository health scoring
* [ ] Advanced dependency tree analysis

---

## 🔐 Security Architecture

CodeLens AI routes all AI queries through the server backend to keep secret keys safe:

```text
Browser ──► Express Backend ──► Gemini API
                 │
         (Stores API Key)
```

The frontend never handles or exposes the `GEMINI_API_KEY`.

---

## 🎯 Vision

CodeLens AI aims to bridge the gap between static analysis and interactive learning:

```text
WRITE ──► REVIEW ──► UNDERSTAND ──► FIX ──► OPTIMIZE ──► PRACTICE ──► IMPROVE
```

> *"Don't just tell developers what's wrong with their code — help them understand why."*

---

## 👨‍💻 Author

**Sibanand Sahu**  
*B.Tech CSE (AI & ML) Student · Aspiring Software Engineer*

🔗 **Connect:**
* GitHub: [@sibanandsahu38](https://github.com/sibanandsahu38)
* LinkedIn: [Sibanand Sahu](https://www.linkedin.com/in/sibanand-sahu-290103382/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

© 2026 Sibanand Sahu. All rights reserved.

---

⭐ **If CodeLens AI helped you understand your code, consider starring the repository!**
```

This file has also been saved directly to [`code-reviewer/README.md`](file:///C:/Users/Sibanand/.gemini/antigravity/scratch/code-reviewer/README.md).
