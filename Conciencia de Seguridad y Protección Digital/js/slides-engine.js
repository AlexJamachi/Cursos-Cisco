/* =====================================================================
   CISCO NETACAD & UMSA // CONCIENCIA SOBRE SEGURIDAD Y PROTECCIÓN DIGITAL
   Slides Engine + Distributed Interactive Security Dynamics
   Course: Conciencia sobre Seguridad y Protección Digital - Viernes 17:30-19:00 Virtual
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
  const gridModal = document.getElementById('gridModal');
  const presenterHud = document.getElementById('presenterHud');
  const helpModal = document.getElementById('helpModal');
  const gridBtn = document.getElementById('gridBtn');
  const presenterBtn = document.getElementById('presenterBtn');
  const fsBtn = document.getElementById('fsBtn');
  const helpBtn = document.getElementById('helpBtn');

  const TRANSITIONS = ['push', 'wipe', 'circle', 'push', 'split'];
  let transitionCount = 0;

  function goTo(index) {
    if (index < 0 || index >= totalSlides || index === currentIndex || isTransitioning) return;
    isTransitioning = true;
    stage.classList.add('is-transitioning');
    const dir = index > currentIndex ? 1 : -1;
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
    }, 520);

    currentIndex = index;
    updateUI();
    if (document.body.classList.contains('is-mobile-view')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function updateUI() {
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === totalSlides - 1;

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
    const dockCounter = document.getElementById('dockCounter');
    if (dockCounter && !dockCurr) {
      dockCounter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(totalSlides).padStart(2, '0')}`;
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
      const desc = slide.getAttribute('data-desc') || 'Conciencia sobre Seguridad y Protección Digital';

      card.innerHTML = `
        <div>
          <div class="thumb-num">SLIDE ${String(idx + 1).padStart(2, '0')}</div>
          <div class="thumb-title">${title}</div>
          <div class="thumb-desc">${desc}</div>
        </div>
        <div style="font-family:var(--font-mono); font-size:10px; color:var(--cyber-purple-neon); margin-top:8px;">
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
    const notesEl = document.getElementById('hudSpeakerNotes') || document.getElementById('hudSlideNotes');
    const titleEl = document.getElementById('hudSlideTitle');
    const descEl = document.getElementById('hudSlideDesc');
    const progEl = document.getElementById('hudProgressText');
    const nextTitleEl = document.getElementById('hudNextTitle');
    const nextDescEl = document.getElementById('hudNextDesc');
    const curSlide = slides[currentIndex];
    if (curSlide) {
      const notes = curSlide.getAttribute('data-notes') || 'Sin notas pedagógicas para esta diapositiva.';
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
        const nextDesc = nextSlide.getAttribute('data-desc') || 'Continuación de seguridad digital.';
        nextTitleEl.textContent = `${currentIndex + 2}. ${nextTitle}`;
        if (nextDescEl) nextDescEl.textContent = nextDesc;
      } else {
        const isSes3 = document.title.includes('Sesión 3');
        const isSes2 = document.title.includes('Sesión 2');
        nextTitleEl.textContent = isSes3
          ? 'Fin del Curso (Sesión 3)'
          : (isSes2 ? 'Fin de la Sesión 2' : 'Fin del Módulo 1');
        if (nextDescEl) nextDescEl.textContent = isSes3
          ? '¡Módulos 4 y 5 completados! Programa integral finalizado.'
          : (isSes2 ? '¡Sesión 2 (Módulos 2 y 3) completada con éxito!' : '¡Sesión 1 completada con éxito!');
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

  const pauseBtn = document.getElementById('hudTimerPauseBtn');
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      timerRunning = !timerRunning;
      pauseBtn.innerHTML = timerRunning 
        ? '<i class="bi bi-pause-fill"></i> Pausar' 
        : '<i class="bi bi-play-fill"></i> Reanudar';
    });
  }

  const resetBtn = document.getElementById('hudTimerResetBtn') || document.getElementById('resetTimerBtn');
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
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') e.target.blur();
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

  // ================= 8. CHECKPOINT QUIZZES (REVELADO INTELIGENTE) =================
  window.revealQuiz = function(clickedBtn, isCorrect, expId, message) {
    const widget = clickedBtn.closest('.bento-card, .quiz-widget') || clickedBtn.parentElement;
    if (!widget) return;

    const allBtns = widget.querySelectorAll('.quiz-btn');
    const expBox = document.getElementById(expId) || widget.querySelector('.quiz-explanation');

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
              <div style="font-family:var(--font-mono); font-size:13px; font-weight:800; color:var(--pop-mint); text-transform:uppercase; margin-bottom:2px;">
                ¡Respuesta Correcta! // Criterio Cisco NetAcad
              </div>
              <div style="font-size:14.5px; color:#F1F5F9; line-height:1.45;">${message}</div>
            </div>
          </div>
        `;
      } else {
        expBox.classList.add('is-incorrect-box');
        expBox.innerHTML = `
          <div style="display:flex; align-items:flex-start; gap:10px;">
            <i class="bi bi-x-circle-fill" style="color:var(--pop-coral); font-size:22px; flex-shrink:0; margin-top:2px;"></i>
            <div style="flex:1;">
              <div style="font-family:var(--font-mono); font-size:13px; font-weight:800; color:var(--pop-coral); text-transform:uppercase; margin-bottom:2px;">
                Respuesta Incorrecta &bull; <span style="color:var(--pop-mint); font-weight:800;">La opción correcta es la resaltada en VERDE</span>
              </div>
              <div style="font-size:14.5px; color:#F1F5F9; line-height:1.45;">${message}</div>
            </div>
          </div>
        `;
      }
    }
  };

  // ================= 9. DINÁMICA 1: CLASIFICADOR TÁCTICO DE AMENAZAS =================
  window.selectThreatCase = function(cardEl, threatType, title, desc, advice) {
    document.querySelectorAll('.threat-item-card').forEach(c => c.classList.remove('is-active-threat'));
    cardEl.classList.add('is-active-threat');

    const detailTitle = document.getElementById('threatDetailTitle');
    const detailBadge = document.getElementById('threatDetailBadge');
    const detailDesc = document.getElementById('threatDetailDesc');
    const detailAdvice = document.getElementById('threatDetailAdvice');

    if (detailTitle) detailTitle.textContent = title;
    if (detailBadge) {
      detailBadge.textContent = threatType;
      detailBadge.className = 'feat-pill feat-pill-purple';
    }
    if (detailDesc) detailDesc.textContent = desc;
    if (detailAdvice) detailAdvice.textContent = advice;
  };

  // ================= 10. DINÁMICA 2: AUDITOR DE HUELLA DIGITAL =================
  let activeHabitsCount = 0;
  window.toggleHabit = function(el, riskPoints) {
    const isChecked = el.classList.toggle('is-checked');
    const checkIcon = el.querySelector('.habit-check-icon');
    if (checkIcon) {
      checkIcon.className = isChecked 
        ? 'bi bi-check-square-fill habit-check-icon' 
        : 'bi bi-square habit-check-icon';
      checkIcon.style.color = isChecked ? 'var(--warn-amber)' : 'var(--text-muted)';
    }

    const allChecked = document.querySelectorAll('.footprint-habit-toggle.is-checked').length;
    const meterFill = document.getElementById('footprintMeterFill');
    const riskVerdict = document.getElementById('footprintRiskVerdict');
    const riskDesc = document.getElementById('footprintRiskDesc');

    let pct = (allChecked / 5) * 100;
    if (meterFill) {
      meterFill.style.width = pct + '%';
      if (pct <= 20) meterFill.style.background = 'var(--pop-mint)';
      else if (pct <= 60) meterFill.style.background = 'var(--warn-amber)';
      else meterFill.style.background = 'var(--pop-coral)';
    }

    if (riskVerdict && riskDesc) {
      if (allChecked === 0) {
        riskVerdict.textContent = 'HUELLA MÍNIMA Y SEGURA';
        riskVerdict.style.color = 'var(--pop-mint)';
        riskDesc.textContent = 'Tus publicaciones son privadas y reflexivas. Tu identidad está bien protegida.';
      } else if (allChecked <= 2) {
        riskVerdict.textContent = 'EXPOSICIÓN MODERADA';
        riskVerdict.style.color = 'var(--warn-amber)';
        riskDesc.textContent = 'Compartes detalles cotidianos que podrían usarse para perfilar tus rutinas o gustos.';
      } else {
        riskVerdict.textContent = 'ALTA VULNERABILIDAD DIGITAL';
        riskVerdict.style.color = 'var(--pop-coral)';
        riskDesc.textContent = 'Peligro: Empleadores o estafadores pueden rastrear tus opiniones, familiares y ubicación.';
      }
    }
  };

  // ================= 11. DINÁMICA 3: DETECTOR DE DEEPFAKES =================
  window.setDeepfakeLens = function(btnEl, lensType) {
    document.querySelectorAll('.deepfake-lens-btn').forEach(b => b.classList.remove('is-active-lens'));
    btnEl.classList.add('is-active-lens');

    const lensTitle = document.getElementById('deepfakeLensTitle');
    const lensDesc = document.getElementById('deepfakeLensDesc');
    const lensSignal = document.getElementById('deepfakeLensSignal');

    const LENSES = {
      'blink': {
        title: 'Lente 1: Tasa de Parpadeo y Movimiento Ocular',
        desc: 'Los algoritmos de IA tradicionales entrenan con fotos estáticas donde los ojos casi siempre están abiertos. Por ello, los deepfakes parpadean con frecuencia anormalmente baja o con movimientos rígidos.',
        signal: 'Señal de Alarma: La persona habla durante 30 segundos sin pestañear una sola vez o el iris tiene reflejos incoherentes.'
      },
      'lipsync': {
        title: 'Lente 2: Sincronización Labial y Fonemas Dentales',
        desc: 'La IA superpone audio clonado en el video, pero le cuesta alinear sonidos explosivos (como "B", "P", "M") donde los labios deben cerrarse por completo.',
        signal: 'Señal de Alarma: El audio emite palabras con la boca entreabierta o hay un micro-desfase de 0.2 segundos entre sonido y movimiento.'
      },
      'edges': {
        title: 'Lente 3: Artefactos en Bordes de Mandíbula y Pelo',
        desc: 'El generador de la red antagónica (GAN) suele fallar en las transiciones de la piel con el cuello, los mechones de cabello y las patillas de los anteojos.',
        signal: 'Señal de Alarma: Un halo borroso alrededor del rostro, piel con textura plástica excesivamente lisa o dientes borrosos.'
      },
      'artifacts': {
        title: 'Lente 3: Artefactos en Bordes de Mandíbula y Pelo',
        desc: 'El generador de la red antagónica (GAN) suele fallar en las transiciones complejas: la línea de la mandíbula con el cuello, los mechones de cabello individuales y los bordes de anteojos o aros.',
        signal: 'Señal de Alarma: Un halo borroso alrededor del rostro, piel con textura plástica irreal o accesorios que titilan y desaparecen al mover la cabeza.'
      }
    };

    if (LENSES[lensType]) {
      if (lensTitle) lensTitle.textContent = LENSES[lensType].title;
      if (lensDesc) lensDesc.textContent = LENSES[lensType].desc;
      if (lensSignal) lensSignal.textContent = LENSES[lensType].signal;
    }
  };

  // ================= 12. DINÁMICA 4: SIMULADOR EMAILPAL (PHISHING/SPAM) =================
  let selectedEmailId = 'email1';

  const EMAILS_DB = {
    'email1': {
      from: 'rewards@lotterywinners-global.xyz',
      subject: '¡Felicidades! Ganaste 50,000 USD en la Lotería Internacional',
      body: 'Estimado ganador, tu cuenta fue seleccionada en nuestro sorteo. Para reclamar tus fondos, haz clic en el enlace adjunto y llena tus datos bancarios y número de seguridad social en las próximas 2 horas.',
      correctAction: 'phishing',
      feedbackPhishing: '¡CORRECTO! Es un intento clásico de Phishing con urgencia extrema y promesa de dinero falso para robar datos bancarios.',
      feedbackSpam: 'Incorrecto: Esto no es solo publicidad molesta, es un intento de fraude financiero grave (Phishing). Debe reportarse.',
      feedbackInbox: '¡PELIGRO! Mover este correo a la bandeja de entrada expone tus datos bancarios al fraude.'
    },
    'email2': {
      from: 'security@yourbankalerts-urgent.com',
      subject: 'URGENTE: Tu cuenta bancaria ha sido bloqueada',
      body: 'Hemos detectado actividad sospechosa en tus tarjetas. Ingresa de inmediato a nuestro portal seguro para verificar tu clave de acceso o tu cuenta será suspendida definitivamente.',
      correctAction: 'phishing',
      feedbackPhishing: '¡CORRECTO! Los atacantes se hacen pasar por bancos para robar tus credenciales (Spoofing). Nunca hagas clic en enlaces de supuestos bloqueos.',
      feedbackSpam: 'Incorrecto: Suplantar la identidad de un banco es un ciberataque de Phishing, no simple spam.',
      feedbackInbox: '¡ERROR CRÍTICO! Caer en esta trampa entregaría tus claves bancarias a los ciberdelincuentes.'
    },
    'email3': {
      from: 'info@taller-escrituracreativa.org',
      subject: 'Confirmación de inscripción: Taller de Escritura Creativa',
      body: 'Hola, te confirmamos que tu plaza en el Taller de Escritura Creativa está reservada. Por favor, responde a este correo indicando si asistirás en horario matutino o vespertino para asignarte tu grupo.',
      correctAction: 'inbox',
      feedbackPhishing: 'Incorrecto: Es el correo que estabas esperando de tu taller. El remitente es legítimo y no pide contraseñas.',
      feedbackSpam: 'Incorrecto: Este correo cayó por error en spam, pero es un mensaje educativo genuino que necesitas responder.',
      feedbackInbox: '¡EXCELENTE! Cisco destaca la importancia de revisar la carpeta de spam para rescatar correos legítimos que requieren tu respuesta.'
    }
  };

  window.selectEmailItem = function(rowEl, emailId) {
    document.querySelectorAll('.email-row-item').forEach(r => r.classList.remove('is-selected'));
    rowEl.classList.add('is-selected');
    selectedEmailId = emailId;

    const data = EMAILS_DB[emailId];
    if (!data) return;

    const viewFrom = document.getElementById('emailViewFrom');
    const viewSubject = document.getElementById('emailViewSubject');
    const viewBody = document.getElementById('emailViewBody');
    const feedbackBox = document.getElementById('emailTriageFeedback');

    if (viewFrom) viewFrom.textContent = data.from;
    if (viewSubject) viewSubject.textContent = data.subject;
    if (viewBody) viewBody.textContent = data.body;
    if (feedbackBox) {
      feedbackBox.className = 'quiz-explanation';
      feedbackBox.style.display = 'none';
    }
  };

  window.triageEmail = function(actionTaken) {
    const data = EMAILS_DB[selectedEmailId];
    if (!data) return;

    const feedbackBox = document.getElementById('emailTriageFeedback');
    if (!feedbackBox) return;

    feedbackBox.style.display = 'block';
    feedbackBox.classList.add('show');
    feedbackBox.classList.remove('is-correct-box', 'is-incorrect-box');

    const isSuccess = (actionTaken === data.correctAction);
    if (isSuccess) {
      feedbackBox.classList.add('is-correct-box');
      let msg = (actionTaken === 'phishing') ? data.feedbackPhishing : data.feedbackInbox;
      feedbackBox.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:8px;">
          <i class="bi bi-shield-check" style="color:var(--pop-mint); font-size:18px; flex-shrink:0;"></i>
          <div><strong style="color:var(--pop-mint);">¡Decisión Correcta!</strong> ${msg}</div>
        </div>
      `;
    } else {
      feedbackBox.classList.add('is-incorrect-box');
      let msg = (actionTaken === 'phishing') ? data.feedbackPhishing : (actionTaken === 'spam' ? data.feedbackSpam : data.feedbackInbox);
      feedbackBox.innerHTML = `
        <div style="display:flex; align-items:flex-start; gap:8px;">
          <i class="bi bi-shield-exclamation" style="color:var(--pop-coral); font-size:18px; flex-shrink:0;"></i>
          <div><strong style="color:var(--pop-coral);">Acción Inadecuada:</strong> ${msg}</div>
        </div>
      `;
    }
  };

  // ================= 12.1 DINÁMICA 1 SESIÓN 2: SIMULADOR TÁCTICO DE ENDPOINTS =================
  const ENDPOINT_CASES_DB = {
    case1: {
      title: 'Caso 1: Smartphone Extraviado en Transporte Público',
      badge: 'INCIDENTE CRÍTICO // HARDWARE',
      badgeClass: 'feat-pill feat-pill-purple',
      threat: 'Pérdida física del dispositivo sin cifrado de hardware ni bloqueo robusto. Riesgo inminente de acceso a cuentas de correo institucional, tokens bancarios y archivos privados.',
      protocol: '1. Activar inmediatamente el bloqueo y borrado remoto mediante "Encontrar mi dispositivo" (Google Find Hub / Apple iCloud) desde otro equipo.<br>2. Notificar de urgencia a la operadora telefónica para bloquear el código IMEI y suspender la tarjeta SIM.<br>3. Revocar sesiones activas y cambiar contraseñas maestras desde una PC segura.',
      rule: 'El 80% de las brechas por pérdida de dispositivos se mitigan si el terminal cuenta con cifrado nativo, PIN alfanumérico fuerte (evitar patrones simples) y borrado remoto preventivo.'
    },
    case2: {
      title: 'Caso 2: Laptop con Sistema Operativo y Antivirus Desactualizados',
      badge: 'VULNERABILIDAD ZERO-DAY // ENDPOINT',
      badgeClass: 'feat-pill feat-pill-amber',
      threat: 'Exposición directa a exploits de ejecución remota de código y fallas de seguridad conocidas públicamente (CVEs) sin parchar en el sistema operativo y controladores.',
      protocol: '1. Habilitar de inmediato las actualizaciones automáticas en Windows Update o macOS.<br>2. Mantener activado Microsoft Defender o Antivirus corporativo con firmas de heurística al día.<br>3. Configurar autenticación biométrica o PIN robusto vinculado a chip TPM físico (Windows Hello).',
      rule: 'Cisco NetAcad subraya que instalar parches en los primeros 14 días reduce el riesgo de compromiso por malware automatizado en más de un 90%.'
    },
    case3: {
      title: 'Caso 3: Ataque de SIM Swapping (Suplantación de Identidad Celular)',
      badge: 'SECUESTRO DE LÍNEA // ALTA GRAVEDAD',
      badgeClass: 'feat-pill feat-pill-purple',
      threat: 'El atacante engaña a la compañía telefónica mediante ingeniería social para transferir tu número a un chip bajo su control, interceptando llamadas y códigos 2FA por SMS.',
      protocol: '1. Si el teléfono pierde señal de forma súbita ("Sin Servicio"), contactar de inmediato a la operadora desde otra línea.<br>2. Migrar de inmediato el 2FA de SMS a aplicaciones autenticadoras (Google Authenticator, Microsoft Authenticator) o llaves físicas FIDO2.<br>3. Exigir a la compañía telefónica un PIN verbal de seguridad para autorizar cualquier trámite de portabilidad o duplicado de chip.',
      rule: 'El SMS nunca fue diseñado como estándar de autenticación segura. Las aplicaciones TOTP y llaves de seguridad físicas son completamente inmunes al SIM Swapping.'
    },
    case4: {
      title: 'Caso 4: Gestión Insegura de Contraseñas (Reutilización y Notas)',
      badge: 'BRECHA DE CREDENCIALES // HIGIENE DIGITAL',
      badgeClass: 'feat-pill feat-pill-cyan',
      threat: 'Uso de la misma clave débil en múltiples portales o almacenamiento en archivos de texto (.txt/Excel) sin cifrar, altamente vulnerables a troyanos infostealers.',
      protocol: '1. Instalar un gestor de contraseñas de conocimiento cero (Zero-Knowledge) como Bitwarden o 1Password.<br>2. Definir una contraseña maestra memorable pero compleja (frase de paso de 4 o más palabras aleatorias).<br>3. Generar credenciales únicas de 16+ caracteres alfanuméricos para cada servicio y activar 2FA.',
      rule: 'Un gestor de contraseñas cifra tus credenciales localmente con AES-256 antes de sincronizar con la nube. Si un portal sufre un hackeo masivo, tus demás cuentas quedan protegidas.'
    }
  };

  window.selectEndpointCase = function(btnEl, caseId) {
    document.querySelectorAll('.endpoint-case-btn').forEach(b => b.classList.remove('is-active-case'));
    if (btnEl) btnEl.classList.add('is-active-case');

    const data = ENDPOINT_CASES_DB[caseId];
    if (!data) return;

    const tEl = document.getElementById('endpointDetailsTitle');
    const bEl = document.getElementById('endpointDetailsBadge');
    const thEl = document.getElementById('endpointDetailsThreat');
    const pEl = document.getElementById('endpointDetailsProtocol');
    const rEl = document.getElementById('endpointDetailsRule');

    if (tEl) tEl.textContent = data.title;
    if (bEl) {
      bEl.textContent = data.badge;
      bEl.className = data.badgeClass;
    }
    if (thEl) thEl.innerHTML = data.threat;
    if (pEl) pEl.innerHTML = data.protocol;
    if (rEl) rEl.innerHTML = data.rule;
  };

  // ================= 12.2 DINÁMICA 2 SESIÓN 2: AUDITOR TÁCTICO DE REDES Y ROUTERS =================
  const NETWORK_AUDIT_DB = {
    net1: {
      title: 'Escenario 1: Router Wi-Fi Hogareño con Credenciales de Fábrica',
      badge: 'ACCESO PERIMETRAL VULNERABLE',
      badgeClass: 'feat-pill feat-pill-purple',
      threat: 'Módem/Router con contraseña administrativa por defecto ("admin/admin" o "1234") y cifrado WEP o WPA obsoleto, expuesto a intrusiones de red y secuestro de DNS.',
      protocol: '1. Acceder a la IP de puerta de enlace (192.168.1.1 o 192.168.0.1) desde el navegador.<br>2. Cambiar inmediatamente la contraseña maestra del panel de administración del router.<br>3. Configurar cifrado WPA3-Personal (o WPA2-AES como estándar mínimo) con clave robusta.<br>4. Desactivar WPS (Wi-Fi Protected Setup) y bloquear la gestión remota desde la interfaz WAN.',
      rule: 'El router es la fortaleza perimetral de tu hogar. Quien controla el router puede interceptar o redirigir todo el tráfico de todos los dispositivos de la casa.'
    },
    net2: {
      title: 'Escenario 2: Conexión a Wi-Fi Público Abierto en Cafetería o Aeropuerto',
      badge: 'MAN-IN-THE-MIDDLE // ROGUE AP',
      badgeClass: 'feat-pill feat-pill-amber',
      threat: 'Red abierta sin clave donde cualquier atacante puede capturar paquetes mediante sniffers (Wireshark) o clonar un punto de acceso gemelo malicioso ("Evil Twin").',
      protocol: '1. No ingresar a cuentas bancarias, pasarelas de pago ni correos críticos en redes públicas abiertas.<br>2. Conectar de inmediato una Red Privada Virtual (VPN) con cifrado militar de extremo a extremo.<br>3. Verificar estrictamente que cada página web utilice HTTPS con candado y certificado TLS válido.<br>4. Preferir compartir conexión de datos móviles 4G/5G (tethering) desde el celular.',
      rule: 'Una VPN encapsula todo tu tráfico en un túnel criptográfico seguro; aunque el atacante capture los paquetes en el aire, solo verá datos cifrados indescifrables.'
    },
    net3: {
      title: 'Escenario 3: Computadora de Uso Público en Biblioteca o Cibercafé',
      badge: 'ESPIONAJE LOCAL // KEYLOGGERS',
      badgeClass: 'feat-pill feat-pill-purple',
      threat: 'Terminales compartidas que pueden albergar keyloggers por software o hardware físico en puertos USB, además de extensiones de navegador diseñadas para capturar sesiones.',
      protocol: '1. Jamás marcar la opción "Recordar contraseña" o "Mantener la sesión iniciada".<br>2. Abrir siempre ventanas de navegación privada o modo incógnito para evitar almacenamiento de cookies locales.<br>3. Cerrar sesión explícitamente en cada servicio y reiniciar el equipo antes de marcharse.<br>4. Evitar conectar memorias USB personales que contengan trabajos o información confidencial.',
      rule: 'En una máquina pública debes operar bajo la premisa de "Cero Confianza" (Zero Trust): asume que el teclado y la memoria del sistema están siendo monitoreados.'
    },
    net4: {
      title: 'Escenario 4: Dispositivos Inteligentes IoT en la Red Principal Doméstica',
      badge: 'SEGMENTACIÓN // AISLAMIENTO',
      badgeClass: 'feat-pill feat-pill-cyan',
      threat: 'Cámaras IP económicas, Smart TVs y focos inteligentes compartiendo la misma red LAN que computadoras de trabajo. Su firmware rara vez se actualiza y contiene puertas traseras.',
      protocol: '1. Habilitar la función de "Red de Invitados" (Guest Network) en el panel del router.<br>2. Conectar exclusivamente a dicha red aislada todos los periféricos domóticos e IoT.<br>3. Reservar la red Wi-Fi privada principal para laptops, teléfonos personales y discos NAS con firewall activo.',
      rule: 'La segmentación de red detiene el movimiento lateral: si una cámara IP vulnerable es hackeada por una botnet, el ciberdelincuente no podrá saltar a tus archivos personales.'
    }
  };

  window.selectNetworkAuditCase = function(btnEl, caseId) {
    document.querySelectorAll('.network-case-btn').forEach(b => b.classList.remove('is-active-case'));
    if (btnEl) btnEl.classList.add('is-active-case');

    const data = NETWORK_AUDIT_DB[caseId];
    if (!data) return;

    const tEl = document.getElementById('networkAuditTitle');
    const bEl = document.getElementById('networkAuditBadge');
    const thEl = document.getElementById('networkAuditThreat');
    const pEl = document.getElementById('networkAuditProtocol');
    const rEl = document.getElementById('networkAuditRule');

    if (tEl) tEl.textContent = data.title;
    if (bEl) {
      bEl.textContent = data.badge;
      bEl.className = data.badgeClass;
    }
    if (thEl) thEl.innerHTML = data.threat;
    if (pEl) pEl.innerHTML = data.protocol;
    if (rEl) rEl.innerHTML = data.rule;
  };

  // ================= 12.3 DINÁMICA 3 SESIÓN 2: LABORATORIO FORENSE ANTI-RASTREO =================
  const TRACKING_CASES_DB = {
    track1: {
      title: 'Vector 1: Cookies de Terceros y Rastreo Publicitario Cruzado',
      badge: 'RASTREO MULTISITIO // MARKETING',
      badgeClass: 'feat-pill feat-pill-amber',
      mec: 'Fragmentos de código inyectados por dominios externos a la página que visitas. Siguen tu navegación a través de cientos de sitios web para construir un perfil detallado de tus gustos, ideología y hábitos de consumo.',
      defense: '1. Configurar el navegador para bloquear cookies de terceros de forma predeterminada.<br>2. Utilizar extensiones de privacidad de código abierto como uBlock Origin o Privacy Badger.<br>3. Limpiar con regularidad el almacenamiento local de cookies y la memoria caché del navegador.',
      rule: 'Las cookies propias son útiles porque recuerdan tu idioma o carrito de compras; las cookies de terceros existen primordialmente para vigilar tus hábitos de navegación.'
    },
    track2: {
      title: 'Vector 2: Web Beacons (Balizas Web / Píxeles Invisibles de 1x1)',
      badge: 'PÍXEL ESPÍA // VIGILANCIA',
      badgeClass: 'feat-pill feat-pill-purple',
      mec: 'Imágenes transparentes microscópicas de un solo píxel incrustadas en correos electrónicos o páginas web. Al abrir el correo, la imagen se descarga del servidor remoto, confirmando tu IP, ubicación y hora de apertura.',
      defense: '1. Desactivar en el cliente de correo (Gmail, Outlook) la opción de "Cargar imágenes externas automáticamente".<br>2. Previsualizar mensajes sospechosos en formato de texto plano.<br>3. Utilizar herramientas de alias de correo con protección de privacidad (DuckDuckGo Email Protection o Apple Private Relay).',
      rule: 'Pregunta oficial Cisco NetAcad: Las balizas web no requieren que hagas clic en ningún botón; el simple hecho de abrir el correo ya transmite tus datos al rastreador.'
    },
    track3: {
      title: 'Vector 3: Device Fingerprinting (Huella Digital de Hardware)',
      badge: 'IDENTIFICACIÓN PERSISTENTE',
      badgeClass: 'feat-pill feat-pill-purple',
      mec: 'Algoritmo que sondea decenas de variables de tu sistema: resolución de pantalla, fuentes tipográficas instaladas, tarjeta gráfica (WebGL), plugins y zona horaria. Genera un identificador único con más del 99% de exactitud.',
      defense: '1. Emplear navegadores diseñados con resistencia nativa al fingerprinting (Brave, o Firefox con privacy.resistFingerprinting).<br>2. Evitar instalar tipografías o extensiones exóticas que hagan única tu configuración en la red.<br>3. Aislar navegación sensible en perfiles de usuario independientes.',
      rule: 'A diferencia de las cookies, el fingerprinting no se puede eliminar borrando el historial, ya que se calcula dinámicamente a partir del hardware y software de tu máquina.'
    },
    track4: {
      title: 'Vector 4: Mitos y Realidades del Modo Incógnito / Privado',
      badge: 'AUDITORÍA DE PRIVACIDAD // MITOS',
      badgeClass: 'feat-pill feat-pill-cyan',
      mec: 'Mito extendido: "Navegar de incógnito me hace anónimo e invisible en Internet". Realidad: Solo evita guardar en la computadora local el historial de páginas, cookies y formularios al cerrar la ventana.',
      defense: '1. Comprender que tu proveedor de internet (ISP), la red de la UMSA o tu empleador siguen registrando cada dominio que visitas.<br>2. Los sitios visitados aún te identifican si inicias sesión en tus cuentas personales mientras navegas.<br>3. Para ocultar tu dirección IP y cifrar el tráfico en tránsito, es indispensable sumar una VPN confiable o Tor.',
      rule: 'Pregunta oficial Cisco NetAcad: El modo incógnito cuida tu privacidad frente a otras personas que usen la misma máquina física, pero NO frente a intermediarios de red ni sitios remotos.'
    }
  };

  window.selectTrackingCase = function(btnEl, caseId) {
    document.querySelectorAll('.tracking-case-btn').forEach(b => b.classList.remove('is-active-case'));
    if (btnEl) btnEl.classList.add('is-active-case');

    const data = TRACKING_CASES_DB[caseId];
    if (!data) return;

    const tEl = document.getElementById('trackingAuditTitle');
    const bEl = document.getElementById('trackingAuditBadge');
    const mEl = document.getElementById('trackingAuditMec');
    const dEl = document.getElementById('trackingAuditDefense');
    const rEl = document.getElementById('trackingAuditRule');

    if (tEl) tEl.textContent = data.title;
    if (bEl) {
      bEl.textContent = data.badge;
      bEl.className = data.badgeClass;
    }
    if (mEl) mEl.innerHTML = data.mec;
    if (dEl) dEl.innerHTML = data.defense;
    if (rEl) rEl.innerHTML = data.rule;
  };

  // ================= 12.4 DINÁMICA 4 SESIÓN 2: ESCÁNER DE POLÍTICAS EXPLOTADORAS Y ECO-VERIFICACIÓN =================
  const AUDIT_POLICY_DB = {
    pol1: {
      title: 'Caso 1: App del Clima o Linterna que Exige Acceso a Contactos y GPS Preciso',
      badge: 'PERMISOS EXCESIVOS // EXPLOTACIÓN',
      badgeClass: 'feat-pill feat-pill-purple',
      redflag: 'La aplicación solicita permisos desmedidos que no guardan relación alguna con su funcionalidad básica: libreta de contactos, micrófono, archivos y geolocalización permanente 24/7.',
      legal: 'Estas herramientas monetizan comercializando historiales de ubicación y listas de contactos con brokers de datos publicitarios. Infringen flagrantemente el principio de minimización de datos.',
      rule: 'Denegar los permisos sospechosos en los ajustes del sistema operativo. Si la app se bloquea o rehúsa operar sin ellos, desinstalarla y buscar opciones verificadas y limpias.'
    },
    pol2: {
      title: 'Caso 2: Términos de Servicio con Arbitraje Obligatorio y Modificación Unilateral',
      badge: 'TRAMPA CONTRACTUAL VINCULANTE',
      badgeClass: 'feat-pill feat-pill-amber',
      redflag: 'Cláusula que prohíbe al usuario demandar judicialmente a la empresa o participar en demandas colectivas, forzando un arbitraje privado costeado por la compañía, sumado al cambio unilateral de términos sin aviso.',
      legal: 'Los Términos de Servicio son contratos legalmente vinculantes. Al pulsar "Acepto", el usuario cede protecciones legales clave y otorga licencias para que la empresa use su contenido o perfile sus hábitos.',
      rule: 'Auditar la sección de "Resolución de Controversias" y aprovechar el período de exclusión voluntaria (Opt-out) en los primeros 30 días de suscripción si la plataforma lo contempla.'
    },
    pol3: {
      title: 'Caso 3: Bucle de Validación Social y Publicación Viral Engañosa',
      badge: 'FAKE VS FACT // VERIFICACIÓN',
      badgeClass: 'feat-pill feat-pill-purple',
      redflag: 'Ejemplo Cisco 3.2: "¡Impactante! ¡Comer aguacates puede aumentar sus posibilidades de vivir hasta los 120 años! ¡Los médicos no se lo dirán!". Usa urgencia emocional, exageración y cero fuentes clínicas.',
      legal: 'El ciclo de validación social busca likes y compartidos impulsivos mediante dopamina. Aplicando los 5 pasos Cisco (Pausa y verifique, Costo ambiental, Defensor de alfabetización digital, Limitar acciones innecesarias y Herramientas como Snopes/FactCheck.org): esta publicación NO debe compartirse.',
      rule: 'Nunca compartas por impulso emocional. Si una afirmación de salud no proviene de una institución médica confiable o agencias verificadoras (IFCN), detén el reenvío.'
    },
    pol4: {
      title: 'Caso 4: La Huella de Carbono Digital Oculta: Tráfico Masivo y Nube',
      badge: 'IMPACTO ECOLÓGICO DIGITAL',
      badgeClass: 'feat-pill feat-pill-mint',
      redflag: 'Internet y los centros de datos globales generan aproximadamente el 4% de las emisiones mundiales de CO2, equiparándose al impacto ambiental de toda la aviación comercial global.',
      legal: 'Cada mensaje de correo no deseado almacenado, cada video en 4K reproducido en streaming innecesariamente y cada servicio en la nube obsoleto exige energía constante en racks de servidores y torres de refrigeración.',
      rule: 'Adopta hábitos de ecología digital: elimina correos viejos acumulados, desactiva la reproducción automática en ultra HD en pantallas pequeñas y cancela subscripciones que no utilices.'
    }
  };

  window.selectAuditPolicyCase = function(btnEl, caseId) {
    document.querySelectorAll('.policy-case-btn').forEach(b => b.classList.remove('is-active-case'));
    if (btnEl) btnEl.classList.add('is-active-case');

    const data = AUDIT_POLICY_DB[caseId];
    if (!data) return;

    const tEl = document.getElementById('policyAuditTitle');
    const bEl = document.getElementById('policyAuditBadge');
    const rfEl = document.getElementById('policyAuditRedFlag');
    const lgEl = document.getElementById('policyAuditLegal');
    const rEl = document.getElementById('policyAuditRule');

    if (tEl) tEl.textContent = data.title;
    if (bEl) {
      bEl.textContent = data.badge;
      bEl.className = data.badgeClass;
    }
    if (rfEl) rfEl.innerHTML = data.redflag;
    if (lgEl) lgEl.innerHTML = data.legal;
    if (rEl) rEl.innerHTML = data.rule;
  };

  // ================= 12. SESIÓN 3 INTERACTIVE SIMULATORS (MÓDULOS 4 & 5) =================
  /** Shared helper to update an interactive diagnostic panel without duplicating DOM wiring. */
  function bindCasePanel(btnSelector, btnEl, db, caseId, fieldIds) {
    document.querySelectorAll(btnSelector).forEach(b => b.classList.remove('is-active-case'));
    if (btnEl) btnEl.classList.add('is-active-case');
    const data = db[caseId];
    if (!data) return;

    const tEl = document.getElementById(fieldIds.title);
    const bEl = document.getElementById(fieldIds.badge);
    const p1El = document.getElementById(fieldIds.primary);
    const p2El = document.getElementById(fieldIds.secondary);
    const rEl = document.getElementById(fieldIds.rule);

    if (tEl) tEl.textContent = data.title;
    if (bEl) {
      bEl.textContent = data.badge;
      bEl.className = data.badgeClass;
    }
    if (p1El) p1El.innerHTML = data.primary;
    if (p2El) p2El.innerHTML = data.secondary;
    if (rEl) rEl.innerHTML = data.rule;
  }

  // Dinámica 1 (Módulo 4.0): Auditor de Bienestar Digital & Ergonómico
  const WELLBEING_DB = {
    well1: {
      title: 'Caso 1: Insomnio Crónico por Scroll Nocturno y Luz Azul',
      badge: 'SUEÑO & MELATONINA',
      badgeClass: 'feat-pill feat-pill-purple',
      primary: 'Mirar el teléfono en la cama dispara un círculo vicioso: la luz azul inhibe la producción de melatonina y desajusta el reloj interno, impidiendo dormir aunque el cuerpo esté agotado.',
      secondary: 'Protocolo Cisco 4.0: Establece zonas y horarios libres de tecnología (1 hora antes de dormir y durante las comidas), activa filtro nocturno y sustituye el scroll por lectura física.',
      rule: 'Dormir mejor empieza apagando pantallas 60 minutos antes de acostarte para restaurar tu ciclo natural de melatonina.'
    },
    well2: {
      title: 'Caso 2: Fatiga Ocular Digital y Dolor Cervical / Túnel Carpiano',
      badge: 'ERGONOMÍA & VISIÓN',
      badgeClass: 'feat-pill feat-pill-cyan',
      primary: 'Pasar horas frente al monitor sin pausas causa Síndrome de Visión por Computadora (ojos secos, visión borrosa, cefalea) y lesiones musculoesqueléticas en espalda y muñecas.',
      secondary: 'Protocolo Cisco 4.0: Aplica la Regla 20-20-20 (cada 20 min, descansa 20 s mirando a 20 pies / ~6 m), coloca la pantalla a la altura de los ojos y usa silla con soporte lumbar.',
      rule: 'Configura tu puesto ergonómico hoy y estírate cada hora: tu columna, muñecas y vista son irreemplazables.'
    },
    well3: {
      title: 'Caso 3: Avalancha de Alertas y Fatiga en la Toma de Decisiones',
      badge: 'SOBRECARGA DIGITAL',
      badgeClass: 'feat-pill feat-pill-amber',
      primary: 'El bombardeo continuo de notificaciones, correos y noticias 24/7 agota la capacidad ejecutiva del cerebro, provocando estrés, ansiedad y decisiones impulsivas.',
      secondary: 'Protocolo Cisco 4.0: Silencia todas las alertas no críticas (grupos, redes, noticias) y define dos ventanas fijas al día para revisar correo y redes (mañana y tarde).',
      rule: 'No es solo cuánta información consumes, sino a qué velocidad te interrumpe. Recupera el control desactivando alertas.'
    },
    well4: {
      title: 'Caso 4: Desechos Electrónicos (E-Waste) y Centros de Datos',
      badge: 'PLANETA SANO // 4.0',
      badgeClass: 'feat-pill feat-pill-mint',
      primary: 'Renovar dispositivos innecesariamente acumula residuos electrónicos con químicos nocivos en vertederos, mientras los centros de datos consumen electricidad masiva 24/7.',
      secondary: 'Protocolo Cisco 4.0: Desconecta equipos inactivos, prioriza hardware de bajo consumo y recicla aparatos antiguos en puntos certificados en lugar de desecharlos.',
      rule: 'Cuidar tus hábitos digitales también reduce tu huella de carbono y evita contaminación por basura electrónica.'
    }
  };

  window.selectWellbeingCase = function(btnEl, caseId) {
    bindCasePanel('.wellbeing-case-btn', btnEl, WELLBEING_DB, caseId, {
      title: 'wellbeingTitle',
      badge: 'wellbeingBadge',
      primary: 'wellbeingRisk',
      secondary: 'wellbeingAction',
      rule: 'wellbeingRule'
    });
  };

  // Dinámica 2 (Módulo 4.1): Escáner de Noticias: ¿Hecho, Opinión o Desinformación?
  const FACTCHECK_DB = {
    news1: {
      title: 'Caso 1: Titular Alarmista Sin Autor, Fecha ni Enlaces Primarios',
      badge: 'DESINFORMACIÓN // ALERTA',
      badgeClass: 'feat-pill feat-pill-coral',
      primary: 'Banderas rojas detectadas: usa miedo/urgencia extrema ("¡Urgente antes que lo borren!"), omite autor con credenciales, no tiene fecha visible y proviene de un dominio desconocido sin sección "Sobre nosotros".',
      secondary: 'Verificación Cisco 4.1: Contrasta si al menos 2 medios reconocidos reportan el mismo hecho y consulta verificadores independientes como Snopes, FactCheck.org o PolitiFact.',
      rule: 'Cuando una publicación dispara enojo o pánico inmediato y viene de una sola fuente anónima, detente antes de creerla o reenviarla.'
    },
    news2: {
      title: 'Caso 2: Columna Editorial Mezclada con Reportaje Informativo',
      badge: 'OPINIÓN DISFRAZADA',
      badgeClass: 'feat-pill feat-pill-amber',
      primary: 'Aunque cita un dato real en el primer párrafo, el resto emplea adjetivos subjetivos y creencias personales ("el peor error de la historia") buscando clics e interacción emocional.',
      secondary: 'Verificación Cisco 4.1: Separa mentalmente qué afirmaciones tienen respaldo científico o documental (hechos) y cuáles reflejan sentimientos o interpretaciones del autor (opiniones).',
      rule: 'Las opiniones enriquecen el debate, pero nunca deben confundirse con hechos objetivos ni con evidencia comprobada.'
    },
    news3: {
      title: 'Caso 3: "Cura Milagrosa" Viral Compartida en Grupos Familiares',
      badge: 'RIESGO DE SALUD PÚBLICA',
      badgeClass: 'feat-pill feat-pill-coral',
      primary: 'Cisco recuerda que falsedades sobre tratamientos o vacunas (como ocurrió en COVID-19) llevaron a personas a tomar decisiones peligrosas para su salud basadas en cadenas virales.',
      secondary: 'Verificación Cisco 4.1: Pregúntate si la afirmación cita estudios clínicos o entidades sanitarias oficiales (OMS, ministerios de salud) y evalúa si podría causar daño físico antes de compartir.',
      rule: 'En temas médicos o científicos, exige siempre fuentes oficiales y literatura revisada por pares; jamás reenvíes remedios virales.'
    },
    news4: {
      title: 'Caso 4: Informe Científico con Datos Verificables y Fuente Oficial',
      badge: 'HECHO COMPROBABLE',
      badgeClass: 'feat-pill feat-pill-mint',
      primary: 'Contiene afirmaciones objetivas demostrables ("la Tierra orbita alrededor del Sol"), autoría identificable, fecha de publicación reciente, metodología transparente y múltiples referencias primarias.',
      secondary: 'Verificación Cisco 4.1: Practicar pensamiento crítico no significa dudar de todo cínicamente, sino validar fuente, evidencia y contexto antes de aceptar y difundir.',
      rule: 'Consumir y compartir con discernimiento fortalece la alfabetización digital y reduce la polarización social.'
    }
  };

  window.selectFactCheckCase = function(btnEl, caseId) {
    bindCasePanel('.factcheck-case-btn', btnEl, FACTCHECK_DB, caseId, {
      title: 'factcheckTitle',
      badge: 'factcheckBadge',
      primary: 'factcheckSignal',
      secondary: 'factcheckVerify',
      rule: 'factcheckRule'
    });
  };

  // Dinámica 3 (Módulo 4.2): Entrenador de Algoritmo & Bienestar Flexible
  const ALGORITHM_DB = {
    algo1: {
      title: 'Caso 1: "Solo Abrí el Video Falso por Curiosidad"',
      badge: 'CÁMARA DE ECO ACTIVADA',
      badgeClass: 'feat-pill feat-pill-coral',
      primary: 'El algoritmo no distingue indignación de interés: si te detienes 20 segundos, comentas para discutir o haces clic por morbo en un bulo, el sistema registra preferencia positiva.',
      secondary: 'Ciclo de retroalimentación: En los próximos días tu feed se llenará de contenido similar polarizante, filtrando perspectivas opuestas y reforzando una burbuja de filtro.',
      rule: 'Tus clics e interacciones entrenan al algoritmo. Si algo es desinformación, no lo comentes ni lo abras por curiosidad: desliza rápido.'
    },
    algo2: {
      title: 'Caso 2: Romper la Burbuja y Reentrenar el Feed',
      badge: 'CONTENIDO EQUILIBRADO',
      badgeClass: 'feat-pill feat-pill-cyan',
      primary: 'Buscar activamente fuentes periodísticas confiables, seguir cuentas educativas variadas e ignorar titulares sensacionalistas envía señales nuevas al modelo de recomendación.',
      secondary: 'Control algorítmico Cisco 4.2: Combina la selección consciente de clics con pensamiento crítico y alfabetización mediática para diversificar tu dieta informativa.',
      rule: 'Tenemos poder directo sobre lo que vemos: cada interacción reflexiva con fuentes veraces moldea un feed más saludable.'
    },
    algo3: {
      title: 'Caso 3: Tecnología al Servicio del Bienestar Físico y Mental',
      badge: 'USO PROACTIVO // APPS',
      badgeClass: 'feat-pill feat-pill-mint',
      primary: 'La misma pantalla que puede estresar se transforma en aliada mediante Fitbit, Apple Health o MyFitnessPal (pasos, sueño, nutrición) y Headspace, Calm o InsightTimer (mindfulness).',
      secondary: 'Ventaja de personalización: Permiten fijar recordatorios, ajustar dificultad y complementar objetivos reales con guías confiables (WebMD, Healthline).',
      rule: 'El objetivo no es rechazar la tecnología, sino integrarla intencionalmente para potenciar tu salud física y mental.'
    },
    algo4: {
      title: 'Caso 4: Aplicar el Principio de Bienestar Flexible',
      badge: 'BIENESTAR FLEXIBLE',
      badgeClass: 'feat-pill feat-pill-purple',
      primary: 'Algunos días exigirás alto foco productivo digital; otros necesitarás desconexión física (deporte, cocinar, caminar, familia). La rigidez extrema suele fracasar.',
      secondary: 'Visión Cisco 4.2: No sirves a las reglas rígidas ni a las apps; moldeas la tecnología dinámicamente según tus valores, objetivos y etapa de vida.',
      rule: 'Pequeñas decisiones conscientes (dispositivos, datos y descanso) acumuladas generan un bienestar sostenible a largo plazo.'
    }
  };

  window.selectAlgorithmCase = function(btnEl, caseId) {
    bindCasePanel('.algorithm-case-btn', btnEl, ALGORITHM_DB, caseId, {
      title: 'algorithmTitle',
      badge: 'algorithmBadge',
      primary: 'algorithmEffect',
      secondary: 'algorithmControl',
      rule: 'algorithmRule'
    });
  };

  // Dinámica 4 (Módulo 5.0): Triage Maestro 360° (Integrador Módulos 1–4)
  const MASTER_TRIAGE_DB = {
    master1: {
      title: 'Caso 1: Instalador Crackeado + Misma Clave en Portal Universitario',
      badge: 'MÓDULO 1 + 2 + 4.3',
      badgeClass: 'feat-pill feat-pill-coral',
      primary: 'Riesgo múltiple: Usar software pirateado (Problema 4.3.2) abre puertas traseras (Troyano/Spyware, Mód. 1) e implica sanciones legales/éticas, mientras reutilizar claves habilita Relleno de Credenciales (Mód. 2).',
      secondary: 'Triage Integral: Descarta software pirata, usa alternativas oficiales o libres, ejecuta Análisis Completo antivirus, activa gestor + 2FA por app TOTP y cambia claves reutilizadas.',
      rule: 'Lo "gratis" pirata casi siempre se paga con tus credenciales, tus archivos o tu equipo convertido en zombi.'
    },
    master2: {
      title: 'Caso 2: Queja Laboral en Foro Público desde Wi-Fi de Cafetería',
      badge: 'MÓDULO 1 + 2 + 4.3',
      badgeClass: 'feat-pill feat-pill-amber',
      primary: 'Doble exposición: En Wi-Fi público sin VPN terceros interceptan sesión (Mód. 2), y publicar quejas contra tu empresa en foros creyendo ser anónimo deja huella rastreable (Problema 4.3.3).',
      secondary: 'Triage Integral: Conéctate solo con VPN activa y HTTPS verificado; para inquietudes laborales, utiliza siempre los canales internos apropiados en lugar de foros públicos.',
      rule: 'La huella digital es imborrable y el anonimato en foros rara vez es absoluto: protege tu red y tu reputación profesional.'
    },
    master3: {
      title: 'Caso 3: Alerta Bancaria por SMS + Pérdida Repentina de Señal Móvil',
      badge: 'MÓDULO 1 + 2 + 3',
      badgeClass: 'feat-pill feat-pill-coral',
      primary: 'Ataque combinado: Phishing previo o fuga de datos en la Dark Web expuso tus datos; la pérdida súbita de señal ("Sin Servicio") alerta posible SIM Swapping para capturar códigos 2FA por SMS.',
      secondary: 'Triage Integral: No pulses enlaces del SMS; llama de inmediato a tu operadora móvil y banco, congela tarjetas, migra cuentas a 2FA por app autenticadora y audita permisos.',
      rule: 'Nunca dependas solo de SMS para proteger tu banco: ante señal caída sin motivo, actúa en minutos.'
    },
    master4: {
      title: 'Caso 4: 2:00 AM Reenviando Cadena Emotiva Falsificada',
      badge: 'MÓDULO 3 + 4 + 4.3',
      badgeClass: 'feat-pill feat-pill-purple',
      primary: 'Triple impacto: Luz azul destruyendo sueño y fatiga ocular (4.0), bucle de validación social y consumo eléctrico en la nube (3.2), y difusión involuntaria de desinformación (4.1 / Problema 4.3.1).',
      secondary: 'Triage Integral: Si ya compartiste información falsa sin verificar, elimina la publicación al instante (4.3.1), aplica filtro de fuente/evidencia/contexto y desconecta pantallas antes de dormir.',
      rule: 'Pausar 5 segundos protege la verdad pública, tu salud mental/visual y la huella digital de tu nombre.'
    }
  };

  window.selectMasterTriageCase = function(btnEl, caseId) {
    bindCasePanel('.master-case-btn', btnEl, MASTER_TRIAGE_DB, caseId, {
      title: 'masterTitle',
      badge: 'masterBadge',
      primary: 'masterVector',
      secondary: 'masterResponse',
      rule: 'masterRule'
    });
  };

  // ================= 13. MOBILE SWIPE + PORTAL HOME BUTTON =================
  function initMobileSupport() {
    const dock = document.getElementById('tacticalDock') || document.querySelector('.tactical-dock, .nav-dock');
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

  // ================= 14. BOOTSTRAP INITIALIZATION =================
  scaleStage();
  updateUI();
  initMobileSupport();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      scaleStage();
      updateUI();
      initMobileSupport();
    });
  }

})();
