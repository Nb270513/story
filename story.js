// ==========================================================================
// Story-Daten: Szenen-Graph fuer das Abenteuer.
//
// Jede Szene hat:
//   - text:     Szenentext mit Platzhaltern ({name1}, {color}, ...).
//               Hinweis: Farbe immer PRAEDIKATIV verwenden ("leuchtet {color}"),
//               nicht attributiv ("ein {color} Stein"), damit die Grammatik stimmt.
//   - art:      Visuelles Szenenbild — Gradient-Hintergrund + Emojis als Collage.
//               { gradient: "linear-gradient(...)", hero: "🌲", items: ["🦊", "🌳"] }
//   - icon:     kleines Badge-Emoji in der Bild-Ecke.
//   - choices:  Liste von { label, next }. Entfaellt bei Endungen.
//   - ending:   Ende-Typ (mutig|lustig|ueberraschend|geheimnisvoll).
// ==========================================================================

window.STORY = {
  // Metadaten fuer den Ende-Screen.
  endings: {
    mutig:          { icon: "🦁", label: "Mutiges Ende" },
    lustig:         { icon: "😂", label: "Lustiges Ende" },
    ueberraschend:  { icon: "🎉", label: "Ueberraschendes Ende" },
    geheimnisvoll:  { icon: "🔮", label: "Geheimnisvolles Ende" },
  },

  // Alle Szenen. Einstieg: "start".
  scenes: {
    // ---------- START ----------
    start: {
      icon: "🌅",
      art: {
        // Hero = das Lieblingstier des Nutzers, damit klar ist, was vorbeihuscht.
        gradient: "linear-gradient(135deg, #ffb88c 0%, #ff8e72 50%, #ffd6a5 100%)",
        hero: ":animal:",
        items: ["🧺", ":food:", "🌿", "🌅", "☀️"],
      },
      text:
        "{name1}, {name2} und {name3} sitzen an ihrem Lieblingsplatz: {place}. " +
        "Sie essen gerade {food}, als plötzlich ein {animal} vorbeihuscht — " +
        "das Fell schimmert ganz in {color}! Das Tier ruft ein geheimnisvolles " +
        "Wort: \"{fantasyWord}!\" und bleibt stehen, als würde es auf die Freunde warten.",
      choices: [
        { label: "Dem {animal} in den Wald folgen",  next: "wald" },
        { label: "Lieber ins nahe Dorf gehen",         next: "dorf" },
      ],
    },

    // ---------- ZWEIG A: WALD ----------
    wald: {
      icon: "🌲",
      art: {
        gradient: "linear-gradient(160deg, #1f4d3a 0%, #2d6e52 55%, #5aa17a 100%)",
        hero: "🌲",
        items: ["🌳", "🌲", ":animal:", ":fear:", "✨"],
      },
      text:
        "Der Wald ist dunkel und voller wispernder Blätter. {name4} hat etwas " +
        "Angst vor {fear}, aber {name1} sagt mutig: \"Wir schaffen das!\" " +
        "Das {animal} teilt sich plötzlich in zwei Spuren: eine führt " +
        "zu einer Höhle, die andere zu einem rauschenden Fluss.",
      choices: [
        { label: "In die geheimnisvolle Höhle",  next: "hoehle" },
        { label: "Zum rauschenden Fluss",        next: "fluss" },
      ],
    },

    hoehle: {
      icon: "🕳️",
      art: {
        gradient: "linear-gradient(180deg, #2a1b4a 0%, #4b2e82 55%, #8a5fd6 100%)",
        hero: "💎",
        items: ["✨", ":item:", "🕯️", "⭐"],
      },
      text:
        "In der Höhle funkelt ein riesiger Kristall an der Decke — er leuchtet " +
        "komplett in {color}! {name2} hält {item} fest in der Hand — und plötzlich " +
        "fängt auch der Gegenstand an zu glühen. Der Kristall wispert: \"{fantasyWord}...\"",
      choices: [
        { label: "Den Kristall vorsichtig berühren",  next: "ending_mystery" },
        { label: "Weglaufen zum Fluss",                next: "fluss" },
      ],
    },

    fluss: {
      icon: "🌊",
      art: {
        gradient: "linear-gradient(170deg, #3aa7d4 0%, #7cc8e8 55%, #b8e6f2 100%)",
        hero: "🌊",
        items: ["🍃", "🌿", ":animal:", "💧"],
      },
      text:
        "Am Fluss sehen die Freunde ein kleines Boot aus Blättern. " +
        "{name3} lacht: \"Das ist so winzig, dass wir da nie reinpassen!\" " +
        "Aber plötzlich wächst das Boot durch Zauberkraft zur richtigen Größe.",
      choices: [
        { label: "Einfach ins Wasser springen",  next: "ending_funny" },
        { label: "Mit dem Zauberboot fahren",     next: "bruecke" },
      ],
    },

    bruecke: {
      icon: "🌉",
      art: {
        gradient: "linear-gradient(180deg, #ffad84 0%, #ff8b5c 45%, #6c4a8a 100%)",
        hero: "🌉",
        items: ["☁️", "👤", "✨", "🌅"],
      },
      text:
        "Das Boot bringt sie zu einer wackeligen Brücke. Auf der anderen Seite " +
        "steht jemand, der ruft: \"{fantasyWord}, meine Freunde!\" " +
        "Es ist... jemand, der aussieht wie {name5}, aber viel älter.",
      choices: [
        { label: "Mutig über die Brücke gehen",  next: "ending_brave" },
        { label: "Zurück rufen: \"Wer bist du?\"", next: "ending_ueberraschend" },
      ],
    },

    // ---------- ZWEIG B: DORF ----------
    dorf: {
      icon: "🏘️",
      art: {
        gradient: "linear-gradient(170deg, #f4c685 0%, #e79b5a 55%, #b06b42 100%)",
        hero: "🏘️",
        items: [":food:", "🧺", "🎪", "🌻"],
      },
      text:
        "Im Dorf ist heute Markt. Es riecht überall nach {food}. " +
        "Ein alter Händler winkt {name1} und {name2} zu und zeigt auf zwei Wege: " +
        "einen zu einem hohen Turm und einen zum bunten Basar.",
      choices: [
        { label: "Zum geheimnisvollen Turm",  next: "turm" },
        { label: "Zum bunten Basar",           next: "basar" },
      ],
    },

    turm: {
      icon: "🗼",
      art: {
        gradient: "linear-gradient(180deg, #8eb9e0 0%, #c9dcf0 50%, #f0f5fc 100%)",
        hero: "🗼",
        items: ["☁️", "☁️", "✨", "🦅"],
      },
      text:
        "Der Turm ist so hoch, dass seine Spitze in den Wolken verschwindet. " +
        "Neben der Tür klebt ein Zettel: \"Nur wer {fantasyWord} ruft, darf hinauf.\" " +
        "{name5} hat auf einmal eine geniale Idee.",
      choices: [
        { label: "Außen am Turm hochklettern",  next: "ending_brave" },
        { label: "Dreimal laut anklopfen",       next: "ending_mystery" },
      ],
    },

    basar: {
      icon: "🛒",
      art: {
        gradient: "linear-gradient(135deg, #d96eb0 0%, #f7a74a 50%, #f7d768 100%)",
        hero: "🛒",
        items: [":item:", "💰", "🎈", "🫙", "💎"],
      },
      text:
        "Der Basar ist voller Stände mit seltsamen Dingen. Ein Verkäufer " +
        "möchte {item} gegen eine Karte eintauschen, die angeblich zu einem Schatz führt. " +
        "{name3} und {name4} flüstern aufgeregt.",
      choices: [
        { label: "Karte nehmen und {item} hergeben", next: "ending_ueberraschend" },
        { label: "Lieber {food} für alle kaufen",     next: "ending_lustig" },
      ],
    },

    // ---------- ENDEN ----------
    ending_mystery: {
      icon: "🔮",
      ending: "geheimnisvoll",
      art: {
        gradient: "linear-gradient(135deg, #2a1b66 0%, #6a3dbb 50%, #b487e8 100%)",
        hero: "🔮",
        items: ["✨", ":item:", "💎", "🌟", "✨"],
      },
      text:
        "Als {name2} den Kristall berührt, löst sich die ganze Höhle in Sternenstaub auf. " +
        "Plötzlich stehen alle wieder an ihrem Lieblingsplatz {place} — aber in {name1}s Tasche " +
        "liegt ein kleines Stückchen Kristall, das {color} schimmert. " +
        "War das alles ein Traum? Niemand weiß es. Sie flüstern nur: \"{fantasyWord}.\"",
    },

    ending_funny: {
      icon: "😂",
      ending: "lustig",
      art: {
        gradient: "linear-gradient(150deg, #6ecaf0 0%, #a6e2f5 50%, #fff2b8 100%)",
        hero: ":animal:",
        items: ["💦", "🐟", "😂", "🎉", "💧"],
      },
      text:
        "{name3} springt ins Wasser — und platsch! Der Fluss ist nur knietief. " +
        "Das {animal}, dessen Fell {color} leuchtet, lacht so laut, dass alle " +
        "Vögel davonfliegen. Am Ende sitzen alle tropfnass am Ufer, essen {food} " +
        "und können nicht aufhören zu kichern. Manchmal sind die besten Abenteuer " +
        "die, bei denen man nass wird.",
    },

    ending_brave: {
      icon: "🦁",
      ending: "mutig",
      art: {
        gradient: "linear-gradient(135deg, #ff9a3c 0%, #ffd76a 50%, #fff0a8 100%)",
        hero: "🏆",
        items: [":animal:", "⭐", "✨", "🏅", ":fear:"],
      },
      text:
        "{name1} geht voraus, {name2} und {name4} folgen ohne zu zögern. " +
        "Obwohl {name4} Angst vor {fear} hat, geht er einfach trotzdem weiter — " +
        "und genau DAS ist echter Mut. Am Ziel wartet eine Überraschung: " +
        "eine goldene Urkunde mit allen Namen drauf. Mutige Abenteurer für immer!",
    },

    ending_ueberraschend: {
      icon: "🎉",
      ending: "ueberraschend",
      art: {
        gradient: "linear-gradient(135deg, #ff6aa0 0%, #ffa85c 50%, #8ae0ff 100%)",
        hero: "🎉",
        items: ["✨", "🪄", "💫", "⭐", "🎊", ":item:"],
      },
      text:
        "Die Person auf der Brücke lacht und zieht die Kapuze zurück — es ist {name5} selbst " +
        "aus der Zukunft! \"Ich bin gekommen, um euch zu sagen: Ihr werdet berühmte Entdecker!\" " +
        "Und dann — plopp — verschwindet er wieder. Die Freunde stehen sprachlos da, " +
        "doch in {name5}s Hand liegt auf einmal ein Stein, der {color} leuchtet.",
    },

    ending_lustig: {
      icon: "😂",
      ending: "lustig",
      art: {
        gradient: "linear-gradient(135deg, #ff8ec7 0%, #ffc46a 50%, #a8e88a 100%)",
        hero: "🎊",
        items: [":food:", ":animal:", "🕺", "💃", "🎈", "🎉"],
      },
      text:
        "Statt der Schatzkarte kaufen die Freunde jede Menge {food} für alle im Dorf. " +
        "Plötzlich tanzen alle Händler und selbst das {animal} wackelt im Takt mit! " +
        "Am Ende gibt es statt eines Schatzes ein riesiges Festessen — und das ist viel besser.",
    },
  },
};
