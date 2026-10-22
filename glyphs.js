// A lény jeleinek rajzai (24×24-es SVG, vonalas).
// Az azonosítók egyeznek a szerver glyphs.ts listájával.
// Ezek ideiglenes rajzok – később saját írást tervezhetsz a helyükre.

export const GLYPH_SVG = {
  EGYENLO: '<path d="M4 9 Q12 5 20 9 M4 16 Q12 12 20 16"/>',
  NEMEGYENLO: '<path d="M4 9 Q12 5 20 9 M4 16 Q12 12 20 16 M15 3 L9 21"/>',
  PLUSZ: '<path d="M12 4 V20 M5 12 Q12 8 19 12"/>',
  MINUSZ: '<path d="M5 12 Q12 8 19 12"/>',
  SZOR: '<path d="M6 5 Q10 12 18 19 M18 5 Q14 12 6 19"/>',
  KERDES: '<path d="M4 19 L12 5 L20 19"/><circle class="f" cx="12" cy="15" r="1.8"/>',
  IGEN: '<circle cx="12" cy="12" r="7"/><circle class="f" cx="12" cy="12" r="2.5"/>',
  NEM: '<circle cx="12" cy="12" r="7"/><path d="M7 17 L17 7"/>',
  CSILLAG: '<circle class="f" cx="12" cy="12" r="3"/><path d="M12 2 V6 M12 18 V22 M2 12 H6 M18 12 H22 M5 5 L7.5 7.5 M16.5 16.5 L19 19 M19 5 L16.5 7.5 M7.5 16.5 L5 19"/>',
  BOLYGO: '<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10.5" ry="3.5" transform="rotate(-20 12 12)"/>',
  FENY: '<path d="M2 12 Q5 6 8 12 T14 12 T19 12 M18 8.5 L22 12 L18 15.5"/>',
  TAVOLSAG: '<circle cx="4" cy="12" r="2.5"/><circle cx="20" cy="12" r="2.5"/><path d="M7.5 12 H16.5" stroke-dasharray="2 2"/>',
  OTTHON: '<path d="M4 19 Q12 1 20 19 Z"/><circle class="f" cx="12" cy="14" r="2"/>',
  EN: '<path d="M12 8 V21"/><circle class="f" cx="12" cy="5" r="2.5"/>',
  TE: '<path d="M12 3 V16"/><circle cx="12" cy="19.5" r="2.5"/>',
  ELET: '<path d="M12 21 Q4 15 12 12 Q20 9 12 3 M12 21 Q20 15 12 12 Q4 9 12 3"/>',
  VIZ: '<path d="M3 8 Q7.5 4 12 8 T21 8 M3 13 Q7.5 9 12 13 T21 13 M3 18 Q7.5 14 12 18 T21 18"/>',
  MI: '<path d="M6 9 V21 M12 9 V21 M18 9 V21"/><circle class="f" cx="6" cy="5" r="2"/><circle class="f" cx="12" cy="5" r="2"/><circle class="f" cx="18" cy="5" r="2"/>',
  KORUS: '<circle cx="12" cy="12" r="2.2"/><circle class="f" cx="12" cy="4" r="1.7"/><circle class="f" cx="18.9" cy="8" r="1.7"/><circle class="f" cx="18.9" cy="16" r="1.7"/><circle class="f" cx="12" cy="20" r="1.7"/><circle class="f" cx="5.1" cy="16" r="1.7"/><circle class="f" cx="5.1" cy="8" r="1.7"/>',
  EMBER: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8 V15 M12 15 L8 21 M12 15 L16 21 M7 11 H17"/>',
  IDO: '<path d="M5 4 H19 M5 20 H19 M6 4 Q12 12 18 20 M18 4 Q12 12 6 20"/>',
  HANG: '<circle class="f" cx="5" cy="12" r="2"/><path d="M9 8 Q12 12 9 16 M13 5 Q18 12 13 19 M17 2 Q24 12 17 22"/>',
  LATNI: '<path d="M2 12 Q12 3 22 12 Q12 21 2 12 Z"/><circle class="f" cx="12" cy="12" r="3"/>',
  BESZED: '<path d="M5 20 V8 Q5 4 9 4 H19"/><circle class="f" cx="11" cy="11" r="1.5"/><circle class="f" cx="15" cy="14" r="1.5"/><circle class="f" cx="19" cy="17" r="1.5"/>',
  NEV: '<rect x="3.5" y="7" width="17" height="10" rx="2.5"/><path d="M8 12 H16"/>',
  HALAL: '<path d="M18 6 A8 8 0 1 0 19.5 15"/><circle class="f" cx="20.5" cy="10" r="1.5"/>',
  EGYEDUL: '<circle cx="12" cy="12" r="9"/><circle class="f" cx="12" cy="12" r="1.5"/>',
  EGYUTT: '<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
  SZEPSEG: '<ellipse cx="12" cy="12" rx="9.5" ry="3"/><ellipse cx="12" cy="12" rx="9.5" ry="3" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3" transform="rotate(120 12 12)"/>',
  AJANDEK: '<path d="M12 3 L21 12 L12 21 L3 12 Z"/><circle class="f" cx="12" cy="12" r="2"/>',
  VESZELY: '<path d="M12 2 L14 9 L21 6 L16 12 L22 17 L14 15 L12 22 L10 15 L2 17 L8 12 L3 6 L10 9 Z"/>',
  ZAJ: '<path d="M2 12 L5 7 L8 16 L11 5 L14 18 L17 8 L20 15 L22 11"/>',
};

