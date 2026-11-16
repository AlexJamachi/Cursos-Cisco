/* =====================================================================
   CISCO NETACAD & UMSA // CONCIENCIA DIGITAL - SLIDES ENGINE
   Course: Conciencia Digital - Jueves 20:30-22:00 Virtual
   Asistente de Enseñanza: Alex Arturo Jamachi Condori
   ===================================================================== */

(function() {
  'use strict';

  // ================= 1. RESPONSIVE AUTOSCALING =================
  const stage = document.getElementById('slideStage');
  const STAGE_W = 1260;
  const STAGE_H = 680;

  function scaleStage() {
    const container = document.getElementById('stageContainer');
    if (!container || !stage) return;

    if (window.innerWidth <= 900) {
      document.body.classList.add('is-mobile-view');
      stage.style.width = '';
      stage.style.height = '';
      stage.style.transform = '';
      stage.style.margin = '';
      return;
    }

    document.body.classList.remove('is-mobile-view');
    const cw = container.clientWidth;
    const ch = container.clientHeight;

    const scale = Math.min((cw - 24) / STAGE_W, (ch - 24) / STAGE_H);
    const finalScale = Math.max(0.15, scale);

    stage.style.width = STAGE_W + 'px';
    stage.style.height = STAGE_H + 'px';
    stage.style.transform = `scale(${finalScale})`;
    stage.style.margin = '0';
  }

  scaleStage();
  window.addEventListener('resize', scaleStage);

  // ================= 2. CORE SLIDE NAVIGATION =================
  const slides = document.querySelectorAll('.slide-view');
  const totalSlides = slides.length;
  let currentIndex = 0;
  let isTransitioning = false;

  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('dockDots');
  const gridModal = document.getElementById('gridModal');
  const presenterHud = document.getElementById('presenterHud');
  const helpModal = document.getElementById('helpModal');
  const gridBtn = document.getElementById('gridBtn');
  const presenterBtn = document.getElementById('presenterBtn');
  const fsBtn = document.getElementById('fsBtn');
  const helpBtn = document.getElementById('helpBtn');

  // Build dock dots if container exists
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((slide, i) => {
      const dot = document.createElement('div');
      dot.className = 'dock-dot' + (i === 0 ? ' is-active' : '');
      dot.title = `Slide ${i + 1}: ${slide.getAttribute('data-title') || ''}`;
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  const TRANSITIONS = ['push', 'wipe', 'circle', 'push', 'split'];
  let transitionCount = 0;

  function goTo(index) {
    if (index < 0 || index >= totalSlides || index === currentIndex || isTransitioning) return;
    isTransitioning = true;
    stage.classList.add('is-transitioning');
    const dir = index > currentIndex ? 1 : -1;
    const transType = TRANSITIONS[transitionCount % TRANSITIONS.length];
    transitionCount++;

    const currentSlide = slides[currentIndex];
    const targetSlide = slides[index];

    slides.forEach((s, idx) => {
      if (idx !== currentIndex && idx !== index) {
        s.classList.remove('is-active', 'is-exit-left', 'is-exit-right',
          'is-enter-from-left', 'is-enter-from-right');
      }
    });

    if (dir > 0) {
      targetSlide.classList.remove('is-exit-left', 'is-exit-right', 'is-active');
      targetSlide.classList.add('is-enter-from-right');
      void targetSlide.offsetWidth;
      currentSlide.classList.remove('is-active');
      currentSlide.classList.add('is-exit-left');
      targetSlide.classList.remove('is-enter-from-right');
      targetSlide.classList.add('is-active');
    } else {
      targetSlide.classList.remove('is-exit-left', 'is-exit-right', 'is-active');
      targetSlide.classList.add('is-enter-from-left');
      void targetSlide.offsetWidth;
      currentSlide.classList.remove('is-active');
      currentSlide.classList.add('is-exit-right');
      targetSlide.classList.remove('is-enter-from-left');
      targetSlide.classList.add('is-active');
    }

    setTimeout(() => {
      slides.forEach((s, idx) => {
        if (idx !== index) {
          s.classList.remove('is-active', 'is-exit-left', 'is-exit-right',
            'is-enter-from-left', 'is-enter-from-right');
        }
      });
      isTransitioning = false;
      stage.classList.remove('is-transitioning');
      onSlideEnter(index);
    }, 520);

    currentIndex = index;
    updateUI();
    if (document.body.classList.contains('is-mobile-view')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function onSlideEnter(index) {
    // slide entered callback
  }

  function updateUI() {
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;

    if (dotsContainer) {
      dotsContainer.querySelectorAll('.dock-dot').forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentIndex);
      });
    }

    slides.forEach((s, idx) => {
      const badge = s.querySelector('.slide-index-pill');
      if (badge) {
        badge.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
      }
    });

    const dockCurr = document.getElementById('dockCurrSlide');
    if (dockCurr) {
      dockCurr.textContent = String(currentIndex + 1).padStart(2, '0');
    }
    const dockTot = document.getElementById('dockTotalSlide');
    if (dockTot) {
      dockTot.textContent = String(totalSlides).padStart(2, '0');
    }

    updatePresenterNotes();

    if (gridModal) {
      gridModal.querySelectorAll('.grid-thumbnail-card').forEach((card, idx) => {
        card.classList.toggle('is-current', idx === currentIndex);
      });
    }

    const progressBar = document.getElementById('slideProgress');
    if (progressBar) {
      const pct = ((currentIndex + 1) / totalSlides) * 100;
      progressBar.style.width = pct + '%';
    }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  // ================= 3. GRID OVERVIEW MODAL (TECLA G) =================
  function buildGridModal() {
    if (!gridModal) return;
    const gridContainer = gridModal.querySelector('.grid-cards-container') || gridModal.querySelector('.grid-container');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    slides.forEach((slide, idx) => {
      const card = document.createElement('div');
      card.className = 'grid-thumbnail-card' + (idx === currentIndex ? ' is-current' : '');

      const title = slide.getAttribute('data-title') || `Diapositiva ${idx + 1}`;
      const desc = slide.getAttribute('data-desc') || 'Contenido modular Cisco Netacad';

      card.innerHTML = `
        <div>
          <div class="thumb-num">SLIDE ${String(idx + 1).padStart(2, '0')}</div>
          <div class="thumb-title">${title}</div>
          <div class="thumb-desc">${desc}</div>
        </div>
        <div style="font-family:var(--font-mono); font-size:10px; color:var(--cisco-cyan); margin-top:8px;">
          CLICK PARA IR &rarr;
        </div>
      `;

      card.addEventListener('click', () => {
        goTo(idx);
        toggleGrid(false);
      });

      gridContainer.appendChild(card);
    });
  }

  function toggleGrid(forceState) {
    if (!gridModal) return;
    const isOpen = typeof forceState === 'boolean' ? forceState : !gridModal.classList.contains('is-open');
    gridModal.classList.toggle('is-open', isOpen);
    if (gridBtn) gridBtn.classList.toggle('is-active-btn', isOpen);
    if (isOpen) buildGridModal();
  }

  if (gridBtn) gridBtn.addEventListener('click', () => toggleGrid());
  const closeGridBtn = document.getElementById('closeGridBtn');
  if (closeGridBtn) closeGridBtn.addEventListener('click', () => toggleGrid(false));

  // ================= 4. PRESENTER HUD & TIMER (TECLA P) =================
  let timerSeconds = 0;
  let timerRunning = true;
  let timerInterval = null;

  function formatTime(totalSec) {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (timerRunning) {
        timerSeconds++;
        const formatted = formatTime(timerSeconds);
        const timerEl = document.getElementById('hudTimerDigits');
        if (timerEl) timerEl.textContent = formatted;
        const timerAlt = document.getElementById('hudTimer');
        if (timerAlt) timerAlt.textContent = formatted;
      }
    }, 1000);
  }

  function updateClock() {
    const nowStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const clockEl = document.getElementById('hudClockDigits');
    if (clockEl) clockEl.textContent = nowStr;
    const clockAlt = document.getElementById('hudClock');
    if (clockAlt) clockAlt.textContent = nowStr;
  }

  setInterval(updateClock, 1000);
  updateClock();
  startTimer();

  function updatePresenterNotes() {
    const notesEl = document.getElementById('hudSpeakerNotes') || document.getElementById('hudSlideNotes') || document.getElementById('hudNotesContent');
    const titleEl = document.getElementById('hudSlideTitle');
    const descEl = document.getElementById('hudSlideDesc');
    const progEl = document.getElementById('hudProgressText');
    const nextTitleEl = document.getElementById('hudNextTitle');
    const nextDescEl = document.getElementById('hudNextDesc');
    const curSlide = slides[currentIndex];
    if (curSlide) {
      const notes = curSlide.getAttribute('data-notes') || 'Sin notas pedagógicas específicas para esta diapositiva.';
      if (notesEl) notesEl.textContent = notes;
      if (titleEl) titleEl.textContent = curSlide.getAttribute('data-title') || `Diapositiva ${currentIndex + 1}`;
      if (descEl) descEl.textContent = curSlide.getAttribute('data-desc') || '';
    }
    if (progEl) {
      const pct = Math.round(((currentIndex + 1) / totalSlides) * 100);
      progEl.textContent = `${currentIndex + 1} / ${totalSlides} (${pct}%)`;
    }
    if (nextTitleEl) {
      if (currentIndex + 1 < totalSlides) {
        const nextSlide = slides[currentIndex + 1];
        const nextTitle = nextSlide.getAttribute('data-title') || `Slide ${currentIndex + 2}`;
        const nextDesc = nextSlide.getAttribute('data-desc') || 'Continuación del temario oficial.';
        nextTitleEl.textContent = `${currentIndex + 2}. ${nextTitle}`;
        if (nextDescEl) nextDescEl.textContent = nextDesc;
      } else {
        nextTitleEl.textContent = 'Fin de la Sesión';
        if (nextDescEl) nextDescEl.textContent = '¡Sesión completada con éxito!';
      }
    }
  }

  function toggleHUD(forceState) {
    if (!presenterHud) return;
    const isOpen = typeof forceState === 'boolean' ? forceState : !presenterHud.classList.contains('is-open');
    presenterHud.classList.toggle('is-open', isOpen);
    if (presenterBtn) presenterBtn.classList.toggle('is-active-btn', isOpen);
    if (isOpen) updatePresenterNotes();
  }

  if (presenterBtn) presenterBtn.addEventListener('click', () => toggleHUD());
  const closeHudBtn = document.getElementById('closeHudBtn');
  if (closeHudBtn) closeHudBtn.addEventListener('click', () => toggleHUD(false));

  const pauseBtn = document.getElementById('hudTimerPauseBtn') || document.getElementById('timerPauseBtn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      timerRunning = !timerRunning;
      pauseBtn.innerHTML = timerRunning 
        ? '<i class="bi bi-pause-fill"></i> Pausar' 
        : '<i class="bi bi-play-fill"></i> Reanudar';
    });
  }
  const startTimerBtn = document.getElementById('timerStartBtn');
  if (startTimerBtn) {
    startTimerBtn.addEventListener('click', () => { timerRunning = true; });
  }

  const resetBtn = document.getElementById('hudTimerResetBtn') || document.getElementById('resetTimerBtn') || document.getElementById('timerResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      timerSeconds = 0;
      const t1 = document.getElementById('hudTimerDigits');
      const t2 = document.getElementById('hudTimer');
      if (t1) t1.textContent = '00:00:00';
      if (t2) t2.textContent = '00:00:00';
    });
  }

  const nextPreviewCard = document.getElementById('hudNextPreviewCard') || document.getElementById('hudNextPreview');
  if (nextPreviewCard) {
    nextPreviewCard.style.cursor = 'pointer';
    nextPreviewCard.addEventListener('click', () => {
      if (currentIndex + 1 < totalSlides) goTo(currentIndex + 1);
    });
  }

  // ================= 5. FULLSCREEN (TECLA F) =================
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  if (fsBtn) fsBtn.addEventListener('click', toggleFullscreen);

  // ================= 6. KEYBOARD HELP MODAL (TECLA ?) =================
  function toggleHelp(forceState) {
    if (!helpModal) return;
    const isOpen = typeof forceState === 'boolean' ? forceState : !helpModal.classList.contains('is-open');
    helpModal.classList.toggle('is-open', isOpen);
    if (helpBtn) helpBtn.classList.toggle('is-active-btn', isOpen);
  }

  if (helpBtn) helpBtn.addEventListener('click', () => toggleHelp());
  const closeHelpBtn = document.getElementById('closeHelpBtn') || document.getElementById('helpCloseBtn');
  if (closeHelpBtn) closeHelpBtn.addEventListener('click', () => toggleHelp(false));

  // ================= 7. KEYBOARD NAVIGATION =================
  window.addEventListener('keydown', (e) => {
    // If typing in an input (e.g. password tester), allow typing freely
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case ' ':
      case 'PageDown':
        e.preventDefault();
        goTo(currentIndex + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        goTo(currentIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(totalSlides - 1);
        break;
      case 'g':
      case 'G':
        e.preventDefault();
        toggleGrid();
        break;
      case 'p':
      case 'P':
        e.preventDefault();
        toggleHUD();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case '?':
        e.preventDefault();
        toggleHelp();
        break;
      case 'Escape':
        if (gridModal && gridModal.classList.contains('is-open')) toggleGrid(false);
        if (helpModal && helpModal.classList.contains('is-open')) toggleHelp(false);
        if (presenterHud && presenterHud.classList.contains('is-open')) toggleHUD(false);
        break;
    }
  });

  // ================= 8. INTERACTIVE PASSWORD STRENGTH CHECKER =================
  function initPasswordTester() {
    const pwInput = document.getElementById('pwInput');
    if (!pwInput) return;

    const toggleBtn = document.getElementById('pwToggleBtn');
    const scorePill = document.getElementById('pwScorePill');
    const crackTime = document.getElementById('pwCrackTime');
    const entropyEl = document.getElementById('pwEntropy');
    const segments = [
      document.getElementById('seg1'),
      document.getElementById('seg2'),
      document.getElementById('seg3'),
      document.getElementById('seg4'),
      document.getElementById('seg5')
    ];

    const ruleLen = document.getElementById('ruleLen');
    const ruleCase = document.getElementById('ruleCase');
    const ruleNum = document.getElementById('ruleNum');
    const ruleSym = document.getElementById('ruleSym');

    const commonWords = ['password', '123456', 'cisco', 'qwerty', 'admin', 'hola', 'bolivia', 'lapaz', 'usuario', 'contrasena', '12345678'];

    function updateRule(el, isValid, text) {
      if (!el) return;
      el.classList.toggle('is-valid', isValid);
      el.innerHTML = isValid 
        ? `<i class="bi bi-check-circle-fill" style="color:var(--pop-mint);"></i> ${text}`
        : `<i class="bi bi-circle"></i> ${text}`;
    }

    function evaluatePassword(val) {
      const len = val.length;
      const hasLower = /[a-z]/.test(val);
      const hasUpper = /[A-Z]/.test(val);
      const hasNumber = /[0-9]/.test(val);
      const hasSymbol = /[^A-Za-z0-9]/.test(val);
      const lowerVal = val.toLowerCase();
      const hasCommon = commonWords.some(w => lowerVal.includes(w));
      const hasSequence = /123|abc|789|qwe/i.test(val);

      // Update rules
      updateRule(ruleLen, len >= 8, 'Mínimo 8 caracteres (ideal 12+)');
      updateRule(ruleCase, hasLower && hasUpper, 'Mayúsculas y minúsculas');
      updateRule(ruleNum, hasNumber, 'Números (0-9)');
      updateRule(ruleSym, hasSymbol, 'Símbolos (!@#$%^&*)');

      if (len === 0) {
        if (scorePill) {
          scorePill.textContent = 'ESPERANDO TEXTO';
          scorePill.style.background = 'rgba(148, 163, 184, 0.2)';
          scorePill.style.color = 'var(--text-muted)';
          scorePill.style.border = '1.5px solid var(--border-color)';
        }
        if (crackTime) crackTime.textContent = '0 segundos';
        if (entropyEl) entropyEl.textContent = '0 bits';
        segments.forEach(seg => { if (seg) seg.style.backgroundColor = '#1E293B'; });
        return;
      }

      // Charset pool size
      let pool = 0;
      if (hasLower) pool += 26;
      if (hasUpper) pool += 26;
      if (hasNumber) pool += 10;
      if (hasSymbol) pool += 33;
      if (pool === 0) pool = 10;

      let entropy = Math.round(len * Math.log2(pool));
      if (hasCommon || hasSequence) entropy = Math.max(8, entropy - 25);

      if (entropyEl) {
        entropyEl.textContent = `${entropy} bits`;
      }

      // Score from 1 to 5
      let score = 1;
      let pillText = 'MUY DÉBIL';
      let pillColor = '#EF4444';
      let estTime = '< 1 milisegundo (Fuerza Bruta)';

      if (entropy >= 80 && len >= 12 && hasLower && hasUpper && (hasNumber || hasSymbol)) {
        score = 5;
        pillText = 'INVULNERABLE (CISCO TOP)';
        pillColor = '#00BCEB';
        estTime = '> 30 millones de siglos (Blindada)';
      } else if (entropy >= 60 && len >= 10) {
        score = 4;
        pillText = 'FUERTE (RECOMENDADA)';
        pillColor = '#10B981';
        estTime = '350 a 10,000 años';
      } else if (entropy >= 45 && len >= 8) {
        score = 3;
        pillText = 'ACEPTABLE (BÁSICA)';
        pillColor = '#FF9E1B';
        estTime = '4 meses a 2 años';
      } else if (entropy >= 28 && len >= 6) {
        score = 2;
        pillText = 'DÉBIL (VULNERABLE)';
        pillColor = '#FF7300';
        estTime = '2 a 15 minutos';
      } else {
        score = 1;
        pillText = 'MUY DÉBIL (PELIGRO)';
        pillColor = '#EF4444';
        estTime = '< 1 milisegundo (Fuerza Bruta)';
      }

      if (scorePill) {
        scorePill.textContent = pillText;
        scorePill.style.background = pillColor;
        scorePill.style.color = (score === 3) ? '#0B111E' : '#FFFFFF';
        scorePill.style.border = `1.5px solid ${pillColor}`;
      }

      if (crackTime) {
        crackTime.textContent = estTime;
      }

      segments.forEach((seg, i) => {
        if (seg) {
          seg.style.backgroundColor = (i < score) ? pillColor : '#1E293B';
        }
      });
    }

    pwInput.addEventListener('input', () => evaluatePassword(pwInput.value));
    pwInput.addEventListener('keyup', () => evaluatePassword(pwInput.value));

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isPw = pwInput.type === 'password';
        pwInput.type = isPw ? 'text' : 'password';
        toggleBtn.innerHTML = isPw 
          ? '<i class="bi bi-eye-slash-fill"></i>' 
          : '<i class="bi bi-eye-fill"></i>';
        toggleBtn.title = isPw ? 'Ocultar contraseña' : 'Ver contraseña';
      });
    }

    // Preset test chips
    document.querySelectorAll('.pw-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.getAttribute('data-sample') || '';
        pwInput.value = val;
        evaluatePassword(val);
        pwInput.focus();
      });
    });

    // Run initial
    evaluatePassword(pwInput.value || '');
  }

  // ================= 9. CHECKPOINT QUIZZES & REVEAL SYSTEM =================
  window.revealQuiz = function(clickedBtn, isCorrect, expId, message) {
    const widget = clickedBtn.closest('.bento-card, .quiz-widget') || clickedBtn.parentElement;
    if (!widget) return;

    const allBtns = widget.querySelectorAll('.quiz-btn');
    const expBox = document.getElementById(expId) || widget.querySelector('.quiz-explanation');

    // Reset all buttons in this question
    allBtns.forEach(btn => {
      btn.classList.remove('is-correct', 'is-incorrect', 'is-dimmed');
      
      const btnIsCorrect = btn.getAttribute('data-correct') === 'true' || 
        (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(', true,'));
      
      if (btnIsCorrect) {
        btn.classList.add('is-correct');
      } else if (btn === clickedBtn && !isCorrect) {
        btn.classList.add('is-incorrect');
      } else {
        btn.classList.add('is-dimmed');
      }
    });

    // Display explanation box with vivid pedagogical color coding
    if (expBox) {
      expBox.classList.remove('is-correct-box', 'is-incorrect-box');
      expBox.classList.add('show');
      expBox.style.display = 'block';
      
      if (isCorrect) {
        expBox.classList.add('is-correct-box');
        expBox.innerHTML = `
          <div style="display:flex; align-items:flex-start; gap:10px;">
            <i class="bi bi-check-circle-fill" style="color:var(--pop-mint); font-size:22px; flex-shrink:0; margin-top:2px;"></i>
            <div style="flex:1;">
              <div style="font-family:var(--font-mono); font-size:12.5px; font-weight:800; color:var(--pop-mint); text-transform:uppercase; margin-bottom:2px;">
                ¡Respuesta Correcta! (Acreditación Cisco NetAcad)
              </div>
              <div style="font-size:14px; color:#F1F5F9; line-height:1.45;">${message}</div>
            </div>
          </div>
        `;
      } else {
        expBox.classList.add('is-incorrect-box');
        expBox.innerHTML = `
          <div style="display:flex; align-items:flex-start; gap:10px;">
            <i class="bi bi-x-circle-fill" style="color:var(--pop-coral); font-size:22px; flex-shrink:0; margin-top:2px;"></i>
            <div style="flex:1;">
              <div style="font-family:var(--font-mono); font-size:12.5px; font-weight:800; color:var(--pop-coral); text-transform:uppercase; margin-bottom:2px;">
                Respuesta Incorrecta &bull; <span style="color:var(--pop-mint); font-weight:800;">La opción oficial correcta es la resaltada en VERDE arriba</span>
              </div>
              <div style="font-size:14px; color:#F1F5F9; line-height:1.45;">${message}</div>
            </div>
          </div>
        `;
      }
    }
  };

  // ================= 10. DINÁMICA 1: SIMULADOR DE BÚSQUEDA BOOLEANA =================
  const SEARCH_CASES = {
    'thesis': {
      title: 'Misión 1: Búsqueda de Reglamentos Oficiales UMSA en PDF',
      query: 'site:umsa.bo filetype:pdf "reglamento de becas"',
      opExplain: '<code>site:umsa.bo</code> restringe la búsqueda al dominio oficial. <code>filetype:pdf</code> filtra solo documentos descargables y <code>" "</code> obliga a que la frase aparezca textual.',
      benefit: 'Ahorro de hasta un 95% de tiempo frente a búsquedas vagas. Descarta blogs, publicaciones secundarias y notas desactualizadas.',
      netacadTip: 'Criterio Cisco: Los operadores de búsqueda transforman la sobrecarga de información en precisión académica inmediata.'
    },
    'solar': {
      title: 'Misión 2: Investigación Solar Excluyendo Paneles Fotovoltaicos',
      query: '"energía solar" -fotovoltaica -comercial filetype:pdf',
      opExplain: 'El operador menos (<code>-</code>) excluye cualquier página que contenga la palabra contigua. Permite concentrarse en energía solar térmica pura sin ruido de venta de paneles.',
      benefit: 'Elimina de raíz los resultados comerciales patrocinados de venta de paneles residenciales.',
      netacadTip: 'Criterio Cisco: Utilizar el signo menos pegado a la palabra (sin espacio) para que el motor reconozca el operador de exclusión.'
    },
    'quote': {
      title: 'Misión 3: Rastreo de Fuente Primaria de una Cita Textual',
      query: '"la inteligencia es la habilidad de adaptarse al cambio"',
      opExplain: 'Las comillas dobles (<code>" "</code>) le indican al buscador que solo devuelva páginas que contengan las palabras exactamente en ese orden consecutivo.',
      benefit: 'Fundamental para redactar tesis y evitar acusaciones de citas inexactas o fuentes dudosas.',
      netacadTip: 'Criterio Cisco: Si buscas sin comillas, el motor buscará las palabras dispersas en cualquier parte del sitio web.'
    },
    'recent': {
      title: 'Misión 4: Ciberseguridad Universitaria en Bolivia (.edu.bo)',
      query: 'ciberseguridad convocatoria site:.edu.bo',
      opExplain: 'El comodín de dominio <code>site:.edu.bo</code> agrupa a todas las universidades públicas y privadas del país en una sola consulta.',
      benefit: 'Ideal para encontrar pasantías, becas y congresos académicos en todo el sistema universitario nacional.',
      netacadTip: 'Criterio Cisco: Combinar <code>site:</code> con herramientas de fecha de Google (Último mes o año) asegura información vigente.'
    }
  };

  window.selectSearchCase = function(cardEl, caseKey) {
    document.querySelectorAll('.search-case-btn').forEach(c => c.classList.remove('is-active-case'));
    cardEl.classList.add('is-active-case');

    const data = SEARCH_CASES[caseKey];
    if (!data) return;

    const titleEl = document.getElementById('searchDetailTitle');
    const queryEl = document.getElementById('searchDetailQuery');
    const opEl = document.getElementById('searchDetailOps');
    const benefitEl = document.getElementById('searchDetailBenefit');
    const tipEl = document.getElementById('searchDetailTip');

    if (titleEl) titleEl.textContent = data.title;
    if (queryEl) queryEl.textContent = data.query;
    if (opEl) opEl.innerHTML = data.opExplain;
    if (benefitEl) benefitEl.textContent = data.benefit;
    if (tipEl) tipEl.textContent = data.netacadTip;
  };

  // ================= 11. DINÁMICA 2: AUDITOR DE LICENCIAS Y DERECHOS DE AUTOR =================
  const LICENSE_CASES = {
    'google_photo': {
      title: 'Caso 1: Foto Profesional de Google Imágenes para Portada de Tesis',
      verdictBadge: 'INFRACCIÓN DE COPYRIGHT',
      verdictColor: 'var(--pop-coral)',
      verdictClass: 'feat-pill-coral',
      diagnosis: 'Aparecer en los resultados públicos de Google NO otorga derecho de reutilización. Toda obra original posee derechos de autor automáticos ("Todos los derechos reservados") desde su creación.',
      legalRisk: 'Riesgo de impugnación o anulación del trabajo de grado por violación de derechos patrimoniales y propiedad intelectual.',
      remedy: 'Solución Cisco: Reemplazar por imágenes con licencia Creative Commons de dominio público (Unsplash, Wikimedia) o solicitar autorización firmada del fotógrafo.'
    },
    'cc_icon': {
      title: 'Caso 2: Icono Gráfico con Licencia Creative Commons (CC-BY 4.0)',
      verdictBadge: 'USO PERMITIDO CON ATRIBUCIÓN',
      verdictColor: 'var(--pop-mint)',
      verdictClass: 'feat-pill-mint',
      diagnosis: 'La licencia CC-BY es altamente permisiva: autoriza copiar, distribuir, remezclar e incluso uso comercial, con la única condición obligatoria de otorgar crédito al creador original.',
      legalRisk: 'Cumplimiento legal pleno si se incluye la atribución normalizada en los créditos.',
      remedy: 'Formato de Atribución Cisco: "Icono creado por [Autor], bajo licencia CC-BY 4.0 (con enlace a la fuente original)".'
    },
    'academic_quote': {
      title: 'Caso 3: Cita Textual de 4 Líneas de un Libro de Texto con Referencia',
      verdictBadge: 'USO LEGÍTIMO (FAIR USE) VÁLIDO',
      verdictColor: 'var(--cisco-cyan)',
      verdictClass: 'feat-pill-cyan',
      diagnosis: 'Las doctrinas de Uso Legítimo (Fair Use) permiten el empleo de porciones breves de obras protegidas con fines educativos, de crítica, docencia o investigación, siempre que el texto vaya entre comillas y con cita completa.',
      legalRisk: 'Totalmente legal y respaldado por las convenciones internacionales de propiedad intelectual.',
      remedy: 'Protocolo Académico: Citar autor, año y página exacta según norma bibliográfica (APA/IEEE). No sustituye la adquisición de la obra.'
    }
  };

  window.selectLicenseCase = function(cardEl, caseKey) {
    document.querySelectorAll('.license-case-btn').forEach(c => c.classList.remove('is-active-orange'));
    cardEl.classList.add('is-active-orange');

    const data = LICENSE_CASES[caseKey];
    if (!data) return;

    const titleEl = document.getElementById('licenseDetailTitle');
    const badgeEl = document.getElementById('licenseDetailBadge');
    const diagEl = document.getElementById('licenseDetailDiag');
    const riskEl = document.getElementById('licenseDetailRisk');
    const remedyEl = document.getElementById('licenseDetailRemedy');

    if (titleEl) titleEl.textContent = data.title;
    if (badgeEl) {
      badgeEl.textContent = data.verdictBadge;
      badgeEl.className = 'feat-pill ' + data.verdictClass;
    }
    if (diagEl) diagEl.textContent = data.diagnosis;
    if (riskEl) riskEl.textContent = data.legalRisk;
    if (remedyEl) remedyEl.textContent = data.remedy;
  };

  // ================= 12. DINÁMICA 3: SIMULADOR DE NETIQUETA Y TONO DIGITAL =================
  const NETIQUETTE_CASES = {
    'whatsapp_caps': {
      title: 'Situación 1: Mensaje en Grupo de Materia Universitaria a las 02:30 AM',
      rawText: '¿ALGUIEN TIENE EL PDF DE LA TAREA 4? ¡¡PÁSENLO YA QUE MAÑANA VENCE!!',
      ruleViolated: 'Regla 1 y 2 de Cisco: Escribir en MAYÚSCULAS SOSTENIDAS equivale a gritar en un entorno digital. Además, enviar mensajes de madrugada transgrede el derecho al descanso ajeno.',
      proText: 'Buenas noches, estimados compañeros. Disculpen la molestia a esta hora. Si alguien tiene disponible el PDF de la tarea 4 y pudiera compartirlo mañana temprano, se lo agradecería enormemente. ¡Éxitos en el estudio!',
      tip: 'Principio Cisco: La cortesía digital genera reciprocidad y respeto en equipos colaborativos.'
    },
    'email_bcc': {
      title: 'Situación 2: Envío de Circular a 50 Estudiantes en el campo "Para:"',
      rawText: 'Para: estudiante1@umsa.bo, estudiante2@umsa.bo, ... estudiante50@umsa.bo\nAsunto: Recordatorio de Trabajo',
      ruleViolated: 'Regla de Privacidad de Cisco: Exponer las direcciones de correo de 50 personas a terceros sin su consentimiento facilita el spam, phishing y vulnera la privacidad.',
      proText: 'Para: [Tu propia dirección]\nCCO (Copia Oculta): estudiante1@umsa.bo, ... estudiante50@umsa.bo\nAsunto: [Asignatura] Recordatorio de Entrega de Trabajo Final',
      tip: 'Principio Cisco: El campo CCO (BCC) es una obligación ética de seguridad en cualquier comunicado masivo.'
    },
    'forum_flame': {
      title: 'Situación 3: Discusión Acalorada en Foro de Debate (Flaming)',
      rawText: 'Tu argumento no tiene sentido, se nota que no leíste nada y solo dices tonterías.',
      ruleViolated: 'Regla del Factor Humano de Cisco: El anonimato de la pantalla desinhibe la agresividad. El ataque ad hominem destruye el debate académico constructivo.',
      proText: 'Comprendo tu punto de vista; sin embargo, revisando la bibliografía de la unidad, los datos sugieren otra perspectiva debido a [Argumento Técnico]. ¿Qué opinas de ese enfoque?',
      tip: 'Principio Cisco: Aplica la regla de enfriamiento de 5 minutos antes de responder cualquier mensaje hostil.'
    }
  };

  window.selectNetiquetteCase = function(cardEl, caseKey) {
    document.querySelectorAll('.netiquette-case-btn').forEach(c => c.classList.remove('is-active-mint'));
    cardEl.classList.add('is-active-mint');

    const data = NETIQUETTE_CASES[caseKey];
    if (!data) return;

    const titleEl = document.getElementById('netiquetteDetailTitle');
    const rawEl = document.getElementById('netiquetteRawText');
    const ruleEl = document.getElementById('netiquetteRule');
    const proEl = document.getElementById('netiquetteProText');
    const tipEl = document.getElementById('netiquetteTip');

    if (titleEl) titleEl.textContent = data.title;
    if (rawEl) rawEl.textContent = data.rawText;
    if (ruleEl) ruleEl.textContent = data.ruleViolated;
    if (proEl) proEl.textContent = data.proText;
    if (tipEl) tipEl.textContent = data.tip;
  };

  // ================= 13. DINÁMICA 4: GREEN COMPUTING Y VERIFICACIÓN =================
  const GREEN_CASES = {
    'ai_energy': {
      title: 'Escenario 1: Consumo Energético de la Inteligencia Artificial',
      metric: '~10x más energía por consulta compleja',
      impact: 'Entrenar y consultar modelos gigantescos (LLMs) requiere granjas de servidores con GPUs de alta potencia que disparan la demanda de electricidad y agua de refrigeración en centros de datos mundiales.',
      actionCisco: 'Acción Sostenible: Escribir prompts claros y precisos para evitar consultas iterativas innecesarias. Promover el uso de centros de datos con energía solar o eólica.'
    },
    'fakenews': {
      title: 'Escenario 2: Noticia Sensacionalista Viral en Redes Sociales',
      metric: 'Millones de vistas no equivalen a verdad',
      impact: 'Los algoritmos de recomendación premian el contenido polarizante y emotivo. El 70% de la desinformación en línea se propaga 6 veces más rápido que las noticias verdaderas verificadas.',
      actionCisco: 'Protocolo de Verificación Cisco: 1. Confirmar en fuentes oficiales primarias. 2. Revisar la fecha y contexto. 3. Considerar la formación y posibles sesgos del autor.'
    },
    'digital_hygiene': {
      title: 'Escenario 3: Bucle de Dopamina y Adicción al Scroll Infinito',
      metric: 'Pérdida de control y fatiga cognitiva',
      impact: 'Las redes sociales están diseñadas con refuerzo intermitente (scroll infinito) que activa picos de dopamina, provocando insomnio por luz azul y fragmentación de la memoria a corto plazo.',
      actionCisco: 'Acción Sostenible: Usar la herramienta de Bienestar Digital en Android/iOS para fijar límites diarios de 45 min por red social y apagar pantallas 1 hora antes de dormir.'
    }
  };

  window.selectGreenCase = function(cardEl, caseKey) {
    document.querySelectorAll('.green-case-btn').forEach(c => c.classList.remove('is-active-purple'));
    cardEl.classList.add('is-active-purple');

    const data = GREEN_CASES[caseKey];
    if (!data) return;

    const titleEl = document.getElementById('greenDetailTitle');
    const metricEl = document.getElementById('greenDetailMetric');
    const impactEl = document.getElementById('greenDetailImpact');
    const actionEl = document.getElementById('greenDetailAction');

    if (titleEl) titleEl.textContent = data.title;
    if (metricEl) metricEl.textContent = data.metric;
    if (impactEl) impactEl.textContent = data.impact;
    if (actionEl) actionEl.textContent = data.actionCisco;
  };

  // ================= 15. SESIÓN 3 - DINÁMICA 1: CLASIFICADOR DE PERSONA DIGITAL =================
  const IDENTITY_CASES = {
    'linkedin_profile': {
      title: 'Caso 1: Perfil Profesional en LinkedIn y Portafolio Web',
      personaType: 'PERSONA PROFESIONAL',
      badgeClass: 'feat-pill-cyan',
      diagnosis: 'Orientado a empleabilidad y networking académico. Destaca habilidades técnicas, proyectos de tesis, certificaciones de Cisco NetAcad y trayectoria universitaria sin contenido informal.',
      privacyTip: 'Configuración: Perfil público con datos de contacto filtrados. Prohibido compartir dirección domiciliaria o números de teléfono privados.',
      ciscoRule: 'Principio Cisco: Tu persona profesional es tu carta de presentación digital en la industria tecnológica global.'
    },
    'whistleblower_forum': {
      title: 'Caso 2: Foro Anónimo de Apoyo o Denuncia Ética',
      personaType: 'ANONIMATO ÉTICO PROTEGIDO',
      badgeClass: 'feat-pill-mint',
      diagnosis: 'El anonimato permite denunciar irregularidades, abusos corporativos o buscar ayuda en temas de salud mental sin miedo a represalias o estigmatización social.',
      privacyTip: 'Herramientas: Navegación mediante VPN confiable, borrado de metadatos de documentos compartidos y contraseñas robustas con 2FA.',
      ciscoRule: 'Criterio Cisco: El anonimato es un escudo vital para la libertad de expresión, pero nunca debe usarse para el ciberacoso o la impunidad delictiva.'
    },
    'ecommerce_shopper': {
      title: 'Caso 3: Persona de Consumidor y Compras Online',
      personaType: 'PERSONA DE CONSUMIDOR',
      badgeClass: 'feat-pill-orange',
      diagnosis: 'Generada automáticamente por tus patrones de búsqueda, carritos de compra e interacciones con marcas. Alimenta algoritmos que personalizan anuncios dirigidos.',
      privacyTip: 'Protección: Utilizar tarjetas virtuales de un solo uso, no guardar datos de pago en tiendas desconocidas y revisar permisos de cookies de terceros.',
      ciscoRule: 'Criterio Cisco: Separa tu correo de compras del correo institucional para evitar saturación de spam y rastreo masivo.'
    }
  };

  window.selectIdentityCase = function(cardEl, caseKey) {
    document.querySelectorAll('.identity-case-btn').forEach(c => c.classList.remove('is-active-case'));
    cardEl.classList.add('is-active-case');

    const data = IDENTITY_CASES[caseKey];
    if (!data) return;

    const titleEl = document.getElementById('identityDetailTitle');
    const badgeEl = document.getElementById('identityDetailBadge');
    const diagEl = document.getElementById('identityDetailDiag');
    const privEl = document.getElementById('identityDetailPriv');
    const ruleEl = document.getElementById('identityDetailRule');

    if (titleEl) titleEl.textContent = data.title;
    if (badgeEl) {
      badgeEl.textContent = data.personaType;
      badgeEl.className = 'feat-pill ' + data.badgeClass;
    }
    if (diagEl) diagEl.textContent = data.diagnosis;
    if (privEl) privEl.textContent = data.privacyTip;
    if (ruleEl) ruleEl.textContent = data.ciscoRule;
  };

  // ================= 16. SESIÓN 3 - DINÁMICA 2: DETECTOR DE AMENAZAS Y FRAUDES =================
  const THREAT_CASES = {
    'spear_phishing': {
      title: 'Caso 1: Correo de Alerta Bancaria con Enlace Urgente',
      threatBadge: 'SPEAR PHISHING DIRIGIDO',
      badgeClass: 'feat-pill-coral',
      diagnosis: 'Mensaje fraudulento que finge ser de una entidad financiera o de la universidad exigiendo verificación de credenciales en menos de 24 horas bajo amenaza de bloqueo de cuenta.',
      redFlag: 'Señales de alarma: Sentido de urgencia extrema, dominio del remitente alterado (ej. @banco-seguro.com) y enlace que redirige a un portal señuelo para robar contraseñas.',
      ciscoProtocol: 'Protocolo Defensivo Cisco: Nunca hacer clic en el enlace. Acceder directamente escribiendo la URL oficial en el navegador y reportar al departamento de ciberseguridad.'
    },
    'pirated_crack': {
      title: 'Caso 2: Activador (Crack) de Software Descargado de Torrent',
      threatBadge: 'MALWARE TROYANO / BACKDOOR',
      badgeClass: 'feat-pill-orange',
      diagnosis: 'Los ejecutables modificados para saltar licencias o DRM de videojuegos y suites de diseño suelen ocultar troyanos de acceso remoto o mineros de criptomonedas silenciosos.',
      redFlag: 'Señales de alarma: La página exige desactivar el antivirus para ejecutar el archivo .exe. En ese instante, el sistema queda completamente a merced del atacante.',
      ciscoProtocol: 'Solución Cisco: Optar siempre por software libre de código abierto (FOSS) o licencias académicas institucionales de la UMSA antes que arriesgar el equipo.'
    },
    'romance_scam': {
      title: 'Caso 3: Estafa Romántica e Ingeniería Social en Redes',
      threatBadge: 'FRAUDE FINANCIERO / CATFISHING',
      badgeClass: 'feat-pill-purple',
      diagnosis: 'Ciberdelincuentes crean perfiles falsos atractivos en apps y redes, ganándose la confianza afectiva durante semanas para luego solicitar transferencias urgentes por emergencias ficticias.',
      redFlag: 'Señales de alarma: Siempre hay una excusa para no hacer videollamadas en vivo, la relación avanza de forma anormalmente acelerada y surge una urgencia monetaria o en criptoactivos.',
      ciscoProtocol: 'Principio de Alerta Cisco: Jamás transferir dinero a personas no conocidas en persona. Realizar búsqueda inversa de la foto de perfil en Google Imágenes.'
    }
  };

  window.selectThreatCase = function(cardEl, caseKey) {
    document.querySelectorAll('.threat-case-btn').forEach(c => c.classList.remove('is-active-coral'));
    cardEl.classList.add('is-active-coral');

    const data = THREAT_CASES[caseKey];
    if (!data) return;

    const titleEl = document.getElementById('threatDetailTitle');
    const badgeEl = document.getElementById('threatDetailBadge');
    const diagEl = document.getElementById('threatDetailDiag');
    const flagEl = document.getElementById('threatDetailFlag');
    const protoEl = document.getElementById('threatDetailProto');

    if (titleEl) titleEl.textContent = data.title;
    if (badgeEl) {
      badgeEl.textContent = data.threatBadge;
      badgeEl.className = 'feat-pill ' + data.badgeClass;
    }
    if (diagEl) diagEl.textContent = data.diagnosis;
    if (flagEl) flagEl.textContent = data.redFlag;
    if (protoEl) protoEl.textContent = data.ciscoProtocol;
  };

  // ================= 17. SESIÓN 3 - DINÁMICA 3: TRIAGE DE TROUBLESHOOTING CISCO =================
  const TRIAGE_CASES = {
    'power_dead': {
      title: 'Incidente 1: La Computadora no Enciende ni Emite Luces',
      priorityBadge: 'PASO 1: VERIFICACIÓN FÍSICA Y ENERGÍA',
      badgeClass: 'feat-pill-cyan',
      symptom: 'El equipo parece totalmente inerte tras presionar el botón de inicio; no se escuchan ventiladores ni se encienden los LEDs indicadores.',
      procedure: '1. Probar en otro tomacorriente funcional. 2. Inspeccionar el cargador/cable en busca de cortes. 3. Realizar hard reset: desconectar el cargador y mantener presionado el botón de encendido de 10 a 20 segundos para drenar energía residual, luego reconectar.',
      netacadTip: 'Regla Cisco: El 40% de los incidentes que parecen fallos graves de hardware se resuelven verificando la alimentación eléctrica básica.'
    },
    'system_freeze': {
      title: 'Incidente 2: Pantalla Congelada y Lentitud Extrema del Sistema',
      priorityBadge: 'PASO 2: GESTIÓN DE MEMORIA Y REINICIO',
      badgeClass: 'feat-pill-orange',
      symptom: 'El cursor se entrecorta, las ventanas muestran el estado "No responde" y el ventilador de la laptop gira a máxima velocidad de forma constante.',
      procedure: '1. Pulsar Ctrl + Shift + Esc para abrir el Administrador de Tareas y finalizar procesos que consuman 100% de CPU/RAM. 2. Liberar espacio en disco borrando archivos temporales. 3. Reiniciar el equipo para purgar la memoria volátil.',
      netacadTip: 'Regla Cisco: Reiniciar la computadora borra fugas de memoria y detiene procesos fantasmas en segundo plano que degradan el rendimiento.'
    },
    'wifi_dns': {
      title: 'Incidente 3: Conexión Wi-Fi Conectada pero Sin Acceso a Internet',
      priorityBadge: 'PASO 3: DIAGNÓSTICO DE RED Y ROUTER',
      badgeClass: 'feat-pill-mint',
      symptom: 'El icono de red muestra la advertencia "Sin conexión a Internet" a pesar de estar asociado correctamente al router inalámbrico.',
      procedure: '1. Apagar el router/módem, esperar exactamente 30 segundos y volverlo a enchufar para que reasigne direcciones IP limpias. 2. Desactivar y reactivar el adaptador Wi-Fi en Windows. 3. Probar si otros dispositivos (como el celular) navegan.',
      netacadTip: 'Regla Cisco: Esperar 30 segundos antes de reconectar el módem permite que los condensadores internos se descarguen por completo y se restablezca la sesión con el proveedor de internet.'
    }
  };

  window.selectTriageCase = function(cardEl, caseKey) {
    document.querySelectorAll('.triage-case-btn').forEach(c => c.classList.remove('is-active-mint'));
    cardEl.classList.add('is-active-mint');

    const data = TRIAGE_CASES[caseKey];
    if (!data) return;

    const titleEl = document.getElementById('triageDetailTitle');
    const badgeEl = document.getElementById('triageDetailBadge');
    const sympEl = document.getElementById('triageDetailSymp');
    const procEl = document.getElementById('triageDetailProc');
    const tipEl = document.getElementById('triageDetailTip');

    if (titleEl) titleEl.textContent = data.title;
    if (badgeEl) {
      badgeEl.textContent = data.priorityBadge;
      badgeEl.className = 'feat-pill ' + data.badgeClass;
    }
    if (sympEl) sympEl.textContent = data.symptom;
    if (procEl) procEl.textContent = data.procedure;
    if (tipEl) tipEl.textContent = data.netacadTip;
  };

  // ================= 18. SESIÓN 3 - DINÁMICA 4: CIERRE DE BRECHA DE HABILIDADES =================
  const SKILL_CASES = {
    'exact_sciences': {
      title: 'Perfil 1: Estudiante de Ciencias Puras e Informática',
      skillBadge: 'RUTA TÉCNICA Y CIBERSEGURIDAD',
      badgeClass: 'feat-pill-cyan',
      diagnosis: 'Requiere competencias sólidas en programación de sistemas, arquitectura de redes seguras, scripting y análisis de vulnerabilidades.',
      recommendedPath: '• Cursos Cisco NetAcad: Python Essentials, CCNA: Introduction to Networks, CyberOps Associate.\n• Plataformas: OpenEDG Edube, repositorios de código en GitHub y foros de Stack Overflow.\n• Certificaciones: Insignias Credly oficiales de Networking Academy y certificaciones de la industria.',
      outcome: 'Meta Profesional: Dominar la automatización y protección de infraestructura de redes críticas.'
    },
    'health_sciences': {
      title: 'Perfil 2: Estudiante de Ciencias de la Salud y Medicina',
      skillBadge: 'RUTA BIOINFORMÁTICA Y PRIVACIDAD',
      badgeClass: 'feat-pill-mint',
      diagnosis: 'Requiere manejo confidencial de expedientes clínicos electrónicos (EHR), análisis de datos epidemiológicos y telemedicina.',
      recommendedPath: '• Cursos Cisco NetAcad: Introduction to Cybersecurity, Data Analytics Essentials.\n• Plataformas: PubMed, MOOCs de bioestadística médica en Coursera/edX.\n• Competencias éticas: Cumplimiento de normativas de privacidad y custodia de datos sensibles de pacientes.',
      outcome: 'Meta Profesional: Garantizar la privacidad y trazabilidad digital de historiales médicos.'
    },
    'social_sciences': {
      title: 'Perfil 3: Estudiante de Humanidades, Derecho y Economía',
      skillBadge: 'RUTA CIUDADANÍA Y DERECHO DIGITAL',
      badgeClass: 'feat-pill-orange',
      diagnosis: 'Requiere dominio de legislación de propiedad intelectual, protección de datos personales, investigación documental y comunicación estratégica.',
      recommendedPath: '• Cursos Cisco NetAcad: Digital Literacy, Cyber Threat Management.\n• Plataformas: Repositorios de acceso abierto (SciELO, Redalyc, Dialnet), seminarios web de derecho informático.\n• Competencias éticas: Detección pericial de fake news y oratoria virtual asertiva.',
      outcome: 'Meta Profesional: Liderar políticas públicas y marcos regulatorios éticos en la era de la inteligencia artificial.'
    }
  };

  window.selectSkillCase = function(cardEl, caseKey) {
    document.querySelectorAll('.skill-case-btn').forEach(c => c.classList.remove('is-active-purple'));
    cardEl.classList.add('is-active-purple');

    const data = SKILL_CASES[caseKey];
    if (!data) return;

    const titleEl = document.getElementById('skillDetailTitle');
    const badgeEl = document.getElementById('skillDetailBadge');
    const diagEl = document.getElementById('skillDetailDiag');
    const pathEl = document.getElementById('skillDetailPath');
    const outEl = document.getElementById('skillDetailOut');

    if (titleEl) titleEl.textContent = data.title;
    if (badgeEl) {
      badgeEl.textContent = data.skillBadge;
      badgeEl.className = 'feat-pill ' + data.badgeClass;
    }
    if (diagEl) diagEl.textContent = data.diagnosis;
    if (pathEl) pathEl.innerHTML = data.recommendedPath.replace(/\n/g, '<br>');
    if (outEl) outEl.textContent = data.outcome;
  };

  function initQuizWidgets() {
    document.querySelectorAll('.quiz-widget').forEach(widget => {
      const buttons = widget.querySelectorAll('.quiz-btn');
      buttons.forEach(btn => {
        const oc = btn.getAttribute('onclick') || '';
        if (oc.includes(', true,')) {
          btn.setAttribute('data-correct', 'true');
        } else if (oc.includes(', false,')) {
          btn.setAttribute('data-correct', 'false');
        }
      });
    });
  }

  // ================= 14. MOBILE SWIPE + PORTAL HOME BUTTON =================
  function initMobileSupport() {
    const dock = document.getElementById('tacticalDock') || document.querySelector('.nav-dock, .tactical-dock');
    if (dock && !dock.querySelector('.dock-home-btn')) {
      const homeLink = document.createElement('a');
      homeLink.href = '../index.html';
      homeLink.className = 'dock-btn dock-home-btn';
      homeLink.title = 'Menú Principal de Cursos';
      homeLink.setAttribute('aria-label', 'Menú Principal');
      homeLink.innerHTML = '<i class="bi bi-house-door-fill"></i>';
      dock.insertBefore(homeLink, dock.firstChild);
    }

    let touchStartX = 0;
    let touchStartY = 0;
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (e.changedTouches.length !== 1) return;
      if (e.target.closest('input, textarea, .tactical-dock, .nav-dock, .modal-backdrop, .grid-drawer-modal, .presenter-hud, .presenter-hud-drawer')) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        if (dx < 0) goTo(currentIndex + 1);
        else goTo(currentIndex - 1);
      }
    }, { passive: true });
  }

  // ================= 15. BOOTSTRAP INITIALIZATION =================
  document.addEventListener('DOMContentLoaded', () => {
    scaleStage();
    updateUI();
    initPasswordTester();
    initQuizWidgets();
    initMobileSupport();
  });

})();

