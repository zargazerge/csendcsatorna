import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
import { GLYPH_CODES, CODE_TO_ID, glyphEl, numberEl, pulseEl } from "./glyphs.js";

const PHASE_NAMES = ["", "A jel", "Közös számok", "Hol vagy?", "Élet", "Párbeszéd"];

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = (id) => document.getElementById(id);

let recoveryMode = false;
let currentUser = null;
let gameStarted = false;
let notes = {};          // glyph -> a játékos saját jegyzete
let unlocked = [];       // a lény által már használt jelek
let busy = false;

// ---------------------------------------------------------------- nézetek

function show(view) {
  for (const v of document.querySelectorAll(".view")) v.classList.add("hidden");
  $(`view-${view}`).classList.remove("hidden");
}

function setMsg(id, text, ok = false) {
  const el = $(id);
  el.textContent = text || "";
  el.classList.toggle("ok", ok);
}

// ---------------------------------------------------------------- auth

sb.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") recoveryMode = true;
  if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") return;
  // A Supabase kliens hívásait ne a callbackben várjuk be (holtpont veszély)
  setTimeout(() => route(session), 0);
});

async function route(session) {
  if (!session) {
    currentUser = null;
    gameStarted = false;
    show("login");
    return;
  }
  if (recoveryMode) return showSetup(true);

  const { data: profile } = await sb.from("profiles")
    .select("username").eq("id", session.user.id).maybeSingle();
  if (!profile?.username) return showSetup(false);

  if (gameStarted && currentUser?.id === session.user.id) return;
  currentUser = session.user;
  startGame();
}

$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  setMsg("login-msg", "");
  const { error } = await sb.auth.signInWithPassword({
    email: $("login-email").value.trim(),
    password: $("login-password").value,
  });
  if (error) setMsg("login-msg", "Hibás email vagy jelszó.");
});

$("forgot-btn").addEventListener("click", async () => {
  const email = $("login-email").value.trim();
  if (!email) return setMsg("login-msg", "Előbb írd be az email címed.");
  await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
  setMsg("login-msg", "Ha a cím engedélyezett, küldtünk egy linket.", true);
});

function showSetup(recovery) {
  $("setup-title").textContent = recovery ? "Új jelszó megadása" : "Profil beállítása";
  $("username-row").classList.toggle("hidden", recovery);
  $("setup-username").required = !recovery;
  setMsg("setup-msg", "");
  show("setup");
}

$("setup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const pw = $("setup-password").value;
  if (pw !== $("setup-password2").value) return setMsg("setup-msg", "A két jelszó nem egyezik.");
  if (pw.length < 10) return setMsg("setup-msg", "A jelszó legalább 10 karakter legyen.");

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return setMsg("setup-msg", "A link lejárt. Kérj új meghívót vagy jelszó linket.");

  const username = $("setup-username").value.trim();
  if (!recoveryMode && !/^[A-Za-z0-9_.áéíóöőúüűÁÉÍÓÖŐÚÜŰ-]{3,20}$/.test(username)) {
    return setMsg("setup-msg", "A név 3–20 karakter: betű, szám, _ . -");
  }

  // előbb a jelszó, hogy jelszó nélküli fiók ne maradhasson
  const { error: pwErr } = await sb.auth.updateUser({ password: pw });
  if (pwErr && pwErr.code !== "same_password") return setMsg("setup-msg", "A jelszó mentése nem sikerült: " + pwErr.message);

  if (!recoveryMode) {
    const { error } = await sb.from("profiles").update({ username }).eq("id", user.id);
    if (error) {
      return setMsg("setup-msg", error.code === "23505" ? "Ez a név már foglalt." : "Mentési hiba.");
    }
  }

  recoveryMode = false;
  history.replaceState(null, "", location.pathname);
  const { data: { session } } = await sb.auth.getSession();
  route(session);
});

