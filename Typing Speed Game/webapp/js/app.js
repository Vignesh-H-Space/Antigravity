/**
 * CyberType Application Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const wordsWrapper = document.getElementById('words-wrapper');
  const wordsContainer = document.getElementById('words-container');
  const wordsText = document.getElementById('words-text') || wordsContainer;
  const typingInput = document.getElementById('typing-input');
  const caret = document.getElementById('caret');

  const liveTimer = document.getElementById('live-timer');
  const liveWpm = document.getElementById('live-wpm');
  const liveAccuracy = document.getElementById('live-accuracy');
  const counterLabel = document.getElementById('counter-label');

  const modeButtons = document.querySelectorAll('.mode-btn');
  const modeOptionsContainer = document.getElementById('mode-options-container');
  const restartBtn = document.getElementById('restart-btn');
  const virtualKeyboard = document.getElementById('keyboard');

  const themeBtn = document.getElementById('theme-btn');
  const themeMenu = document.getElementById('theme-menu');
  const currentThemeName = document.getElementById('current-theme-name');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioLabel = document.getElementById('audio-label');
  const statsHistoryBtn = document.getElementById('stats-history-btn');

  // Modals
  const resultsModal = document.getElementById('results-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalNextBtn = document.getElementById('modal-next-btn');

  const historyModal = document.getElementById('history-modal');
  const closeHistoryBtn = document.getElementById('close-history-btn');
  const historyRows = document.getElementById('history-rows');

  // Stats Result Elements
  const resultWpm = document.getElementById('result-wpm');
  const resultAccuracy = document.getElementById('result-accuracy');
  const resultRaw = document.getElementById('result-raw');
  const resultChars = document.getElementById('result-chars');
  const resultConsistency = document.getElementById('result-consistency');
  const resultTime = document.getElementById('result-time');
  const weakKeysList = document.getElementById('weak-keys-list');
  const chartCanvas = document.getElementById('wpm-chart');

  // PBs
  const pb15s = document.getElementById('pb-15s');
  const pb30s = document.getElementById('pb-30s');
  const pb60s = document.getElementById('pb-60s');

  // State Variables
  let currentMode = 'time'; // 'time', 'words', 'quote', 'code'
  let modeSetting = 30; // default 30s or 25 words
  let isTestActive = false;
  let isTestFinished = false;
  let startTime = null;
  let timerInterval = null;
  let timeRemaining = 30;
  let elapsedSeconds = 0;

  let targetWords = [];
  let currentWordIndex = 0;
  let currentCharIndex = 0;

  let keystrokesTotal = 0;
  let keystrokesCorrect = 0;
  let keystrokesIncorrect = 0;
  let extraCharsCount = 0;
  let missedCharsCount = 0;

  let keyErrorCounts = {};
  let timelineData = []; // [{ sec, wpm, rawWpm }]

  // Virtual Keyboard Layout definition
  const keyboardRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'backspace'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ['space']
  ];

  // Initialize
  initKeyboard();
  loadSavedSettings();
  setupEventListeners();
  resetTest();

  // Functions

  function initKeyboard() {
    virtualKeyboard.innerHTML = '';
    keyboardRows.forEach(row => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'keyboard-row';
      row.forEach(k => {
        const keyDiv = document.createElement('div');
        keyDiv.className = 'key';
        if (k === 'space') {
          keyDiv.classList.add('space');
          keyDiv.textContent = 'space';
          keyDiv.dataset.key = ' ';
        } else if (k === 'backspace') {
          keyDiv.classList.add('wide');
          keyDiv.textContent = '⌫ back';
          keyDiv.dataset.key = 'backspace';
        } else {
          keyDiv.textContent = k;
          keyDiv.dataset.key = k;
        }

        // Click / Touch Interactivity
        keyDiv.addEventListener('mousedown', (e) => {
          e.preventDefault();
          handleVirtualKeyClick(k);
        });

        rowDiv.appendChild(keyDiv);
      });
      virtualKeyboard.appendChild(rowDiv);
    });
  }

  function handleVirtualKeyClick(keyVal) {
    if (isTestFinished) return;
    typingInput.focus();

    highlightVirtualKey(keyVal === 'space' ? ' ' : keyVal);

    if (keyVal === 'backspace') {
      if (typingInput.value.length > 0) {
        typingInput.value = typingInput.value.slice(0, -1);
        handleTypingInput();
        window.keyAudio.playClick(false, false);
      }
      return;
    }

    const charTyped = keyVal === 'space' ? ' ' : keyVal;

    // Trigger keydown logic (audio, stats tally, spacebar advance)
    handleKeyDown({ key: charTyped });

    if (charTyped !== ' ') {
      typingInput.value += charTyped;
      handleTypingInput();
    }
  }

  function setupEventListeners() {
    // Focus input on clicking text box
    wordsWrapper.addEventListener('click', () => {
      typingInput.focus();
    });

    // Handle Input Typing
    typingInput.addEventListener('input', handleTypingInput);
    typingInput.addEventListener('keydown', handleKeyDown);

    // Global Keybindings
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        resetTest();
        typingInput.focus();
      }
      if (e.key === 'Escape') {
        closeModals();
      }
    });

    // Controls
    restartBtn.addEventListener('click', resetTest);
    modalNextBtn.addEventListener('click', () => {
      closeModals();
      resetTest();
    });

    // Theme selector
    themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
      themeMenu.classList.add('hidden');
    });

    document.querySelectorAll('.theme-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const themeId = e.currentTarget.dataset.themeId;
        setTheme(themeId);
      });
    });

    // Audio synthesizer toggle
    audioToggleBtn.addEventListener('click', () => {
      const newMode = window.keyAudio.nextMode();
      audioLabel.textContent = newMode.charAt(0).toUpperCase() + newMode.slice(1);
    });

    // Mode Selector
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        modeButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentMode = e.currentTarget.dataset.mode;
        renderModeOptions();
        resetTest();
      });
    });

    // Window Resize
    window.addEventListener('resize', updateCaretPosition);

    // Modals
    closeModalBtn.addEventListener('click', closeModals);
    statsHistoryBtn.addEventListener('click', showHistoryModal);
    closeHistoryBtn.addEventListener('click', closeModals);
  }

  function renderModeOptions() {
    modeOptionsContainer.innerHTML = '';

    let options = [];
    if (currentMode === 'time') {
      options = [15, 30, 60, 120];
      counterLabel.textContent = 'Time';
      if (!options.includes(modeSetting)) modeSetting = 30;
    } else if (currentMode === 'words') {
      options = [10, 25, 50, 100];
      counterLabel.textContent = 'Words';
      if (!options.includes(modeSetting)) modeSetting = 25;
    } else if (currentMode === 'quote' || currentMode === 'code') {
      options = ['short', 'medium', 'long'];
      counterLabel.textContent = currentMode === 'quote' ? 'Quote' : 'Code';
      if (!options.includes(modeSetting)) modeSetting = 'medium';
    }

    options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.className = `option-btn ${opt === modeSetting ? 'active' : ''}`;
      btn.dataset.value = opt;
      btn.textContent = typeof opt === 'number' ? (currentMode === 'time' ? `${opt}s` : opt) : opt;

      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        modeSetting = opt;
        resetTest();
      });
      modeOptionsContainer.appendChild(btn);
    });
  }

  function generateText() {
    const bank = window.WORD_BANKS || {};
    let words = [];

    if (currentMode === 'time' || currentMode === 'words') {
      const list = bank.standard || ['the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'];
      const count = currentMode === 'words' ? parseInt(modeSetting, 10) : 100;
      for (let i = 0; i < count; i++) {
        words.push(list[Math.floor(Math.random() * list.length)]);
      }
    } else if (currentMode === 'quote') {
      const quotesCategory = (bank.quotes && bank.quotes[modeSetting]) ? bank.quotes[modeSetting] : [
        "In the middle of difficulty lies opportunity."
      ];
      const q = quotesCategory[Math.floor(Math.random() * quotesCategory.length)];
      words = q.split(' ');
    } else if (currentMode === 'code') {
      const codeCategory = (bank.code && bank.code[modeSetting]) ? bank.code[modeSetting] : [
        "const calculateWPM = (chars, time) => Math.round((chars / 5) / (time / 60));"
      ];
      const codeSnippet = codeCategory[Math.floor(Math.random() * codeCategory.length)];
      words = codeSnippet.split(' ');
    }

    targetWords = words;
  }

  function renderWords() {
    wordsText.innerHTML = '';
    targetWords.forEach((wordStr, wIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      wordSpan.dataset.wordIndex = wIndex;

      wordStr.split('').forEach((char, cIndex) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = char;
        charSpan.dataset.charIndex = cIndex;
        wordSpan.appendChild(charSpan);
      });

      wordsText.appendChild(wordSpan);
    });
  }

  function resetTest() {
    clearInterval(timerInterval);
    isTestActive = false;
    isTestFinished = false;
    startTime = null;
    elapsedSeconds = 0;
    currentWordIndex = 0;
    currentCharIndex = 0;
    keystrokesTotal = 0;
    keystrokesCorrect = 0;
    keystrokesIncorrect = 0;
    extraCharsCount = 0;
    missedCharsCount = 0;
    keyErrorCounts = {};
    timelineData = [];

    typingInput.value = '';

    generateText();
    renderWords();

    if (currentMode === 'time') {
      timeRemaining = parseInt(modeSetting, 10);
      liveTimer.textContent = `${timeRemaining}s`;
    } else {
      liveTimer.textContent = `0/${targetWords.length}`;
    }

    liveWpm.textContent = '0';
    liveAccuracy.textContent = '100%';

    wordsContainer.style.transform = 'translateY(0px)';
    requestAnimationFrame(updateCaretPosition);
    clearKeyHighlights();
  }

  function startTest() {
    isTestActive = true;
    startTime = Date.now();

    timerInterval = setInterval(() => {
      elapsedSeconds++;
      if (currentMode === 'time') {
        timeRemaining--;
        liveTimer.textContent = `${timeRemaining}s`;
        if (timeRemaining <= 0) {
          finishTest();
        }
      }

      // Record timeline stats every second
      const timeInMin = elapsedSeconds / 60.0;
      const wpmVal = Math.round((keystrokesCorrect / 5.0) / timeInMin);
      const rawWpmVal = Math.round((keystrokesTotal / 5.0) / timeInMin);

      timelineData.push({
        sec: elapsedSeconds,
        wpm: isNaN(wpmVal) || !isFinite(wpmVal) ? 0 : wpmVal,
        rawWpm: isNaN(rawWpmVal) || !isFinite(rawWpmVal) ? 0 : rawWpmVal
      });

      liveWpm.textContent = timelineData[timelineData.length - 1].wpm;

    }, 1000);
  }

  function handleTypingInput(e) {
    if (isTestFinished) return;

    if (!isTestActive) {
      startTest();
    }

    const currentVal = typingInput.value;
    const currentWordStr = targetWords[currentWordIndex] || '';
    const wordSpans = wordsText.children;
    const currentWordSpan = wordSpans[currentWordIndex];

    if (!currentWordSpan) return;

    const charSpans = currentWordSpan.querySelectorAll('.char:not(.extra)');
    
    // Clear extra chars
    const extraSpans = currentWordSpan.querySelectorAll('.extra');
    extraSpans.forEach(s => s.remove());

    // Update characters in current word
    for (let i = 0; i < Math.max(currentVal.length, charSpans.length); i++) {
      if (i < currentVal.length) {
        if (i < charSpans.length) {
          const expected = currentWordStr[i];
          const typed = currentVal[i];
          if (expected === typed) {
            charSpans[i].className = 'char correct';
          } else {
            charSpans[i].className = 'char incorrect';
          }
        } else {
          // Extra characters typed
          const extraSpan = document.createElement('span');
          extraSpan.className = 'char extra';
          extraSpan.textContent = currentVal[i];
          currentWordSpan.appendChild(extraSpan);
        }
      } else {
        if (i < charSpans.length) {
          charSpans[i].className = 'char';
        }
      }
    }

    currentCharIndex = currentVal.length;

    // Auto finish if typing final character of the final word
    if (currentWordIndex === targetWords.length - 1 && currentVal === currentWordStr) {
      finishTest();
      return;
    }

    scrollWordsContainerIfNeeded();
    requestAnimationFrame(updateCaretPosition);
    updateLiveMetrics();
  }

  function handleKeyDown(e) {
    if (isTestFinished) return;

    const key = e.key;

    // Highlight key on virtual keyboard
    highlightVirtualKey(key);

    // Audio click trigger
    if (key === ' ') {
      window.keyAudio.playClick(true, false);
    } else if (key.length === 1) {
      window.keyAudio.playClick(false, false);
    }

    // Spacebar to advance word
    if (key === ' ') {
      e.preventDefault();
      const currentVal = typingInput.value;
      if (currentVal.length === 0) return;

      const currentWordStr = targetWords[currentWordIndex];
      const wordSpan = wordsText.children[currentWordIndex];

      // Mark error if incomplete or incorrect
      if (currentVal !== currentWordStr) {
        wordSpan.classList.add('error-word');
      }

      // Tally keystrokes for space
      keystrokesTotal++;
      keystrokesCorrect++;

      currentWordIndex++;
      typingInput.value = '';
      currentCharIndex = 0;

      if (currentMode !== 'time') {
        liveTimer.textContent = `${currentWordIndex}/${targetWords.length}`;
      }

      if (currentWordIndex >= targetWords.length) {
        finishTest();
        return;
      }

      scrollWordsContainerIfNeeded();
      requestAnimationFrame(updateCaretPosition);
    } else if (key.length === 1) {
      // Regular character typed
      keystrokesTotal++;
      const expectedChar = (targetWords[currentWordIndex] || '')[currentCharIndex];
      if (expectedChar === key) {
        keystrokesCorrect++;
      } else {
        keystrokesIncorrect++;
        window.keyAudio.playClick(false, true); // Play error tone
        keyErrorCounts[expectedChar || key] = (keyErrorCounts[expectedChar || key] || 0) + 1;
        highlightVirtualKeyError(key);
      }
    }
  }

  function updateCaretPosition() {
    const wordSpans = wordsText.children;
    if (!wordSpans || wordSpans.length === 0) return;

    const currentWordSpan = wordSpans[currentWordIndex];
    if (!currentWordSpan) return;

    const containerRect = wordsContainer.getBoundingClientRect();
    const charSpans = currentWordSpan.querySelectorAll('.char');

    if (currentCharIndex < charSpans.length) {
      const targetElement = charSpans[currentCharIndex];
      const targetRect = targetElement.getBoundingClientRect();
      caret.style.left = `${targetRect.left - containerRect.left}px`;
      caret.style.top = `${targetRect.top - containerRect.top}px`;
    } else {
      // Caret at end of current word
      const lastChar = charSpans[charSpans.length - 1];
      if (lastChar) {
        const lastRect = lastChar.getBoundingClientRect();
        caret.style.left = `${lastRect.right - containerRect.left}px`;
        caret.style.top = `${lastRect.top - containerRect.top}px`;
      }
    }
  }

  function scrollWordsContainerIfNeeded() {
    const wordSpans = wordsText.children;
    if (!wordSpans || wordSpans.length === 0) return;

    const currentWordSpan = wordSpans[currentWordIndex];
    if (!currentWordSpan) return;

    const lineH = currentWordSpan.offsetHeight || 44;
    const wordTop = currentWordSpan.offsetTop;

    if (wordTop > lineH * 1.8) {
      const scrollTarget = wordTop - lineH;
      wordsContainer.style.transform = `translateY(-${scrollTarget}px)`;
    } else {
      wordsContainer.style.transform = 'translateY(0px)';
    }
  }

  function updateLiveMetrics() {
    if (!startTime) return;
    const elapsed = Math.max(1, (Date.now() - startTime) / 1000);
    const timeInMin = elapsed / 60.0;

    const wpm = Math.round((keystrokesCorrect / 5.0) / timeInMin);
    const accuracy = keystrokesTotal > 0 ? Math.round((keystrokesCorrect / keystrokesTotal) * 100) : 100;

    liveWpm.textContent = isNaN(wpm) ? '0' : wpm;
    liveAccuracy.textContent = `${accuracy}%`;
  }

  function finishTest() {
    clearInterval(timerInterval);
    isTestActive = false;
    isTestFinished = true;

    const elapsed = Math.max(1, (Date.now() - startTime) / 1000);
    const timeInMin = elapsed / 60.0;

    const netWpm = Math.round((keystrokesCorrect / 5.0) / timeInMin);
    const rawWpm = Math.round((keystrokesTotal / 5.0) / timeInMin);
    const accuracy = keystrokesTotal > 0 ? Math.round((keystrokesCorrect / keystrokesTotal) * 100) : 100;

    // Consistency calculation
    const wpmValues = timelineData.map(d => d.wpm);
    const mean = wpmValues.reduce((a, b) => a + b, 0) / (wpmValues.length || 1);
    const variance = wpmValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (wpmValues.length || 1);
    const stdDev = Math.sqrt(variance);
    const consistency = Math.max(0, Math.round(100 - (stdDev / (mean + 1e-5) * 100)));

    // Populate Results Modal
    if (resultWpm) resultWpm.textContent = netWpm;
    if (resultAccuracy) resultAccuracy.textContent = `${accuracy}%`;
    if (resultRaw) resultRaw.textContent = rawWpm;
    if (resultChars) resultChars.textContent = `${keystrokesCorrect}/${keystrokesIncorrect}/${extraCharsCount}/${missedCharsCount}`;
    if (resultConsistency) resultConsistency.textContent = `${consistency}%`;
    if (resultTime) resultTime.textContent = `${Math.round(elapsed)}s`;

    renderWeakKeys();
    renderWpmChart();
    saveTestRecord(netWpm, accuracy, consistency, Math.round(elapsed));

    if (resultsModal) resultsModal.classList.remove('hidden');
  }

  function renderWeakKeys() {
    if (!weakKeysList) return;
    weakKeysList.innerHTML = '';
    const sortedKeys = Object.entries(keyErrorCounts).sort((a, b) => b[1] - a[1]);

    if (sortedKeys.length === 0) {
      weakKeysList.innerHTML = '<span class="hint-text">Perfect typing! Zero keystroke errors.</span>';
      return;
    }

    sortedKeys.slice(0, 5).forEach(([key, count]) => {
      const badge = document.createElement('div');
      badge.className = 'weak-key-badge';
      badge.innerHTML = `Key '${key.toUpperCase()}': <span class="err-count">${count} err</span>`;
      weakKeysList.appendChild(badge);
    });
  }

  function renderWpmChart() {
    const ctx = chartCanvas.getContext('2d');
    ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

    if (timelineData.length < 2) return;

    const padding = 30;
    const width = chartCanvas.width - padding * 2;
    const height = chartCanvas.height - padding * 2;

    const maxWpm = Math.max(...timelineData.map(d => Math.max(d.wpm, d.rawWpm)), 60);

    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + width, y);
      ctx.stroke();

      const labelVal = Math.round(maxWpm - (maxWpm / 4) * i);
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(labelVal, 5, y + 3);
    }

    // Function to map point
    const getX = (idx) => padding + (idx / (timelineData.length - 1)) * width;
    const getY = (val) => padding + height - (val / maxWpm) * height;

    // Draw Raw WPM Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    timelineData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.rawWpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw Net WPM Line
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    timelineData.forEach((d, i) => {
      const x = getX(i);
      const y = getY(d.wpm);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  function highlightVirtualKey(key) {
    const keyLower = key === ' ' ? ' ' : key.toLowerCase();
    const keyEl = virtualKeyboard.querySelector(`[data-key="${keyLower}"]`);
    if (keyEl) {
      keyEl.classList.add('active');
      setTimeout(() => keyEl.classList.remove('active'), 120);
    }
  }

  function highlightVirtualKeyError(key) {
    const keyLower = key.toLowerCase();
    const keyEl = virtualKeyboard.querySelector(`[data-key="${keyLower}"]`);
    if (keyEl) {
      keyEl.classList.add('error');
      setTimeout(() => keyEl.classList.remove('error'), 250);
    }
  }

  function clearKeyHighlights() {
    virtualKeyboard.querySelectorAll('.key').forEach(k => k.classList.remove('active', 'error'));
  }

  function closeModals() {
    resultsModal.classList.add('hidden');
    historyModal.classList.add('hidden');
  }

  // Local Storage & Personal Records
  function saveTestRecord(wpm, accuracy, consistency, duration) {
    const records = JSON.parse(localStorage.getItem('cybertype_history') || '[]');
    const newRecord = {
      mode: `${currentMode} (${modeSetting})`,
      wpm,
      accuracy,
      consistency,
      date: new Date().toLocaleDateString()
    };

    records.unshift(newRecord);
    if (records.length > 30) records.pop();
    localStorage.setItem('cybertype_history', JSON.stringify(records));

    // Update Personal Bests
    if (currentMode === 'time') {
      const pbKey = `cybertype_pb_${modeSetting}s`;
      const currentPb = parseInt(localStorage.getItem(pbKey) || '0', 10);
      if (wpm > currentPb) {
        localStorage.setItem(pbKey, wpm);
      }
    }
  }

  function showHistoryModal() {
    const records = JSON.parse(localStorage.getItem('cybertype_history') || '[]');
    historyRows.innerHTML = '';

    if (records.length === 0) {
      historyRows.innerHTML = '<tr><td colspan="5" style="text-align:center;">No completed tests yet. Start typing!</td></tr>';
    } else {
      records.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${r.mode}</td>
          <td style="color:var(--accent-color);font-weight:bold;">${r.wpm}</td>
          <td>${r.accuracy}%</td>
          <td>${r.consistency}%</td>
          <td style="opacity:0.7;">${r.date}</td>
        `;
        historyRows.appendChild(tr);
      });
    }

    // Load PBs
    pb15s.textContent = localStorage.getItem('cybertype_pb_15s') || '0';
    pb30s.textContent = localStorage.getItem('cybertype_pb_30s') || '0';
    pb60s.textContent = localStorage.getItem('cybertype_pb_60s') || '0';

    historyModal.classList.remove('hidden');
  }

  function setTheme(themeId) {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('cybertype_theme', themeId);
    currentThemeName.textContent = themeId.charAt(0).toUpperCase() + themeId.slice(1);

    document.querySelectorAll('.theme-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.themeId === themeId);
    });
  }

  function loadSavedSettings() {
    const savedTheme = localStorage.getItem('cybertype_theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
    renderModeOptions();
  }
});