// Semleges kódok: a játékos beviteli mezőjében a jel ⟨kód⟩ alakban jelenik meg,
// hogy a belső név ne árulja el a jelentést. A supabase/functions/alien-chat/glyphs.ts-ben ugyanez a tábla van!
export const GLYPH_CODES = {
  EGYENLO: 47,
  NEMEGYENLO: 82,
  PLUSZ: 13,
  MINUSZ: 66,
  SZOR: 29,
  KERDES: 54,
  IGEN: 71,
  NEM: 38,
  CSILLAG: 92,
  BOLYGO: 25,
  FENY: 60,
  TAVOLSAG: 17,
  OTTHON: 43,
  EN: 86,
  TE: 31,
  ELET: 58,
  VIZ: 74,
  MI: 20,
  KORUS: 97,
  EMBER: 35,
  IDO: 69,
  HANG: 12,
  LATNI: 51,
  BESZED: 88,
  NEV: 26,
  HALAL: 63,
  EGYEDUL: 40,
  EGYUTT: 79,
  SZEPSEG: 15,
  AJANDEK: 94,
  VESZELY: 57,
};

export const CODE_TO_ID = Object.fromEntries(Object.entries(GLYPH_CODES).map(([id, c]) => [c, id]));

const SVG_NS = "http://www.w3.org/2000/svg";

function svg(viewBox, inner, cls) {
  const el = document.createElementNS(SVG_NS, "svg");
  el.setAttribute("viewBox", viewBox);
  el.setAttribute("aria-hidden", "true");
  if (cls) el.setAttribute("class", cls);
  el.innerHTML = inner; // csak saját, beégetett rajzok kerülnek ide
  return el;
}

export function glyphEl(id, note) {
  const span = document.createElement("span");
  span.className = "glyph" + (id === "ZAJ" ? " noise" : "");
  span.dataset.glyph = id;
  span.appendChild(svg("0 0 24 24", GLYPH_SVG[id] ?? GLYPH_SVG.ZAJ));
  if (note) span.title = note;
  return span;
}

// Hatos számrendszer, kockapötty-szerű számjegyekkel. 0 = üres kör.
const DOTS = {
  0: [],
  1: [[10, 10]],
  2: [[5, 5], [15, 15]],
  3: [[5, 5], [10, 10], [15, 15]],
  4: [[5, 5], [15, 5], [5, 15], [15, 15]],
  5: [[5, 5], [15, 5], [10, 10], [5, 15], [15, 15]],
};

export function numberEl(n) {
  const span = document.createElement("span");
  span.className = "num";
  const digits = Number(n).toString(6).split("").map(Number);
  for (const d of digits) {
    let inner = '<rect class="cell" x="0.75" y="0.75" width="18.5" height="18.5" rx="4"/>';
    if (d === 0) inner += '<circle cx="10" cy="10" r="4"/>';
    for (const [x, y] of DOTS[d]) inner += `<circle class="f" cx="${x}" cy="${y}" r="2.1"/>`;
    span.appendChild(svg("0 0 20 20", inner));
  }
  return span;
}

export function pulseEl(v, animate) {
  const span = document.createElement("span");
  span.className = "pulse" + (animate ? " anim" : "");
  let i = 0;
  for (const size of String(v).split(",").map(Number)) {
    const g = document.createElement("span");
    g.className = "pgroup";
    for (let k = 0; k < size; k++) {
      const dot = document.createElement("i");
      dot.style.animationDelay = `${(i++) * 0.09}s`;
      g.appendChild(dot);
    }
    span.appendChild(g);
    i += 3; // szünet a csoportok között
  }
  return span;
}
