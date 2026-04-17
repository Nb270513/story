// ==========================================================================
// Story-Daten: Szenen-Graph für das Abenteuer.
//
// Jede Szene hat:
//   - text:    Szenentext mit Platzhaltern ({name1}, {color}, {animal}, ...)
//   - icon:    kleines Emoji als Szenen-Illustration
//   - choices: Liste von { label, next }. Optional, wenn es ein Ende ist.
//   - ending:  Wenn gesetzt, ist die Szene ein Ende (mutig|lustig|ueberraschend|geheimnisvoll)
//
// Eine neue Szene hinzufuegen: einfach einen neuen Eintrag in STORY.scenes
// anlegen und von einem choices.next darauf verweisen.
// ==========================================================================

window.STORY = {
  // Welche Ende-Typen es gibt + Metadaten fuer den Ende-Screen.
  endings: {
    mutig:          { icon: "🦁", label: "Mutiges Ende" },
    lustig:         { icon: "😂", label: "Lustiges Ende" },
    ueberraschend:  { icon: "🎉", label: "Ueberraschendes Ende" },
    geheimnisvoll:  { icon: "🔮", label: "Geheimnisvolles Ende" },
  },

  // Alle Szenen. Der Einstieg ist "start".
  scenes: {
    // ---------- START ----------
    start: {
      icon: "🌅",
      text:
        "{name1}, {name2} und {name3} sitzen an ihrem Lieblingsplatz: {place}. " +
        "Sie essen gerade {food}, als plötzlich ein {color} {animal} vorbeihuscht " +
        "und dabei ein geheimnisvolles Wort ruft: \"{fantasyWord}!\" " +
        "Das {animal} bleibt stehen und schaut die Freunde an.",
      choices: [
        { label: "Dem {animal} in den Wald folgen",  next: "wald" },
        { label: "Lieber ins nahe Dorf gehen",         next: "dorf" },
      ],
    },

    // ---------- ZWEIG A: WALD ----------
    wald: {
      icon: "🌲",
      text:
        "Der Wald ist dunkel und voller wispernder Blätter. {name4} hat etwas " +
        "Angst vor {fear}, aber {name1} sagt mutig: \"Wir schaffen das!\" " +
        "Das {color} {animal} teilt sich plötzlich in zwei Spuren: eine führt " +
        "zu einer Höhle, die andere zu einem rauschenden Fluss.",
      choices: [
        { label: "In die geheimnisvolle Höhle",  next: "hoehle" },
        { label: "Zum rauschenden Fluss",        next: "fluss" },
      ],
    },

    hoehle: {
      icon: "🕳️",
      text:
        "In der Höhle funkelt ein {color} Kristall an der Decke. " +
        "{name2} hält {item} fest in der Hand — es fängt auf einmal an zu leuchten! " +
        "Der Kristall wispert: \"{fantasyWord}...\"",
      choices: [
        { label: "Den Kristall vorsichtig berühren",  next: "ending_mystery" },
        { label: "Weglaufen zum Fluss",                next: "fluss" },
      ],
    },

    fluss: {
      icon: "🌊",
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
      text:
        "Der Basar ist voller Stände mit seltsamen Dingen. Ein Verkäufer " +
        "möchte {item} gegen eine Karte eintauschen, die angeblich zu einem Schatz führt. " +
        "{name3} und {name4} flüstern aufgeregt.",
      choices: [
        { label: "{item} tauschen und die Karte nehmen", next: "ending_ueberraschend" },
        { label: "Lieber {food} für alle kaufen",          next: "ending_lustig" },
      ],
    },

    // ---------- ENDEN ----------
    ending_mystery: {
      icon: "🔮",
      ending: "geheimnisvoll",
      text:
        "Als {name2} den Kristall berührt, löst sich die ganze Höhle in Sternenstaub auf. " +
        "Plötzlich stehen alle wieder an ihrem Lieblingsplatz {place} — aber in {name1}s Tasche " +
        "liegt ein kleines {color} Stückchen Kristall. " +
        "War das alles ein Traum? Niemand weiß es. Sie flüstern nur: \"{fantasyWord}.\"",
    },

    ending_funny: {
      icon: "😂",
      ending: "lustig",
      text:
        "{name3} springt ins Wasser — und platsch! Der Fluss ist nur knietief. " +
        "Das {color} {animal} lacht so laut, dass alle Vögel davonfliegen. " +
        "Am Ende sitzen alle tropfnass am Ufer, essen {food} und können nicht aufhören zu kichern. " +
        "Manchmal sind die besten Abenteuer die, bei denen man nass wird.",
    },

    ending_brave: {
      icon: "🦁",
      ending: "mutig",
      text:
        "{name1} geht voraus, {name2} und {name4} folgen ohne zu zögern. " +
        "Obwohl {name4} Angst vor {fear} hat, geht er/sie trotzdem weiter — das ist echter Mut. " +
        "Oben / drüben wartet eine Überraschung: eine goldene Urkunde mit ihren Namen drauf. " +
        "Mutige Abenteurer für immer!",
    },

    ending_ueberraschend: {
      icon: "🎉",
      ending: "ueberraschend",
      text:
        "Die Person auf der Brücke lacht und zieht die Kapuze zurück — es ist {name5} selbst " +
        "aus der Zukunft! \"Ich bin gekommen, um euch zu sagen: Ihr werdet berühmte Entdecker!\" " +
        "Und dann — plopp — verschwindet er/sie wieder. " +
        "Die Freunde stehen sprachlos da, aber in {name5}s Hand liegt auf einmal ein {color} Stein.",
    },

    ending_lustig: {
      icon: "😂",
      ending: "lustig",
      text:
        "Statt der Schatzkarte kaufen die Freunde jede Menge {food} für alle im Dorf. " +
        "Plötzlich tanzen alle Händler und selbst der {animal} wackelt im Takt mit! " +
        "Am Ende gibt es statt eines Schatzes ein riesiges Festessen — und das ist viel besser.",
    },
  },
};