$("logout-btn").addEventListener("click", () => sb.auth.signOut());

// ---------------------------------------------------------------- játék

async function startGame() {
  gameStarted = true;
  show("game");
  $("log").replaceChildren();

  const [stateRes, msgRes, notesRes] = await Promise.all([
    sb.from("game_state").select("phase, lexicon, glyphs_unlocked").eq("user_id", currentUser.id).maybeSingle(),
    sb.from("messages").select("id, role, content, created_at")
      .eq("user_id", currentUser.id).order("id", { ascending: false }).limit(200),
    sb.from("glyph_notes").select("glyph, note").eq("user_id", currentUser.id),
  ]);

  notes = Object.fromEntries((notesRes.data ?? []).map((n) => [n.glyph, n.note]));
  applyState(stateRes.data ?? { phase: 1, lexicon: [], glyphs_unlocked: [] });

  const msgs = (msgRes.data ?? []).reverse();
  for (const m of msgs) appendMessage(m, false);
  scrollDown();

  if (msgs.length === 0) {
    const res = await callAlien({ action: "start" });
    if (res?.alien) appendMessage(res.alien, true);
    if (res?.state) applyState(res.state);
    scrollDown();
  }
}

function applyState(state) {
  $("phase-label").textContent = `${state.phase}. fázis · ${PHASE_NAMES[state.phase] ?? ""}`;
  unlocked = state.glyphs_unlocked ?? [];
  renderLexicon(state.lexicon ?? []);
  renderGlyphKeys();
  renderNotebook();
}

async function callAlien(body) {
  const { data, error } = await sb.functions.invoke("alien-chat", { body });
  if (error) {
    let text = "Kapcsolati hiba.";
    try { text = (await error.context.json()).error ?? text; } catch { /* ignore */ }
    setMsg("game-msg", text);
    return null;
  }
  setMsg("game-msg", "");
  return data;
}

$("say-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = $("say-input");
  const text = input.value.trim();
  if (!text || busy) return;

  busy = true;
  $("say-btn").disabled = true;
  input.value = "";
  updatePreview();
  const tempEl = appendMessage({ role: "player", content: { text } }, false);
  $("typing").classList.remove("hidden");
  scrollDown();

  const res = await callAlien({ action: "say", text });

  $("typing").classList.add("hidden");
  busy = false;
  $("say-btn").disabled = false;

  if (!res) {
    tempEl.remove();
    input.value = text; // ne vesszen el, újra lehessen küldeni
    updatePreview();
    return;
  }
  appendMessage(res.alien, true);
  if (res.phase_changed) appendSystemLine(`— ${res.state.phase}. fázis: ${PHASE_NAMES[res.state.phase]} —`);
  applyState(res.state);
  scrollDown();
  input.focus();
});

// ---------------------------------------------------------------- megjelenítés

function renderSegments(container, segments, animate) {
  for (const s of segments ?? []) {
    if (s.t === "glyph") container.appendChild(glyphEl(s.v, notes[s.v]));
    else if (s.t === "num") container.appendChild(numberEl(s.v));
    else if (s.t === "pulse") container.appendChild(pulseEl(s.v, animate));
    else if (s.t === "pause") container.appendChild(Object.assign(document.createElement("span"), { className: "pause" }));
    else if (s.t === "word") {
      const w = document.createElement("span");
      w.className = "word";
      w.textContent = s.v;
      container.appendChild(w);
    }
  }
}

function renderPlayerText(container, text) {
  const re = /⟨(\d{1,3})⟩/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) container.appendChild(document.createTextNode(text.slice(last, m.index)));
    const id = CODE_TO_ID[m[1]];
    if (id) container.appendChild(glyphEl(id, notes[id]));
    else container.appendChild(document.createTextNode(m[0]));
    last = re.lastIndex;
  }
  if (last < text.length) container.appendChild(document.createTextNode(text.slice(last)));
}

