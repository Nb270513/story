// ==========================================================================
// App-Logik: Zustand, Screen-Routing, Szenen-Rendering, Eventhandler.
// Die Story-Daten kommen aus window.STORY (siehe story.js).
// ==========================================================================

(function () {
  "use strict";

  const STORAGE_KEY = "abenteuer-story-v1";

  // Geschaetzte maximale Szenen-Tiefe (fuer den Fortschrittsbalken).
  const MAX_DEPTH = 4;

  // ---------- State ----------
  const emptyInputs = () => ({
    name1: "", name2: "", name3: "", name4: "", name5: "",
    color: "", animal: "", place: "", food: "", item: "",
    fantasyWord: "", fear: "",
    superpower: "", vehicle: "", weather: "", sound: "",
  });

  const state = {
    inputs: emptyInputs(),
    currentSceneId: "start",
    history: [],       // Szenen-IDs, die schon gesehen wurden
    screen: "start",   // start | input | story | end
  };

  // ---------- Persistenz ----------
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) { /* ignore quota errors */ }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        Object.assign(state.inputs, parsed.inputs || {});
        state.currentSceneId = parsed.currentSceneId || "start";
        state.history = Array.isArray(parsed.history) ? parsed.history : [];
        state.screen = parsed.screen || "start";
      }
    } catch (_) { /* ignore */ }
  }

  // ---------- Platzhalter-Ersetzung ----------
  // Ersetzt {key} im Text durch state.inputs[key].
  function substitute(text) {
    if (!text) return "";
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      const value = state.inputs[key];
      return value ? value : match;
    });
  }

  // ---------- Screen-Routing ----------
  const screens = {
    start: document.getElementById("screen-start"),
    input: document.getElementById("screen-input"),
    story: document.getElementById("screen-story"),
    end:   document.getElementById("screen-end"),
  };

  function showScreen(name) {
    state.screen = name;
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle("is-active", key === name);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    saveState();
  }

  // ---------- Input-Screen ----------
  const form = document.getElementById("form-input");

  function fillFormFromState() {
    Object.keys(state.inputs).forEach((key) => {
      const el = form.elements.namedItem(key);
      if (el) el.value = state.inputs[key] || "";
    });
  }

  function collectInputs() {
    const data = new FormData(form);
    Object.keys(state.inputs).forEach((key) => {
      const raw = data.get(key);
      state.inputs[key] = (raw || "").toString().trim();
    });
  }

  function inputsComplete() {
    return Object.values(state.inputs).every((v) => v && v.length > 0);
  }

  // ---------- Szenen rendern ----------
  const sceneTextEl        = document.getElementById("scene-text");
  const sceneArtEl         = document.getElementById("scene-art");
  const choicesEl          = document.getElementById("scene-choices");
  const progressFill       = document.getElementById("progress-fill");
  const progressText       = document.getElementById("progress-text");
  const storyCard          = document.getElementById("story-card");

  // ---------- Szenen-Art (Emoji-Collage) ----------
  // Rendert den Szenen-Hintergrund: Gradient + grosses Hero-Emoji in der Mitte
  // + mehrere kleine Items drumherum. Positionen werden pseudo-zufaellig
  // (aber deterministisch per Index) gesetzt, damit jede Szene einzigartig aussieht.
  function renderSceneArt(artEl, art) {
    if (!artEl || !art) return;
    artEl.style.background = art.gradient || "linear-gradient(135deg, #ffd4b8, #c9e4ff)";
    artEl.innerHTML = "";

    // Hero-Emoji, gross und mittig
    if (art.hero) {
      const hero = document.createElement("div");
      hero.className = "art-hero";
      hero.textContent = art.hero;
      artEl.appendChild(hero);
    }

    // Items: in 6 vordefinierten Slots rund um die Szene platziert, damit
    // nichts in der Mitte mit dem Hero kollidiert.
    const slots = [
      { x: 10, y: 18, r: -8,  s: 1.1 },
      { x: 82, y: 22, r:  10, s: 0.95 },
      { x: 12, y: 72, r:  6,  s: 1.0 },
      { x: 84, y: 70, r: -12, s: 1.05 },
      { x: 48, y: 14, r:  0,  s: 0.9 },
      { x: 48, y: 84, r:  4,  s: 0.9 },
    ];
    (art.items || []).slice(0, slots.length).forEach((ch, i) => {
      const slot = slots[i];
      const el = document.createElement("div");
      el.className = "art-item";
      el.textContent = ch;
      el.style.left = slot.x + "%";
      el.style.top  = slot.y + "%";
      el.style.transform = `translate(-50%, -50%) rotate(${slot.r}deg) scale(${slot.s})`;
      el.style.animationDelay = (i * 0.15) + "s";
      artEl.appendChild(el);
    });
  }

  function renderScene(sceneId) {
    const scene = window.STORY.scenes[sceneId];
    if (!scene) {
      console.error("Unknown scene:", sceneId);
      return;
    }

    state.currentSceneId = sceneId;

    // Ende-Szene? -> End-Screen zeigen
    if (scene.ending) {
      renderEnding(scene);
      saveState();
      return;
    }

    // Normale Szene
    showScreen("story");

    // kleine Animation beim Wechsel
    storyCard.classList.remove("is-fading");
    // reflow trick, damit die Animation neu startet
    void storyCard.offsetWidth;
    storyCard.classList.add("is-fading");

    sceneTextEl.textContent = substitute(scene.text);
    renderSceneArt(sceneArtEl, scene.art);

    // Choice-Buttons bauen
    choicesEl.innerHTML = "";
    (scene.choices || []).forEach((choice, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice-btn";
      const letter = String.fromCharCode(65 + idx); // A, B
      btn.innerHTML =
        `<span class="choice-letter">${letter}</span>` +
        `<span class="choice-label">${escapeHtml(substitute(choice.label))}</span>`;
      btn.addEventListener("click", () => choose(choice.next));
      choicesEl.appendChild(btn);
    });

    updateProgress();
    saveState();
  }

  function choose(nextId) {
    state.history.push(state.currentSceneId);
    renderScene(nextId);
  }

  function updateProgress() {
    const depth = state.history.length;
    const pct = Math.min(100, Math.round(((depth + 1) / MAX_DEPTH) * 100));
    progressFill.style.width = pct + "%";
    progressText.textContent = `Szene ${depth + 1}`;
  }

  // ---------- Ende-Screen ----------
  const endIconEl     = document.getElementById("end-icon");
  const endLabelEl    = document.getElementById("end-label");
  const endTextEl     = document.getElementById("end-text");
  const endArtEl      = document.getElementById("end-art");

  function renderEnding(scene) {
    const meta = (window.STORY.endings && window.STORY.endings[scene.ending]) || {
      icon: scene.icon || "🎉",
      label: "Ende",
    };
    endIconEl.textContent  = meta.icon;
    endLabelEl.textContent = meta.label;
    endTextEl.textContent  = substitute(scene.text);
    renderSceneArt(endArtEl, scene.art);
    showScreen("end");
  }

  // ---------- Neustart-Logik ----------
  function restartSameNames() {
    state.currentSceneId = "start";
    state.history = [];
    renderScene("start");
  }

  function fullRestart() {
    state.inputs = emptyInputs();
    state.currentSceneId = "start";
    state.history = [];
    form.reset();
    saveState();
    showScreen("start");
  }

  // ---------- Utility ----------
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;",
      "\"": "&quot;", "'": "&#39;",
    }[ch]));
  }

  // ---------- Event-Handler verdrahten ----------
  document.getElementById("btn-go-input").addEventListener("click", () => {
    fillFormFromState();
    showScreen("input");
  });

  document.getElementById("btn-back-start").addEventListener("click", () => {
    showScreen("start");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    collectInputs();
    if (!inputsComplete()) {
      // HTML5-Validierung triggert selbst; hier nur als Fallback
      form.reportValidity();
      return;
    }
    saveState();
    state.currentSceneId = "start";
    state.history = [];
    renderScene("start");
  });

  document.getElementById("btn-restart-story").addEventListener("click", restartSameNames);
  document.getElementById("btn-same-names").addEventListener("click", restartSameNames);
  document.getElementById("btn-full-restart").addEventListener("click", fullRestart);

  // ---------- Initialisierung ----------
  loadState();
  fillFormFromState();

  // Beim Neuladen dort weitermachen, wo man war.
  if (state.screen === "story" && window.STORY.scenes[state.currentSceneId]) {
    renderScene(state.currentSceneId);
  } else if (state.screen === "end" && window.STORY.scenes[state.currentSceneId]) {
    renderEnding(window.STORY.scenes[state.currentSceneId]);
  } else if (state.screen === "input") {
    showScreen("input");
  } else {
    showScreen("start");
  }
})();
