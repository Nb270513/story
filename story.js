// ==========================================================================
// Story-Daten: Szenen-Graph fuer das Abenteuer.
//
// Jede Szene hat:
//   - text:         Szenentext mit Platzhaltern ({name1}, {color}, ...).
//                   Hinweis: Farbe immer PRAEDIKATIV verwenden ("leuchtet {color}"),
//                   nicht attributiv ("ein {color} Stein"), damit es grammatikalisch
//                   stimmt, wenn der Nutzer z. B. "gruen" eintippt.
//   - icon:         kleines Emoji als Szenen-Illustration.
//   - imagePrompt:  englischer Prompt fuer die KI-Bildgenerierung (pollinations.ai).
//                   Platzhalter werden genauso ersetzt wie im Text.
//   - choices:      Liste von { label, next }. Entfaellt bei Endungen.
//   - ending:       Ende-Typ (mutig|lustig|ueberraschend|geheimnisvoll).
// ==========================================================================

window.STORY = {
  // Metadaten fuer den Ende-Screen.
  endings: {
    mutig:          { icon: "🦁", label: "Mutiges Ende" },
    lustig:         { icon: "😂", label: "Lustiges Ende" },
    ueberraschend:  { icon: "🎉", label: "Ueberraschendes Ende" },
    geheimnisvoll:  { icon: "🔮", label: "Geheimnisvolles Ende" },
  },

  // Basis-Prompt, der vor jeden szenen-spezifischen Prompt gesetzt wird.
  // Sorgt dafuer, dass alle Bilder einen einheitlichen, kindgerechten Stil haben.
  imageStyle: "cute children's storybook illustration, soft pastel colors, warm lighting, whimsical, magical, friendly atmosphere, digital painting, ",

  // Alle Szenen. Einstieg: "start".
  scenes: {
    // ---------- START ----------
    start: {
      icon: "🌅",
      imagePrompt: "a group of happy children sitting at {place}, eating {food}, a small {animal} in {color} color runs by, sunny magical afternoon",
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
      imagePrompt: "dark enchanted forest with glowing path, whispering leaves, a small {animal} leading children, two paths splitting, cave on one side, river on the other",
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
      imagePrompt: "inside a magical glowing crystal cave, a large crystal shining in {color}, whispering, children exploring with wide eyes",
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
      imagePrompt: "rushing magical river in a forest, a small leaf-boat on the water that is glowing and growing magically, children watching in wonder",
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
      imagePrompt: "rickety wooden rope bridge over a magical glowing river at sunset, a mysterious hooded figure waiting on the other side, children on a leaf boat arriving",
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
      imagePrompt: "colorful medieval fantasy village market, smells of {food}, an old friendly merchant pointing at two paths, a tall tower in distance and a bazaar",
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
      imagePrompt: "tall mysterious fantasy tower reaching into the clouds, small wooden door with a scroll attached, children looking up in wonder",
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
      imagePrompt: "colorful fantasy bazaar full of strange magical items, a friendly merchant holding a treasure map, children whispering excitedly",
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
      imagePrompt: "magical swirling stardust cave dissolving around children, a tiny crystal shard that shimmers in {color} color, dreamlike ending, mysterious",
      text:
        "Als {name2} den Kristall berührt, löst sich die ganze Höhle in Sternenstaub auf. " +
        "Plötzlich stehen alle wieder an ihrem Lieblingsplatz {place} — aber in {name1}s Tasche " +
        "liegt ein kleines Stückchen Kristall, das {color} schimmert. " +
        "War das alles ein Traum? Niemand weiß es. Sie flüstern nur: \"{fantasyWord}.\"",
    },

    ending_funny: {
      icon: "😂",
      ending: "lustig",
      imagePrompt: "children laughing and splashing in a shallow river, all soaked, a small {animal} laughing too, birds flying up, sunny funny moment",
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
      imagePrompt: "brave children walking proudly together, holding a glowing golden certificate with their names, triumphant sunset, heroic",
      text:
        "{name1} geht voraus, {name2} und {name4} folgen ohne zu zögern. " +
        "Obwohl {name4} Angst vor {fear} hat, geht er einfach trotzdem weiter — " +
        "und genau DAS ist echter Mut. Am Ziel wartet eine Überraschung: " +
        "eine goldene Urkunde mit allen Namen drauf. Mutige Abenteurer für immer!",
    },

    ending_ueberraschend: {
      icon: "🎉",
      ending: "ueberraschend",
      imagePrompt: "a child pulling back a cloak to reveal themselves as a grown-up future version of themselves, glowing stone in their hand, time-travel magical moment",
      text:
        "Die Person auf der Brücke lacht und zieht die Kapuze zurück — es ist {name5} selbst " +
        "aus der Zukunft! \"Ich bin gekommen, um euch zu sagen: Ihr werdet berühmte Entdecker!\" " +
        "Und dann — plopp — verschwindet er wieder. Die Freunde stehen sprachlos da, " +
        "doch in {name5}s Hand liegt auf einmal ein Stein, der {color} leuchtet.",
    },

    ending_lustig: {
      icon: "😂",
      ending: "lustig",
      imagePrompt: "huge festive village feast with everyone dancing, tables full of {food}, a {animal} dancing too, joyful celebration",
      text:
        "Statt der Schatzkarte kaufen die Freunde jede Menge {food} für alle im Dorf. " +
        "Plötzlich tanzen alle Händler und selbst das {animal} wackelt im Takt mit! " +
        "Am Ende gibt es statt eines Schatzes ein riesiges Festessen — und das ist viel besser.",
    },
  },
};