function appendMessage(m, animate) {
  const row = document.createElement("div");
  row.className = `msg-row ${m.role}`;
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (m.role === "alien") {
    renderSegments(bubble, m.content?.segments, animate);
    if (m.content?.ooc) {
      const o = document.createElement("div");
      o.className = "ooc";
      o.textContent = m.content.ooc;
      bubble.appendChild(o);
    }
  } else {
    renderPlayerText(bubble, String(m.content?.text ?? ""));
  }
  row.appendChild(bubble);
  $("log").appendChild(row);
  return row;
}

function appendSystemLine(text) {
  const d = document.createElement("div");
  d.className = "sysline";
  d.textContent = text;
  $("log").appendChild(d);
}

function scrollDown() {
  const w = $("log-wrap");
  requestAnimationFrame(() => { w.scrollTop = w.scrollHeight; });
}

function renderLexicon(lexicon) {
  const box = $("lexicon");
  box.replaceChildren();
  if (!lexicon.length) {
    box.appendChild(Object.assign(document.createElement("p"), { className: "faint small", textContent: "Még üres." }));
    return;
  }
  for (const l of lexicon) {
    const row = document.createElement("div");
    row.className = "lex-row";
    const w = Object.assign(document.createElement("strong"), { textContent: l.word });
    const mn = Object.assign(document.createElement("span"), { className: "faint", textContent: l.meaning });
    row.append(w, mn);
    box.appendChild(row);
  }
}

function renderGlyphKeys() {
  const box = $("glyph-keys");
  box.replaceChildren();
  for (const id of unlocked) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "gkey";
    b.title = notes[id] || "";
    b.appendChild(glyphEl(id));
    b.addEventListener("click", () => insertToken(`⟨${GLYPH_CODES[id]}⟩`));
    box.appendChild(b);
  }
  box.classList.toggle("hidden", unlocked.length === 0);
}

function renderNotebook() {
  const box = $("notebook");
  box.replaceChildren();
  if (!unlocked.length) {
    box.appendChild(Object.assign(document.createElement("p"), { className: "faint small", textContent: "Még nem kaptál fogalomjelet." }));
    return;
  }
  for (const id of unlocked) {
    const row = document.createElement("label");
    row.className = "note-row";
    const inp = document.createElement("input");
    inp.maxLength = 60;
    inp.placeholder = "szerintem…";
    inp.value = notes[id] ?? "";
    inp.addEventListener("change", () => saveNote(id, inp.value.trim()));
    row.append(glyphEl(id), inp);
    box.appendChild(row);
  }
}

async function saveNote(glyph, note) {
  if (note) {
    await sb.from("glyph_notes").upsert({ user_id: currentUser.id, glyph, note });
    notes[glyph] = note;
  } else {
    await sb.from("glyph_notes").delete().eq("user_id", currentUser.id).eq("glyph", glyph);
    delete notes[glyph];
  }
  for (const el of document.querySelectorAll(`.glyph[data-glyph="${glyph}"]`)) el.title = note;
  renderGlyphKeys();
}

// ---------------------------------------------------------------- bevitel

function insertToken(token) {
  const inp = $("say-input");
  const s = inp.selectionStart ?? inp.value.length;
  const e = inp.selectionEnd ?? inp.value.length;
  inp.value = inp.value.slice(0, s) + token + inp.value.slice(e);
  const pos = s + token.length;
  inp.setSelectionRange(pos, pos);
  inp.focus();
  updatePreview();
}

function updatePreview() {
  const text = $("say-input").value;
  const box = $("preview");
  box.replaceChildren();
  const hasGlyph = /⟨\d{1,3}⟩/.test(text);
  box.classList.toggle("hidden", !hasGlyph);
  if (hasGlyph) renderPlayerText(box, text);
}

$("say-input").addEventListener("input", updatePreview);

$("panel-toggle").addEventListener("click", () => $("panel").classList.toggle("open"));
