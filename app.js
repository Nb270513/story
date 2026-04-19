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
    group: "",
    color: "", animal: "", place: "", food: "", item: "",
    fear: "", fantasyWord: "",
  });

  // Quick-Pick-Optionen pro Chip-Feld. Format: { value, emoji }.
  // Der "value" landet im Story-Text (Platzhalter-Ersetzung), das Emoji ist Deko.
  const CHIP_OPTIONS = {
    group: [
      { v: "Jungen",   e: "🧒" },
      { v: "Mädchen",  e: "👧" },
      { v: "Gemischt", e: "🧑‍🤝‍🧑" },
    ],
    color: [
      { v: "Rot",    e: "🔴" },
      { v: "Blau",   e: "🔵" },
      { v: "Grün",   e: "🟢" },
      { v: "Lila",   e: "🟣" },
    ],
    animal: [
      { v: "Fuchs",  e: "🦊" },
      { v: "Eule",   e: "🦉" },
      { v: "Drache", e: "🐉" },
      { v: "Löwe",   e: "🦁" },
    ],
    place: [
      { v: "Park",     e: "🌳" },
      { v: "Strand",   e: "🏖️" },
      { v: "Berg",     e: "🏔️" },
      { v: "Schloss",  e: "🏰" },
    ],
    food: [
      { v: "Pizza",      e: "🍕" },
      { v: "Pasta",      e: "🍝" },
      { v: "Burger",     e: "🍔" },
      { v: "Schokolade", e: "🍫" },
    ],
    item: [
      { v: "Schlüssel",      e: "🗝️" },
      { v: "Kristallkugel",  e: "🔮" },
      { v: "Kompass",        e: "🧭" },
      { v: "Schatzkarte",    e: "🗺️" },
    ],
    fear: [
      { v: "Spinnen",          e: "🕷️" },
      { v: "Geister",          e: "👻" },
      { v: "tiefem Wasser",    e: "🌊" },
      { v: "der Dunkelheit",   e: "🌑" },
    ],
  };

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
        // Nur bekannte Keys aus emptyInputs() uebernehmen (alte Felder wie
        // 'superpower' oder 'vehicle' werden dabei sauber verworfen).
        const known = Object.keys(state.inputs);
        const savedInputs = parsed.inputs || {};
        known.forEach((k) => {
          if (typeof savedInputs[k] === "string") state.inputs[k] = savedInputs[k];
        });
        state.currentSceneId = parsed.currentSceneId || "start";
        state.history = Array.isArray(parsed.history) ? parsed.history : [];
        state.screen = parsed.screen || "start";
      }
    } catch (_) { /* ignore */ }
  }

  // ---------- Platzhalter-Ersetzung ----------
  // Ersetzt {key} im Text durch state.inputs[key].
  // Sonderfall fuer {name1}..{name5}: wenn ein Name-Slot leer ist, wird zyklisch
  // durch die ausgefuellten Namen rotiert — so funktionieren Geschichten mit
  // nur 2 oder 3 Namen genauso wie mit 5. Zusaetzlich versuchen wir, direkt
  // aufeinanderfolgende Duplikate zu vermeiden, und machen am Ende ein
  // Post-Processing, das Muster wie "A, B und A" zu "A und B" kuerzt.
  function substitute(text) {
    if (!text) return "";
    const filledNames = [1, 2, 3, 4, 5]
      .map((i) => (state.inputs["name" + i] || "").trim())
      .filter((n) => n.length > 0);

    // kuerzlich benutzte Namen, damit Zyklus-Picks nicht direkt wiederholen
    const recent = [];
    const pickName = (idx) => {
      // Eigenen Slot zuerst probieren
      const own = (state.inputs["name" + (idx + 1)] || "").trim();
      if (own) return own;
      if (filledNames.length === 0) return null;
      // Bevorzugt einen Namen, der nicht in recent ist
      const fresh = filledNames.filter((n) => !recent.includes(n));
      if (fresh.length > 0) return fresh[idx % fresh.length];
      return filledNames[idx % filledNames.length];
    };

    let replaced = text.replace(/\{(\w+)\}/g, (match, key) => {
      const nameMatch = /^name([1-5])$/.exec(key);
      if (nameMatch) {
        const idx = parseInt(nameMatch[1], 10) - 1;
        const name = pickName(idx);
        if (!name) return match;
        recent.push(name);
        if (recent.length > filledNames.length - 1) recent.shift();
        return name;
      }
      const value = state.inputs[key];
      return value ? value : match;
    });

    // Post-Processing: "A, B und A" -> "A und B"; "A und A" -> "A"; "A, A" -> "A"
    const NAME = "([A-Za-zÄÖÜäöüß]+)";
    replaced = replaced
      .replace(new RegExp(NAME + ",\\s+" + NAME + "\\s+und\\s+\\1\\b", "g"), "$1 und $2")
      .replace(new RegExp(NAME + "\\s+und\\s+\\1\\b", "g"), "$1")
      .replace(new RegExp(NAME + ",\\s+\\1\\b", "g"), "$1");

    return replaced;
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

  // Chips einmal aufbauen und per Delegation auf Klicks hoeren.
  function buildChips() {
    Object.keys(CHIP_OPTIONS).forEach((field) => {
      const container = form.querySelector(`.chips[data-field="${field}"]`);
      if (!container) return;
      container.innerHTML = "";
      CHIP_OPTIONS[field].forEach((opt) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chip";
        btn.dataset.field = field;
        btn.dataset.value = opt.v;
        btn.innerHTML = `<span class="chip-emoji">${opt.e}</span><span class="chip-text">${opt.v}</span>`;
        btn.addEventListener("click", () => selectChip(field, opt.v));
        container.appendChild(btn);
      });
    });
  }

  function selectChip(field, value) {
    state.inputs[field] = value;
    const group = form.querySelector(`.chips[data-field="${field}"]`);
    if (!group) return;
    group.classList.remove("has-error");
    group.querySelectorAll(".chip").forEach((c) => {
      c.classList.toggle("is-selected", c.dataset.value === value);
    });
  }

  // Setzt Textinputs UND Chip-Auswahl aus dem aktuellen State.
  // Versucht auch fuzzy-Match (case-insensitive), damit alte gespeicherte
  // Freitext-Eingaben auf den passenden Chip abgebildet werden.
  function fillFormFromState() {
    Object.keys(state.inputs).forEach((key) => {
      const el = form.elements.namedItem(key);
      if (el) el.value = state.inputs[key] || "";
    });
    Object.keys(CHIP_OPTIONS).forEach((field) => {
      const value = (state.inputs[field] || "").trim().toLowerCase();
      if (!value) return;
      const match = CHIP_OPTIONS[field].find((o) => o.v.toLowerCase() === value);
      if (match) {
        selectChip(field, match.v);
      } else {
        // Passt nicht mehr zum neuen Chip-Set -> leeren, User muss neu waehlen
        state.inputs[field] = "";
      }
    });
  }

  // Liest Textfelder; Chip-Werte sind bereits live in state.inputs drin.
  function collectInputs() {
    const data = new FormData(form);
    Object.keys(state.inputs).forEach((key) => {
      if (key in CHIP_OPTIONS) return; // Chip-Wert bereits gesetzt
      const raw = data.get(key);
      state.inputs[key] = (raw || "").toString().trim();
    });
  }

  // Pflichtfelder fuer "Abenteuer starten". name3-5 sind optional.
  const REQUIRED_FIELDS = [
    "name1", "name2",
    "group",
    "color", "animal", "place", "food", "item", "fear",
    "fantasyWord",
  ];

  // Mapping von deutschem Gruppen-Namen auf englisches Dateinamen-Suffix.
  const GROUP_FILE = { "Jungen": "boys", "Mädchen": "girls", "Gemischt": "mixed" };

  function inputsComplete() {
    return REQUIRED_FIELDS.every((k) => (state.inputs[k] || "").trim().length > 0);
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
  // + mehrere kleine Items drumherum. Positionen werden per Index gesetzt,
  // damit jede Szene einzigartig aussieht.
  //
  // Tokens der Form ":feldname:" (z. B. ":animal:") werden durch das Emoji
  // der aktuellen Chip-Auswahl ersetzt — so passt das Bild zur Wahl des Nutzers.
  function resolveArtEmoji(ch) {
    if (typeof ch !== "string") return "";
    const m = /^:(\w+):$/.exec(ch);
    if (!m) return ch;
    const opts = CHIP_OPTIONS[m[1]];
    if (!opts) return "";
    const match = opts.find((o) => o.v === state.inputs[m[1]]);
    return match ? match.e : "";
  }

  function renderSceneArt(artEl, art, sceneId) {
    if (!artEl || !art) return;
    artEl.style.background = art.gradient || "linear-gradient(135deg, #ffd4b8, #c9e4ff)";
    artEl.innerHTML = "";

    // Szenen-Illustration als lokale Datei (images/<sceneId>-<group>.jpg).
    // Die Bilder wurden pro Gruppen-Variante (boys|girls|mixed) einmalig ueber
    // Pollinations.ai generiert und ins Repo committet.
    // Falls eine Datei fehlt (404), entfernt sich das <img> selbst und die
    // Emoji-Collage bleibt als Fallback sichtbar.
    const groupKey = GROUP_FILE[state.inputs.group] || "mixed";
    if (sceneId) {
      const photo = document.createElement("img");
      photo.className = "art-photo";
      photo.alt = "";
      photo.loading = "eager";
      photo.onload  = () => {
        photo.classList.add("is-loaded");
        artEl.classList.add("has-photo"); // blendet die Emoji-Collage aus
      };
      photo.onerror = () => photo.remove();
      photo.src = `images/${sceneId}-${groupKey}.jpg`;
      artEl.appendChild(photo);
    }

    // Hero-Emoji, gross und mittig (kann auch ein Token sein)
    const heroChar = resolveArtEmoji(art.hero);
    if (heroChar) {
      const hero = document.createElement("div");
      hero.className = "art-hero";
      hero.textContent = heroChar;
      artEl.appendChild(hero);
    }

    // Items: Tokens aufloesen, leere Ergebnisse rausfiltern,
    // dann in Slots rund um die Szene platzieren.
    const slots = [
      { x: 10, y: 18, r: -8,  s: 1.1 },
      { x: 82, y: 22, r:  10, s: 0.95 },
      { x: 12, y: 72, r:  6,  s: 1.0 },
      { x: 84, y: 70, r: -12, s: 1.05 },
      { x: 48, y: 14, r:  0,  s: 0.9 },
      { x: 48, y: 84, r:  4,  s: 0.9 },
    ];
    const resolved = (art.items || [])
      .map(resolveArtEmoji)
      .filter((ch) => ch && ch.length > 0)
      .slice(0, slots.length);

    resolved.forEach((ch, i) => {
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
    renderSceneArt(sceneArtEl, scene.art, sceneId);

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
    renderSceneArt(endArtEl, scene.art, state.currentSceneId);
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
      // Fehlende Chip-Auswahl visuell markieren
      Object.keys(CHIP_OPTIONS).forEach((field) => {
        const group = form.querySelector(`.chips[data-field="${field}"]`);
        if (group) group.classList.toggle("has-error", !state.inputs[field]);
      });
      form.reportValidity();
      return;
    }
    saveState();
    state.currentSceneId = "start";
    state.history = [];
    renderScene("start");
  });

  document.getElementById("btn-home-story").addEventListener("click", () => {
    // Zurueck zum Hauptmenue, Eingaben bleiben erhalten — der User kann
    // jederzeit aussteigen, ohne dass die Eingaben verloren gehen.
    state.currentSceneId = "start";
    state.history = [];
    saveState();
    showScreen("start");
  });
  document.getElementById("btn-restart-story").addEventListener("click", restartSameNames);
  document.getElementById("btn-same-names").addEventListener("click", restartSameNames);
  document.getElementById("btn-full-restart").addEventListener("click", fullRestart);

  // ---------- Initialisierung ----------
  loadState();
  buildChips();
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
