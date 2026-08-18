/**
 * Main Application Controller for AI Code Review Buddy
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize State
  const state = {
    language: 'c',
    activeTab: 'review',
    flowMode: 'controlFlow',
    theme: localStorage.getItem('review_buddy_theme') || 'developer-grid',
    selectedGraphNode: null,
    currentAnalysis: null,
    editorManager: null,
    apiKey: localStorage.getItem('review_buddy_api_key') || '',
    isAnalyzing: false
  };

  // Set initial theme
  document.body.setAttribute('data-theme', state.theme);

  // 2. DOM Elements
  const themeSelect = document.getElementById('themeSelect');
  const languageSelect = document.getElementById('languageSelect');
  const presetSelect = document.getElementById('presetSelect');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const resetBtn = document.getElementById('resetBtn');
  const clearBtn = document.getElementById('clearBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const fileUploadInput = document.getElementById('fileUploadInput');
  const editorDropZone = document.getElementById('editorDropZone');
  const dropOverlay = document.getElementById('dropOverlay');
  const toggleStdinBtn = document.getElementById('toggleStdinBtn');
  const stdinContent = document.getElementById('stdinContent');
  const customStdin = document.getElementById('customStdin');
  const apiKeyBtn = document.getElementById('apiKeyBtn');
  const apiKeyModal = document.getElementById('apiKeyModal');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const closeApiKeyModal = document.getElementById('closeApiKeyModal');
  const serverStatusBadge = document.getElementById('serverStatusBadge');

  if (themeSelect) {
    themeSelect.value = state.theme;
  }

  // Flow Graph Buttons
  const btnControlFlowMode = document.getElementById('btnControlFlowMode');
  const btnStatePipelineMode = document.getElementById('btnStatePipelineMode');
  const btnCenterGraph = document.getElementById('btnCenterGraph');

  // Tab Buttons
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // 3. Initialize CodeMirror Editor
  state.editorManager = new window.EditorManager('codeEditor');
  
  // Populate Presets for initial language (C)
  populatePresets('c');
  // Load default preset (Two Sum or Out of Bounds)
  state.editorManager.loadPreset('c', 'two_sum');
  presetSelect.value = 'two_sum';

  // 4. Check Backend Server Status
  checkStatus();

  // 5. Event Listeners
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      const selectedTheme = e.target.value;
      state.theme = selectedTheme;
      document.body.setAttribute('data-theme', selectedTheme);
      localStorage.setItem('review_buddy_theme', selectedTheme);
      
      const themeNames = {
        'developer-grid': '🌌 Developer Grid',
        'matrix': '💻 Matrix Rain',
        'cyberpunk': '💜 Cyberpunk Neon',
        'tokyo-night': '💎 Tokyo Sapphire',
        'obsidian': '☕ Minimal Obsidian'
      };
      showToast(`Switched to ${themeNames[selectedTheme] || selectedTheme} theme!`);
      if (typeof window.recreateNeuralNodes === 'function') {
        window.recreateNeuralNodes();
      }
    });
  }

  languageSelect.addEventListener('change', (e) => {
    state.language = e.target.value;
    state.editorManager.setLanguage(state.language);
    populatePresets(state.language);
    // Load first preset of selected language
    const firstKey = Object.keys(window.CODE_PRESETS[state.language] || {})[0];
    if (firstKey) {
      state.editorManager.loadPreset(state.language, firstKey);
      presetSelect.value = firstKey;
    }
  });

  presetSelect.addEventListener('change', (e) => {
    const key = e.target.value;
    if (key) {
      state.editorManager.loadPreset(state.language, key);
    }
  });

  analyzeBtn.addEventListener('click', () => {
    runAnalysis();
  });

  resetBtn.addEventListener('click', () => {
    const key = presetSelect.value;
    state.editorManager.loadPreset(state.language, key);
    showToast('Preset code reloaded.');
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.editorManager.setCode('');
      presetSelect.value = 'blank';
      showToast('Editor cleared. Type or paste your code!');
    });
  }

  if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          state.editorManager.setCode(text);
          presetSelect.value = 'blank';
          showToast('Code pasted from clipboard!');
        } else {
          showToast('Clipboard is empty.');
        }
      } catch (err) {
        showToast('Please press Ctrl+V to paste your code.');
      }
    });
  }

  // File Upload Support
  if (uploadBtn && fileUploadInput) {
    uploadBtn.addEventListener('click', () => {
      fileUploadInput.click();
    });

    fileUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        handleUploadedFile(file);
      }
    });
  }

  // Drag & Drop File onto Code Editor
  if (editorDropZone) {
    editorDropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      editorDropZone.classList.add('drag-active');
    });

    editorDropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      editorDropZone.classList.remove('drag-active');
    });

    editorDropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      editorDropZone.classList.remove('drag-active');
      const file = e.dataTransfer.files[0];
      if (file) {
        handleUploadedFile(file);
      }
    });
  }

  function handleUploadedFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      state.editorManager.setCode(content);

      // Auto-detect language from extension
      const fileName = file.name.toLowerCase();
      let detectedLang = state.language;
      if (fileName.endsWith('.c') || fileName.endsWith('.h')) detectedLang = 'c';
      else if (fileName.endsWith('.cpp') || fileName.endsWith('.hpp') || fileName.endsWith('.cc')) detectedLang = 'cpp';
      else if (fileName.endsWith('.py')) detectedLang = 'python';
      else if (fileName.endsWith('.java')) detectedLang = 'java';
      else if (fileName.endsWith('.js')) detectedLang = 'javascript';

      if (detectedLang !== state.language) {
        state.language = detectedLang;
        languageSelect.value = detectedLang;
        state.editorManager.setLanguage(detectedLang);
        populatePresets(detectedLang);
      }

      presetSelect.value = 'blank';
      showToast(`Loaded ${file.name} successfully!`);
    };
    reader.readAsText(file);
  }

  // Toggle Custom Stdin Drawer
  if (toggleStdinBtn && stdinContent) {
    toggleStdinBtn.addEventListener('click', () => {
      stdinContent.classList.toggle('open');
      toggleStdinBtn.classList.toggle('open');
    });
  }

  // Flow Mode Buttons (Control Flow & State Pipeline)
  if (btnControlFlowMode) {
    btnControlFlowMode.addEventListener('click', () => {
      setFlowMode('controlFlow');
    });
  }

  if (btnStatePipelineMode) {
    btnStatePipelineMode.addEventListener('click', () => {
      setFlowMode('statePipeline');
    });
  }

  if (btnCenterGraph) {
    btnCenterGraph.addEventListener('click', () => {
      if (state.currentAnalysis) {
        renderFlowGraph(state.currentAnalysis);
        showToast('Graph view reset & centered.');
      }
    });
  }

  function setFlowMode(mode) {
    state.flowMode = mode;
    if (btnControlFlowMode) btnControlFlowMode.classList.toggle('active', mode === 'controlFlow');
    if (btnStatePipelineMode) btnStatePipelineMode.classList.toggle('active', mode === 'statePipeline');
    if (state.currentAnalysis) {
      renderFlowGraph(state.currentAnalysis);
    }
  }

  // Tab Navigation
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      setActiveTab(targetTab);
    });
  });

  // API Key Modal Controls
  if (apiKeyBtn) {
    apiKeyBtn.addEventListener('click', () => {
      apiKeyInput.value = state.apiKey;
      apiKeyModal.classList.add('active');
    });
  }

  if (closeApiKeyModal) {
    closeApiKeyModal.addEventListener('click', () => {
      apiKeyModal.classList.remove('active');
    });
  }

  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', () => {
      state.apiKey = apiKeyInput.value.trim();
      localStorage.setItem('review_buddy_api_key', state.apiKey);
      apiKeyModal.classList.remove('active');
      showToast('API Key saved successfully!');
    });
  }

  // Keyboard shortcut: Ctrl + Enter to Analyze
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runAnalysis();
    }
  });

  // Run initial analysis on first load
  runAnalysis();

  // Helper Functions
  function populatePresets(lang) {
    presetSelect.innerHTML = '';
    const presets = window.CODE_PRESETS[lang] || window.CODE_PRESETS['c'];
    for (const [key, item] of Object.entries(presets)) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = item.name;
      presetSelect.appendChild(opt);
    }
  }

  function setActiveTab(tabId) {
    state.activeTab = tabId;
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `${tabId}Pane`);
    });

    // When switching to Flow or Complexity, re-render SVG charts with newly visible container dimensions
    if (state.currentAnalysis) {
      if (tabId === 'flow') {
        setTimeout(() => renderFlowGraph(state.currentAnalysis), 60);
      } else if (tabId === 'complexity') {
        setTimeout(() => {
          const comp = state.currentAnalysis.complexity || { time: 'O(1)' };
          const opt = state.currentAnalysis.optimization || {};
          renderComplexityComparisonCurves(comp.time, opt.possibleTime || 'O(n)');
        }, 60);
      }
    }
  }

  async function checkStatus() {
    const status = await window.AIService.checkServerStatus();
    if (serverStatusBadge) {
      if (status.status === 'online') {
        serverStatusBadge.innerHTML = `<span class="status-dot green"></span> Server Online ${status.hasEnvKey ? '(AI Ready)' : '(Local Analyzer)'}`;
        serverStatusBadge.className = 'status-badge online';
      } else {
        serverStatusBadge.innerHTML = `<span class="status-dot amber"></span> Standalone Mode (Instant Engine)`;
        serverStatusBadge.className = 'status-badge standalone';
      }
    }
  }

  async function runAnalysis() {
    if (state.isAnalyzing) return;
    
    const code = state.editorManager.getCode();
    if (!code || !code.trim()) {
      showToast('Please enter some code to analyze!');
      return;
    }

    state.isAnalyzing = true;
    analyzeBtn.classList.add('loading');
    analyzeBtn.disabled = true;

    const startTime = performance.now();

    try {
      const result = await window.AIService.analyzeCode(
        code,
        state.language,
        state.apiKey,
        true
      );

      const endTime = performance.now();
      const elapsedMs = Math.max(1, endTime - startTime);
      result.executionTimeMs = elapsedMs;

      state.currentAnalysis = result;
      renderAllPanels(result);
    } catch (err) {
      console.error('Analysis error:', err);
      showToast('Error during analysis: ' + err.message);
    } finally {
      state.isAnalyzing = false;
      analyzeBtn.classList.remove('loading');
      analyzeBtn.disabled = false;
    }
  }

  function renderAllPanels(data) {
    renderDashboard(data);
    renderFlowGraph(data);
    renderComplexityPanel(data);
    renderOptimizePanel(data);
    renderTeachMePanel(data);
    renderTestCasesPanel(data);
  }

  /**
   * 1. Render Score & Quality Dashboard
   */
  function renderDashboard(data) {
    const score = data.score || 0;
    const scoreVal = document.getElementById('overallScoreVal');
    const scoreCircle = document.getElementById('scoreProgressCircle');
    const verdict = document.getElementById('reviewVerdict');
    const engineSource = document.getElementById('engineSourceBadge');
    const execBadge = document.getElementById('executionTimeBadge');
    const execTimeSec = document.getElementById('execTimeSec');
    const statExecTime = document.getElementById('statExecutionTime');

    if (scoreVal) scoreVal.textContent = score;
    if (verdict) verdict.textContent = data.verdict || 'Code analyzed successfully.';

    // Format Execution Duration
    const timeMs = data.executionTimeMs || 12.4;
    const formattedSec = (timeMs / 1000).toFixed(3) + 's';
    const formattedMs = timeMs.toFixed(1) + 'ms';
    
    if (execTimeSec) execTimeSec.textContent = formattedSec;
    if (execBadge) execBadge.setAttribute('title', `Analysis executed in ${formattedSec} (${formattedMs})`);
    if (statExecTime) statExecTime.textContent = `${formattedSec} (${formattedMs})`;

    if (scoreCircle) {
      const radius = 45;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (score / 100) * circumference;
      scoreCircle.style.strokeDasharray = `${circumference} ${circumference}`;
      scoreCircle.style.strokeDashoffset = offset;

      // Color change based on score
      if (score >= 80) scoreCircle.style.stroke = 'var(--emerald-500)';
      else if (score >= 60) scoreCircle.style.stroke = 'var(--amber-500)';
      else scoreCircle.style.stroke = 'var(--rose-500)';
    }

    if (engineSource) {
      engineSource.textContent = data.source === 'gemini-ai' ? '🤖 Gemini AI' : '⚡ Instant Static Engine';
      engineSource.className = data.source === 'gemini-ai' ? 'engine-badge ai' : 'engine-badge static';
    }

    // Category Bars
    const cats = data.categories || { correctness: 80, performance: 80, readability: 80, memory: 80 };
    updateCategoryBar('correctness', cats.correctness);
    updateCategoryBar('performance', cats.performance);
    updateCategoryBar('readability', cats.readability);
    updateCategoryBar('memory', cats.memory);

    // Codebase Stats (for Big & Small Code)
    const stats = data.stats || {};
    const statTotal = document.getElementById('statTotalLines');
    const statCode = document.getElementById('statCodeLines');
    const statFunc = document.getElementById('statFunctions');
    const statCyclo = document.getElementById('statCyclo');

    if (statTotal) statTotal.textContent = (stats.totalLines || 0).toLocaleString();
    if (statCode) statCode.textContent = (stats.linesOfCode || 0).toLocaleString();
    if (statFunc) statFunc.textContent = (stats.functionCount || 0).toLocaleString();
    if (statCyclo) statCyclo.textContent = stats.cyclomaticComplexity ? `${stats.cyclomaticComplexity} (Score)` : '1';

    // Issues List
    const issuesContainer = document.getElementById('issuesList');
    const applyAllBtn = document.getElementById('applyAllFixesBtn');
    if (!issuesContainer) return;

    issuesContainer.innerHTML = '';
    const issues = data.issues || [];

    if (applyAllBtn) {
      if (issues.length > 0 && issues.some(i => i.fix)) {
        applyAllBtn.style.display = 'inline-flex';
        applyAllBtn.onclick = () => applyAllFixes(issues);
      } else {
        applyAllBtn.style.display = 'none';
      }
    }

    if (issues.length === 0) {
      issuesContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">✓</div>
          <h4>No Issues Detected!</h4>
          <p>Your code passed all static checks and looks clean.</p>
        </div>
      `;
      return;
    }

    issues.forEach(issue => {
      const card = document.createElement('div');
      card.className = `issue-card severity-${issue.type}`;
      
      let badgeLabel = 'Note';
      if (issue.type === 'critical') badgeLabel = 'Critical Bug';
      else if (issue.type === 'warning') badgeLabel = 'Warning';
      else if (issue.type === 'optimization') badgeLabel = 'Optimization';
      else if (issue.type === 'style') badgeLabel = 'Style';

      const lineBadge = issue.line ? `<span class="line-tag" data-line="${issue.line}">Line ${issue.line}</span>` : '';

      card.innerHTML = `
        <div class="issue-header">
          <div class="issue-title-group">
            <span class="severity-pill ${issue.type}">${badgeLabel}</span>
            ${lineBadge}
            <h4 class="issue-title">${escapeHtml(issue.title)}</h4>
          </div>
        </div>
        <div class="issue-body">
          <p class="issue-desc">${escapeHtml(issue.description)}</p>
          ${issue.fix ? `
            <div class="fix-box">
              <div class="fix-header">
                <span class="fix-title">💡 Suggested Fix</span>
                <div class="fix-actions">
                  <button class="btn-sm btn-subtle copy-fix-btn">Copy Fix</button>
                  <button class="btn-sm btn-primary apply-fix-btn">⚡ Apply Fix Directly</button>
                </div>
              </div>
              <pre class="fix-code"><code>${escapeHtml(issue.fix)}</code></pre>
              ${issue.fixExplanation ? `<div class="fix-expl">${escapeHtml(issue.fixExplanation)}</div>` : ''}
            </div>
          ` : ''}
        </div>
      `;

      // Line click to jump in editor
      const lineTag = card.querySelector('.line-tag');
      if (lineTag) {
        lineTag.addEventListener('click', () => {
          state.editorManager.highlightLine(issue.line);
        });
      }

      // Copy Fix
      const copyBtn = card.querySelector('.copy-fix-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText(issue.fix);
          showToast('Fix code copied to clipboard!');
        });
      }

      // Apply Fix Directly
      const applyBtn = card.querySelector('.apply-fix-btn');
      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          applyFixToEditor(issue);
        });
      }

      issuesContainer.appendChild(card);
    });
  }

  function updateCategoryBar(name, val) {
    const bar = document.getElementById(`${name}Bar`);
    const valText = document.getElementById(`${name}Val`);
    if (bar) bar.style.width = `${val}%`;
    if (valText) valText.textContent = `${val}%`;
  }

  /**
   * Directly Patches the Bug in the Editor Code with Visual Glow Animation
   */
  function applyFixToEditor(issue) {
    let code = state.editorManager.getCode();
    const lines = code.split('\n');
    let targetLineToFlash = issue.line || 1;

    // Case 1: Line-specific replacement
    if (issue.line && issue.line <= lines.length) {
      const origLine = lines[issue.line - 1];
      const indentMatch = origLine.match(/^(\s*)/);
      const indent = indentMatch ? indentMatch[1] : '';

      // Format replacement line
      const cleanFix = issue.fix.replace(/^#include\s+<[^>]+>\s*\n/, '');
      lines[issue.line - 1] = indent + cleanFix.trim();
      
      // If header is also required (e.g. missing stdio.h)
      if (issue.fix.startsWith('#include') && !code.includes(issue.fix.split('\n')[0])) {
        const header = issue.fix.split('\n')[0];
        lines.unshift(header);
        targetLineToFlash = issue.line + 1;
      }

      state.editorManager.setCode(lines.join('\n'));
      state.editorManager.flashLine(targetLineToFlash);
      showToast(`✨ Directly repaired line ${issue.line}!`);
      setTimeout(() => runAnalysis(), 350);
      return;
    }

    // Case 2: Memory Leak (malloc without free)
    if (issue.id && issue.id.includes('memory_leak')) {
      // Find malloc pointer variable
      const mallocMatch = code.match(/([a-zA-Z_]\w*)\s*=\s*(?:\([a-zA-Z0-9_* ]+\)\s*)?malloc\s*\(/);
      const ptrName = mallocMatch ? mallocMatch[1] : 'data';

      // Find return statement or end of function that allocated it
      let insertIndex = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('return') && !lines[i].includes('return NULL') && !lines[i].includes('return 0') || lines[i].trim() === '}') {
          insertIndex = i;
          break;
        }
      }

      if (insertIndex !== -1) {
        const indent = '    ';
        lines.splice(insertIndex, 0, `${indent}free(${ptrName});\n${indent}${ptrName} = NULL;`);
        state.editorManager.setCode(lines.join('\n'));
        state.editorManager.flashLine(insertIndex + 1);
        showToast(`✨ Inserted free(${ptrName}) to fix memory leak!`);
        setTimeout(() => runAnalysis(), 350);
        return;
      }
    }

    // Case 3: Missing Header (<stdio.h> or <stdlib.h>)
    if (issue.id && (issue.id.includes('missing_stdio') || issue.id.includes('missing_stdlib'))) {
      const header = issue.id.includes('missing_stdio') ? '#include <stdio.h>' : '#include <stdlib.h>';
      if (!code.includes(header)) {
        lines.unshift(header);
        state.editorManager.setCode(lines.join('\n'));
        state.editorManager.flashLine(1);
        showToast(`✨ Added ${header} at top of file!`);
        setTimeout(() => runAnalysis(), 350);
        return;
      }
    }

    // Case 4: Unused Variable removal
    if (issue.id && issue.id.includes('unused_var')) {
      const varName = issue.id.replace('unused_var_', '');
      for (let i = 0; i < lines.length; i++) {
        if (new RegExp(`\\b${varName}\\b`).test(lines[i])) {
          lines[i] = `    // Removed unused variable: ${varName}`;
          state.editorManager.setCode(lines.join('\n'));
          state.editorManager.flashLine(i + 1);
          showToast(`✨ Cleaned up unused variable '${varName}'!`);
          setTimeout(() => runAnalysis(), 350);
          return;
        }
      }
    }

    // Fallback
    navigator.clipboard.writeText(issue.fix);
    showToast('Fix copied to clipboard for manual placement.');
  }

  /**
   * Fixes all detected issues in sequence
   */
  function applyAllFixes(issues) {
    if (!issues || issues.length === 0) return;

    let code = state.editorManager.getCode();
    let lines = code.split('\n');

    // Sort line-based issues descending to prevent index offset shifting
    const lineIssues = issues.filter(i => i.line).sort((a, b) => b.line - a.line);
    const generalIssues = issues.filter(i => !i.line);

    // Apply line-based fixes
    lineIssues.forEach(iss => {
      if (iss.line <= lines.length) {
        const origLine = lines[iss.line - 1];
        const indentMatch = origLine.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '';
        const cleanFix = iss.fix.replace(/^#include\s+<[^>]+>\s*\n/, '');
        lines[iss.line - 1] = indent + cleanFix.trim();
      }
    });

    // Apply header / memory fixes
    generalIssues.forEach(iss => {
      if (iss.id && iss.id.includes('missing_stdio') && !lines.join('\n').includes('<stdio.h>')) {
        lines.unshift('#include <stdio.h>');
      }
      if (iss.id && iss.id.includes('missing_stdlib') && !lines.join('\n').includes('<stdlib.h>')) {
        lines.unshift('#include <stdlib.h>');
      }
    });

    state.editorManager.setCode(lines.join('\n'));
    showToast('🎉 All fixes applied directly to code editor!');
    setTimeout(() => runAnalysis(), 400);
  }

  /**
   * Flow & Control Graph Visualizer Engine (SVG Interactive Flowchart)
   */
  /**
   * Flow & Control Graph Visualizer Engine (SVG Interactive Flowchart)
   */
  function renderFlowGraph(data) {
    const svg = document.getElementById('graphSvg');
    const container = document.getElementById('graphContainer');
    if (!svg || !container || !data) return;

    svg.innerHTML = '';
    const width = Math.max(520, container.clientWidth || 520);
    const height = 460;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Create SVG Defs (Markers & Gradients)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0284c7" flood-opacity="0.35"/>
      </filter>
    `;
    svg.appendChild(defs);

    if (state.flowMode === 'statePipeline') {
      renderStatePipelineMode(svg, data, width, height);
    } else {
      renderControlFlowMode(svg, data, width, height);
    }
  }

  function renderControlFlowMode(svg, data, width, height) {
    let blocks = (data.stats && (data.stats.controlFlow || (data.stats.controlFlowGraph && data.stats.controlFlowGraph.blocks))) || [];
    
    if (blocks.length === 0) {
      blocks = [
        { id: 'entry', label: '🚀 Program Entry / Start', type: 'entry', line: 1 },
        { id: 'exec', label: '⚙️ Linear Execution Block', type: 'process', line: 1 },
        { id: 'exit', label: '🏁 Program Output / Return', type: 'exit', line: 1 }
      ];
    }

    const blockWidth = Math.min(380, width - 60);
    const blockHeight = 48;
    const startX = (width - blockWidth) / 2;
    let startY = 24;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    blocks.forEach((b, idx) => {
      const blockG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      blockG.setAttribute('transform', `translate(${startX}, ${startY})`);
      blockG.setAttribute('cursor', 'pointer');

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', blockWidth);
      rect.setAttribute('height', blockHeight);
      rect.setAttribute('rx', '8');
      rect.setAttribute('class', `cfg-block-rect type-${b.type || 'process'}`);
      blockG.appendChild(rect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', blockWidth / 2);
      text.setAttribute('y', 29);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('class', 'cfg-block-text');
      text.textContent = b.label;
      blockG.appendChild(text);

      blockG.addEventListener('click', () => {
        if (b.line) {
          state.editorManager.highlightLine(b.line);
          showToast(`Jumped to Line ${b.line}`);
        }
      });

      g.appendChild(blockG);

      // Downward Directional Arrow
      if (idx < blocks.length - 1) {
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const arrowX = width / 2;
        const arrowStartY = startY + blockHeight;
        const arrowEndY = startY + blockHeight + 22;
        arrow.setAttribute('d', `M ${arrowX} ${arrowStartY} L ${arrowX} ${arrowEndY}`);
        arrow.setAttribute('class', 'graph-edge');
        arrow.setAttribute('marker-end', 'url(#arrow)');
        g.appendChild(arrow);
      }

      startY += blockHeight + 24;
    });

    svg.appendChild(g);
    svg.setAttribute('viewBox', `0 0 ${width} ${Math.max(height, startY + 30)}`);
  }

  function renderStatePipelineMode(svg, data, width, height) {
    let pipeline = data.stats?.statePipeline || [];
    if (pipeline.length === 0) {
      pipeline = [
        { step: 1, title: "1. Initialization & Input Setup", desc: "Sets up parameters, stack frames, and array allocations." },
        { step: 2, title: "2. Algorithmic Transformation & Loop Processing", desc: "Executes core computational state transitions and data lookups." },
        { step: 3, title: "3. Boundary Verification & Invariant Checking", desc: "Assesses conditional guards and termination criteria." },
        { step: 4, title: "4. Memory Cleanup & Result Dispatch", desc: "Releases dynamic memory buffers and returns computed values." }
      ];
    }

    const cardWidth = Math.min(440, width - 50);
    const cardHeight = 62;
    const startX = (width - cardWidth) / 2;
    let startY = 24;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    pipeline.forEach((p, idx) => {
      const stepG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      stepG.setAttribute('transform', `translate(${startX}, ${startY})`);

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', cardWidth);
      rect.setAttribute('height', cardHeight);
      rect.setAttribute('rx', '8');
      rect.setAttribute('class', 'pipeline-rect');
      stepG.appendChild(rect);

      const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      title.setAttribute('x', '16');
      title.setAttribute('y', '26');
      title.setAttribute('class', 'pipeline-title');
      title.textContent = p.title;
      stepG.appendChild(title);

      const desc = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      desc.setAttribute('x', '16');
      desc.setAttribute('y', '46');
      desc.setAttribute('class', 'pipeline-desc');
      desc.textContent = p.desc;
      stepG.appendChild(desc);

      g.appendChild(stepG);

      if (idx < pipeline.length - 1) {
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const arrowX = width / 2;
        const arrowStartY = startY + cardHeight;
        const arrowEndY = startY + cardHeight + 20;
        arrow.setAttribute('d', `M ${arrowX} ${arrowStartY} L ${arrowX} ${arrowEndY}`);
        arrow.setAttribute('class', 'graph-edge');
        arrow.setAttribute('marker-end', 'url(#arrow)');
        g.appendChild(arrow);
      }

      startY += cardHeight + 22;
    });

    svg.appendChild(g);
    svg.setAttribute('viewBox', `0 0 ${width} ${Math.max(height, startY + 30)}`);
  }

  function renderEmptyGraphMessage(svg, width, height, msg) {
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', width / 2);
    text.setAttribute('y', height / 2);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#94a3b8');
    text.setAttribute('font-size', '14');
    text.textContent = msg;
    svg.appendChild(text);
  }

  /**
   * 2. Render Complexity Panel & Visual Comparison Scaling Curves
   */
  function renderComplexityPanel(data) {
    const comp = data.complexity || { time: 'O(1)', space: 'O(1)' };
    const opt = data.optimization || {};

    const timeBadge = document.getElementById('timeComplexityBadge');
    const timeExpl = document.getElementById('timeComplexityExpl');
    const bottlenecksList = document.getElementById('bottlenecksList');

    const targetBadge = document.getElementById('compTargetComplexityBadge');
    const targetExpl = document.getElementById('compTargetComplexityExpl');
    const legendUser = document.getElementById('legendUserBigO');
    const legendOpt = document.getElementById('legendOptBigO');

    if (timeBadge) {
      timeBadge.textContent = comp.time;
      timeBadge.className = `complexity-badge ${getComplexityClass(comp.time)}`;
    }
    if (timeExpl) timeExpl.textContent = comp.timeExplanation || 'N/A';

    if (targetBadge) {
      const targetTime = opt.possibleTime || (comp.time.includes('n²') ? 'O(n)' : comp.time);
      targetBadge.textContent = targetTime;
      targetBadge.className = `complexity-badge ${getComplexityClass(targetTime)}`;
    }
    if (targetExpl) targetExpl.textContent = opt.technique || 'Optimal execution bounds.';

    if (legendUser) legendUser.textContent = comp.time;
    if (legendOpt) legendOpt.textContent = opt.possibleTime || 'O(n)';

    // Functions Breakdown Grid
    const funcCard = document.getElementById('functionsBreakdownCard');
    const funcGrid = document.getElementById('functionsListGrid');
    const funcs = data.stats?.functions || [];

    if (funcCard && funcGrid) {
      if (funcs.length > 0) {
        funcCard.style.display = 'block';
        funcGrid.innerHTML = '';
        funcs.forEach(fn => {
          const item = document.createElement('div');
          item.className = 'func-item';
          item.innerHTML = `
            <div class="func-item-header">
              <span class="func-name">${escapeHtml(fn.name)}()</span>
              <span class="func-line" data-line="${fn.line}">Line ${fn.line}</span>
            </div>
            <div class="func-meta">
              <span class="func-params">(${escapeHtml(fn.params || '')})</span>
            </div>
          `;
          const lineSpan = item.querySelector('.func-line');
          if (lineSpan) {
            lineSpan.addEventListener('click', () => {
              state.editorManager.highlightLine(fn.line);
            });
          }
          funcGrid.appendChild(item);
        });
      } else {
        funcCard.style.display = 'none';
      }
    }

    // Bottlenecks
    if (bottlenecksList) {
      bottlenecksList.innerHTML = '';
      const bList = comp.bottlenecks || [];
      if (bList.length === 0) {
        bottlenecksList.innerHTML = `<li class="clean-item">✓ No significant computational bottlenecks found.</li>`;
      } else {
        bList.forEach(b => {
          const li = document.createElement('li');
          li.className = 'bottleneck-item';
          li.innerHTML = `<span class="bullet">⚠</span> ${escapeHtml(b)}`;
          bottlenecksList.appendChild(li);
        });
      }
    }

    // Render Visual Interactive Comparison Graph (Curves Chart)
    renderComplexityComparisonCurves(comp.time, opt.possibleTime || 'O(n)');
  }

  function getComplexityClass(bigO) {
    if (bigO.includes('1') || bigO.includes('log')) return 'fast';
    if (bigO.includes('n²') || bigO.includes('n^2') || bigO.includes('n³')) return 'slow';
    if (bigO.includes('2^n') || bigO.includes('!')) return 'hazard';
    return 'medium';
  }

  /**
   * Interactive Complexity Comparison Graph (User Code Curve vs Optimized Curve)
   */
  function renderComplexityComparisonCurves(userBigO, optBigO) {
    const svg = document.getElementById('complexityComparisonSvg');
    const slider = document.getElementById('inputSizeSlider');
    const sliderNVal = document.getElementById('sliderNVal');
    const speedupVal = document.getElementById('speedupFactorVal');
    if (!svg) return;

    svg.innerHTML = '';
    const width = 600;
    const height = 240;
    const padding = { top: 25, right: 35, bottom: 35, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // SVG Defs (Gradients & Filters)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="userGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.0"/>
      </linearGradient>
      <linearGradient id="optGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
      </linearGradient>
      <filter id="curveGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    `;
    svg.appendChild(defs);

    // Draw Grid Lines & Axes
    const gridG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', padding.left);
      line.setAttribute('y1', y);
      line.setAttribute('x2', padding.left + chartW);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.07)');
      line.setAttribute('stroke-dasharray', '4, 4');
      gridG.appendChild(line);
    }
    for (let i = 0; i <= 5; i++) {
      const x = padding.left + (chartW / 5) * i;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', padding.top);
      line.setAttribute('x2', x);
      line.setAttribute('y2', padding.top + chartH);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.05)');
      gridG.appendChild(line);
    }

    // Axis Labels
    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', 14);
    yAxisLabel.setAttribute('y', padding.top + chartH / 2);
    yAxisLabel.setAttribute('transform', `rotate(-90 14 ${padding.top + chartH / 2})`);
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('fill', '#64748b');
    yAxisLabel.setAttribute('font-size', '11');
    yAxisLabel.setAttribute('font-family', 'sans-serif');
    yAxisLabel.textContent = 'Operations (O)';
    gridG.appendChild(yAxisLabel);

    const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xAxisLabel.setAttribute('x', padding.left + chartW / 2);
    xAxisLabel.setAttribute('y', height - 8);
    xAxisLabel.setAttribute('text-anchor', 'middle');
    xAxisLabel.setAttribute('fill', '#64748b');
    xAxisLabel.setAttribute('font-size', '11');
    xAxisLabel.setAttribute('font-family', 'sans-serif');
    xAxisLabel.textContent = 'Input Size (N) ➔';
    gridG.appendChild(xAxisLabel);

    svg.appendChild(gridG);

    // Calculate Points for Curve Path
    function computePoints(bigO) {
      const points = [];
      const steps = 60;
      for (let s = 0; s <= steps; s++) {
        const normX = s / steps; // 0 to 1
        let normY = 0;

        if (bigO.includes('2^n')) {
          normY = Math.pow(normX, 4); // Steep exponential
        } else if (bigO.includes('n³')) {
          normY = Math.pow(normX, 3); // Cubic
        } else if (bigO.includes('n²') || bigO.includes('n^2')) {
          normY = Math.pow(normX, 2); // Quadratic
        } else if (bigO.includes('n log')) {
          normY = normX * 0.55 + 0.1 * Math.pow(normX, 1.4);
        } else if (bigO.includes('log')) {
          normY = Math.log10(1 + normX * 9) * 0.18; // Very flat log
        } else if (bigO.includes('1')) {
          normY = 0.05; // Flat constant
        } else {
          normY = normX * 0.35; // Linear
        }

        const px = padding.left + normX * chartW;
        const py = padding.top + chartH - (normY * chartH);
        points.push({ x: px, y: py });
      }
      return points;
    }

    function createSmoothPath(points) {
      if (points.length === 0) return '';
      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }
      return d;
    }

    const userPoints = computePoints(userBigO);
    const optPoints = computePoints(optBigO);

    // Render User Curve Area & Line (Red)
    const userAreaD = `${createSmoothPath(userPoints)} L ${padding.left + chartW} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;
    const userArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    userArea.setAttribute('d', userAreaD);
    userArea.setAttribute('fill', 'url(#userGrad)');
    svg.appendChild(userArea);

    const userPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    userPath.setAttribute('d', createSmoothPath(userPoints));
    userPath.setAttribute('fill', 'none');
    userPath.setAttribute('stroke', '#f43f5e');
    userPath.setAttribute('stroke-width', '3');
    userPath.setAttribute('filter', 'url(#curveGlow)');
    svg.appendChild(userPath);

    // Render Optimized Curve Area & Line (Green)
    const optAreaD = `${createSmoothPath(optPoints)} L ${padding.left + chartW} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`;
    const optArea = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    optArea.setAttribute('d', optAreaD);
    optArea.setAttribute('fill', 'url(#optGrad)');
    svg.appendChild(optArea);

    const optPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    optPath.setAttribute('d', createSmoothPath(optPoints));
    optPath.setAttribute('fill', 'none');
    optPath.setAttribute('stroke', '#10b981');
    optPath.setAttribute('stroke-width', '3');
    optPath.setAttribute('filter', 'url(#curveGlow)');
    svg.appendChild(optPath);

    // Interactive Vertical Guide Line (Crosshair / Probe Tracker)
    const trackerLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    trackerLine.setAttribute('stroke', 'rgba(56, 189, 248, 0.45)');
    trackerLine.setAttribute('stroke-width', '1.5');
    trackerLine.setAttribute('stroke-dasharray', '4, 4');
    trackerLine.setAttribute('y1', padding.top);
    trackerLine.setAttribute('y2', padding.top + chartH);
    svg.appendChild(trackerLine);

    // User Code Probe Group (Red Moving Dot + Pulsing Halo + Value Tag)
    const userProbeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    userProbeG.setAttribute('class', 'probe-group user-probe');
    userProbeG.innerHTML = `
      <circle class="probe-halo-user" r="11" fill="rgba(244, 63, 94, 0.35)"/>
      <circle class="probe-dot-user" r="5.5" fill="#f43f5e" stroke="#ffffff" stroke-width="1.8"/>
      <g class="probe-tag-group" transform="translate(10, -12)">
        <rect class="probe-tag-bg" x="0" y="-12" width="76" height="18" rx="4" fill="rgba(11, 15, 28, 0.9)" stroke="#f43f5e" stroke-width="1"/>
        <text class="probe-tag-text user-tag-text" x="6" y="1" fill="#fda4af" font-size="10.5" font-weight="700" font-family="monospace">0 ops</text>
      </g>
    `;
    svg.appendChild(userProbeG);

    // Optimized Code Probe Group (Green Moving Dot + Pulsing Halo + Value Tag)
    const optProbeG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    optProbeG.setAttribute('class', 'probe-group opt-probe');
    optProbeG.innerHTML = `
      <circle class="probe-halo-opt" r="11" fill="rgba(16, 185, 129, 0.35)"/>
      <circle class="probe-dot-opt" r="5.5" fill="#10b981" stroke="#ffffff" stroke-width="1.8"/>
      <g class="probe-tag-group" transform="translate(10, 10)">
        <rect class="probe-tag-bg" x="0" y="-12" width="76" height="18" rx="4" fill="rgba(11, 15, 28, 0.9)" stroke="#10b981" stroke-width="1"/>
        <text class="probe-tag-text opt-tag-text" x="6" y="1" fill="#6ee7b7" font-size="10.5" font-weight="700" font-family="monospace">0 ops</text>
      </g>
    `;
    svg.appendChild(optProbeG);

    // Helper to calculate normalized Y for Big-O
    function getNormY(bigO, normX) {
      if (bigO.includes('2^n')) return Math.pow(normX, 4);
      if (bigO.includes('n³')) return Math.pow(normX, 3);
      if (bigO.includes('n²') || bigO.includes('n^2')) return Math.pow(normX, 2);
      if (bigO.includes('n log')) return normX * 0.55 + 0.1 * Math.pow(normX, 1.4);
      if (bigO.includes('log')) return Math.log10(1 + normX * 9) * 0.18;
      if (bigO.includes('1')) return 0.05;
      return normX * 0.35;
    }

    // Helper to format operation numbers compactly (e.g. 1.2K, 5.0M)
    function formatOpsCompact(ops) {
      if (ops === Infinity || ops > 1e14) return '> 10¹⁴ ops';
      if (ops >= 1e9) return (ops / 1e9).toFixed(1) + 'B ops';
      if (ops >= 1e6) return (ops / 1e6).toFixed(1) + 'M ops';
      if (ops >= 1e3) return (ops / 1e3).toFixed(1) + 'K ops';
      return Math.round(ops).toLocaleString() + ' ops';
    }

    // Interactive Slider Synchronization & Moving Probes
    function updateCalculations(n) {
      const numN = Number(n);
      if (sliderNVal) sliderNVal.textContent = numN.toLocaleString();

      let userOps = 0;
      let optOps = 0;

      // User code ops calculation
      if (userBigO.includes('2^n')) userOps = numN > 30 ? Infinity : Math.pow(2, numN);
      else if (userBigO.includes('n³')) userOps = numN * numN * numN;
      else if (userBigO.includes('n²') || userBigO.includes('n^2')) userOps = numN * numN;
      else if (userBigO.includes('n log')) userOps = numN * Math.log2(numN);
      else if (userBigO.includes('log')) userOps = Math.log2(numN);
      else if (userBigO.includes('1')) userOps = 1;
      else userOps = numN;

      // Opt code ops calculation
      if (optBigO.includes('1')) optOps = 1;
      else if (optBigO.includes('log')) optOps = Math.log2(numN);
      else if (optBigO.includes('n log')) optOps = numN * Math.log2(numN);
      else optOps = numN;

      if (speedupVal) {
        if (userOps === Infinity) {
          speedupVal.textContent = '∞ Exponential Speedup';
        } else {
          const ratio = Math.max(1, Math.round(userOps / Math.max(1, optOps)));
          speedupVal.textContent = `${ratio.toLocaleString()}x Faster`;
        }
      }

      // Calculate smooth normalized X coordinate (log-scaled slider mapping from 10 to 10,000)
      const minLog = Math.log10(10);
      const maxLog = Math.log10(10000);
      const curLog = Math.log10(Math.max(10, Math.min(10000, numN)));
      const normX = Math.max(0.02, Math.min(0.98, (curLog - minLog) / (maxLog - minLog)));

      const normUserY = getNormY(userBigO, normX);
      const normOptY = getNormY(optBigO, normX);

      const px = padding.left + normX * chartW;
      const userPy = padding.top + chartH - (normUserY * chartH);
      const optPy = padding.top + chartH - (normOptY * chartH);

      // Move vertical tracking guide line
      trackerLine.setAttribute('x1', px);
      trackerLine.setAttribute('x2', px);

      // Move User Probe Dot
      userProbeG.setAttribute('transform', `translate(${px}, ${userPy})`);
      const userTagText = userProbeG.querySelector('.user-tag-text');
      const userTagBg = userProbeG.querySelector('.probe-tag-bg');
      if (userTagText) {
        const textStr = formatOpsCompact(userOps);
        userTagText.textContent = textStr;
        if (userTagBg) {
          const textW = Math.max(68, textStr.length * 7.5 + 12);
          userTagBg.setAttribute('width', textW);
          // Flip tag to left if near right edge
          const tagGroup = userProbeG.querySelector('.probe-tag-group');
          if (tagGroup) {
            if (px > width - 110) {
              tagGroup.setAttribute('transform', `translate(${-textW - 10}, -12)`);
            } else {
              tagGroup.setAttribute('transform', `translate(10, -12)`);
            }
          }
        }
      }

      // Move Optimized Probe Dot
      optProbeG.setAttribute('transform', `translate(${px}, ${optPy})`);
      const optTagText = optProbeG.querySelector('.opt-tag-text');
      const optTagBg = optProbeG.querySelector('.probe-tag-bg');
      if (optTagText) {
        const textStr = formatOpsCompact(optOps);
        optTagText.textContent = textStr;
        if (optTagBg) {
          const textW = Math.max(68, textStr.length * 7.5 + 12);
          optTagBg.setAttribute('width', textW);
          // Flip tag to left if near right edge
          const tagGroup = optProbeG.querySelector('.probe-tag-group');
          if (tagGroup) {
            if (px > width - 110) {
              tagGroup.setAttribute('transform', `translate(${-textW - 10}, 10)`);
            } else {
              tagGroup.setAttribute('transform', `translate(10, 10)`);
            }
          }
        }
      }
    }

    if (slider) {
      slider.oninput = (e) => {
        updateCalculations(e.target.value);
      };
      updateCalculations(slider.value);
    }

    // Direct Chart Click to Set N
    svg.style.cursor = 'pointer';
    svg.onclick = (e) => {
      const rect = svg.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * width;
      if (clickX >= padding.left && clickX <= padding.left + chartW) {
        const normClickX = (clickX - padding.left) / chartW;
        const minLog = Math.log10(10);
        const maxLog = Math.log10(10000);
        const targetLog = minLog + normClickX * (maxLog - minLog);
        const targetN = Math.round(Math.pow(10, targetLog));
        if (slider) {
          slider.value = targetN;
          updateCalculations(targetN);
        }
      }
    };
  }

  /**
   * 3. Render Optimize Panel
   */
  function renderOptimizePanel(data) {
    const opt = data.optimization || {};
    const beforeTime = document.getElementById('optBeforeTime');
    const afterTime = document.getElementById('optAfterTime');
    const techniqueBadge = document.getElementById('optTechnique');
    const whyBetterText = document.getElementById('optWhyBetter');
    const optimizedCodeBlock = document.getElementById('optCodeBlock');
    const copyOptBtn = document.getElementById('copyOptBtn');
    const replaceEditorBtn = document.getElementById('replaceWithOptBtn');

    if (beforeTime) beforeTime.textContent = opt.currentComplexity || data.complexity?.time || 'O(n²)';
    if (afterTime) afterTime.textContent = opt.possibleTime || 'O(n)';
    if (techniqueBadge) techniqueBadge.textContent = opt.technique || 'Algorithmic Optimization';
    if (whyBetterText) whyBetterText.textContent = opt.whyBetter || 'Optimized approach reduces operations and improves memory efficiency.';
    
    if (optimizedCodeBlock) {
      optimizedCodeBlock.textContent = opt.optimizedCode || '// No optimization needed.';
    }

    if (copyOptBtn) {
      copyOptBtn.onclick = () => {
        navigator.clipboard.writeText(opt.optimizedCode || '');
        showToast('Optimized code copied to clipboard!');
      };
    }

    if (replaceEditorBtn) {
      replaceEditorBtn.onclick = () => {
        if (opt.optimizedCode) {
          state.editorManager.setCode(opt.optimizedCode);
          showToast('Replaced editor code with optimized version!');
          setTimeout(() => runAnalysis(), 300);
        }
      };
    }
  }

  /**
   * 4. Render "Teach Me" Tutor Panel
   */
  function renderTeachMePanel(data) {
    const teach = data.teachMe || {};
    const conceptTitle = document.getElementById('teachConceptTitle');
    const difficultyBadge = document.getElementById('teachDifficulty');
    const explanationText = document.getElementById('teachExplanation');
    const takeawaysList = document.getElementById('teachTakeawaysList');
    const diagramContainer = document.getElementById('teachDiagramContainer');

    if (conceptTitle) conceptTitle.textContent = teach.concept || 'Computer Science Concepts';
    if (difficultyBadge) {
      difficultyBadge.textContent = teach.difficulty || 'Beginner';
      difficultyBadge.className = `diff-badge ${(teach.difficulty || 'beginner').toLowerCase()}`;
    }
    if (explanationText) {
      explanationText.innerHTML = formatMarkdownText(teach.explanation || 'No concept explanation available.');
    }

    if (takeawaysList) {
      takeawaysList.innerHTML = '';
      (teach.keyTakeaways || []).forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="check-icon">✓</span> ${escapeHtml(item)}`;
        takeawaysList.appendChild(li);
      });
    }

    // Render interactive memory visualizer if available
    if (diagramContainer) {
      if (teach.diagram && teach.diagram.cells) {
        diagramContainer.style.display = 'block';
        let diagHtml = `
          <div class="memory-diagram">
            <h5 class="diagram-title">${escapeHtml(teach.diagram.title || 'Memory Layout')}</h5>
            <div class="memory-cells-row">
        `;
        teach.diagram.cells.forEach(cell => {
          diagHtml += `
            <div class="mem-cell ${cell.status}">
              <div class="mem-index">${cell.index}</div>
              <div class="mem-label">${cell.label}</div>
            </div>
          `;
        });
        diagHtml += `</div></div>`;
        diagramContainer.innerHTML = diagHtml;
      } else {
        diagramContainer.style.display = 'none';
      }
    }
  }

  /**
   * 5. Render Test Cases Panel
   */
  function renderTestCasesPanel(data) {
    const container = document.getElementById('testCasesList');
    const copyTestsBtn = document.getElementById('copyAllTestsBtn');
    if (!container) return;

    container.innerHTML = '';
    const tests = data.testCases || [];

    if (tests.length === 0) {
      container.innerHTML = `<div class="empty-state"><p>No test cases generated.</p></div>`;
      return;
    }

    tests.forEach((tc, idx) => {
      const card = document.createElement('div');
      card.className = 'test-card';
      card.innerHTML = `
        <div class="test-header">
          <span class="test-num">Test #${idx + 1}</span>
          <span class="test-name">${escapeHtml(tc.name)}</span>
        </div>
        <div class="test-body">
          <div class="test-grid">
            <div class="test-box">
              <span class="box-label">INPUT</span>
              <code>${escapeHtml(tc.input)}</code>
            </div>
            <div class="test-box">
              <span class="box-label">EXPECTED OUTPUT</span>
              <code>${escapeHtml(tc.expectedOutput)}</code>
            </div>
          </div>
          <div class="test-purpose">
            <strong>Target:</strong> ${escapeHtml(tc.purpose)}
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    if (copyTestsBtn) {
      copyTestsBtn.onclick = () => {
        const text = tests.map((t, i) => `Test #${i+1}: ${t.name}\nInput: ${t.input}\nExpected: ${t.expectedOutput}\nPurpose: ${t.purpose}\n`).join('\n---\n\n');
        navigator.clipboard.writeText(text);
        showToast('All test cases copied to clipboard!');
      };
    }
  }

  // Toast Notification
  function showToast(msg) {
    let toast = document.getElementById('appToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'appToast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 3000);
  }

  // Basic HTML Escaper & Markdown Formatter
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMarkdownText(text) {
    return text
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  }

  /**
   * Neural Network Ambient Particle Background (AI Developer Grid)
   */
  /**
   * Neural Network Ambient Particle Background with Dynamic Theme Colors
   */
  function initNeuralBackground() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      createNodes();
    });

    const nodeCount = Math.min(48, Math.floor((width * height) / 28000));
    let nodes = [];
    let pulses = [];
    let mouse = { x: -1000, y: -1000, active: false };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    function getThemeColors() {
      const theme = state.theme || 'developer-grid';
      if (theme === 'matrix') {
        return { c1: '#22c55e', c2: '#10b981', glow1: '#22c55e', glow2: '#10b981', rgb1: '34, 197, 94', rgb2: '16, 185, 129' };
      } else if (theme === 'cyberpunk') {
        return { c1: '#ec4899', c2: '#a855f7', glow1: '#ec4899', glow2: '#a855f7', rgb1: '236, 72, 153', rgb2: '168, 85, 247' };
      } else if (theme === 'tokyo-night') {
        return { c1: '#38bdf8', c2: '#6366f1', glow1: '#38bdf8', glow2: '#6366f1', rgb1: '56, 189, 248', rgb2: '99, 102, 241' };
      } else if (theme === 'obsidian') {
        return { c1: '#f59e0b', c2: '#e2e8f0', glow1: '#f59e0b', glow2: '#e2e8f0', rgb1: '245, 158, 11', rgb2: '226, 232, 240' };
      }
      return { c1: '#38bdf8', c2: '#a78bfa', glow1: '#38bdf8', glow2: '#a78bfa', rgb1: '56, 189, 248', rgb2: '167, 139, 250' };
    }

    function createNodes() {
      nodes = [];
      pulses = [];
      const pal = getThemeColors();
      for (let i = 0; i < nodeCount; i++) {
        const isPrimary = Math.random() > 0.5;
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.8 + 1.2,
          isPrimary,
          baseAlpha: Math.random() * 0.4 + 0.35
        });
      }
    }

    window.recreateNeuralNodes = createNodes;
    createNodes();

    // Occasional neural pulse generator
    setInterval(() => {
      if (nodes.length < 2) return;
      const srcIdx = Math.floor(Math.random() * nodes.length);
      let bestDist = Infinity;
      let targetIdx = -1;
      for (let j = 0; j < nodes.length; j++) {
        if (j === srcIdx) continue;
        const dx = nodes[srcIdx].x - nodes[j].x;
        const dy = nodes[srcIdx].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 150 && d < bestDist) {
          bestDist = d;
          targetIdx = j;
        }
      }
      if (targetIdx !== -1 && pulses.length < 12) {
        pulses.push({
          from: nodes[srcIdx],
          to: nodes[targetIdx],
          progress: 0,
          speed: 0.015 + Math.random() * 0.015,
          isPrimary: nodes[srcIdx].isPrimary
        });
      }
    }, 800);

    function animate() {
      ctx.clearRect(0, 0, width, height);
      const pal = getThemeColors();

      // Update & Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            n.x -= (dx / dist) * 0.3;
            n.y -= (dy / dist) * 0.3;
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.isPrimary
          ? `rgba(${pal.rgb1}, ${n.baseAlpha})` 
          : `rgba(${pal.rgb2}, ${n.baseAlpha})`;
        ctx.shadowColor = n.isPrimary ? pal.glow1 : pal.glow2;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect nearby nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.22;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = n.isPrimary 
              ? `rgba(${pal.rgb1}, ${lineAlpha})` 
              : `rgba(${pal.rgb2}, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Update & Draw Pulses
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        pulse.progress += pulse.speed;

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const px = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
        const py = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = pulse.isPrimary ? pal.c1 : pal.c2;
        ctx.shadowColor = pulse.isPrimary ? pal.glow1 : pal.glow2;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  // 6. Initialize Neural Background
  initNeuralBackground();
});
