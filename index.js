require("dotenv").config();
const axios = require("axios");
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// ─── ASCII Big-Letter Font (A–Z + space) ─────────────────────────────────────

const FONT = {
  A: ['  /\\  ', ' /  \\ ', '/ /\\ \\', '/_/  \\_\\'],
  B: ['|\\   ', '| >--', '|/   ', '|\\___'],
  C: [' ___ ', '/  __', '\\ \\_ ', '\\___/'],
  D: ['|\\ ', '| >', '| >', '|/ '],
  E: ['|===', '|-- ', '|   ', '|==='],
  F: ['|===', '|-- ', '|   ', '|   '],
  G: [' ___ ', '/  __ ', '| |_ |', '\\____/'],
  H: ['|  |', '|--|', '|  |', '|  |'],
  I: ['===', '_|_', '_|_', '==='],
  J: ['  |', '  |', '\\.|', '\\/ '],
  K: ['|/ ', '|< ', '|\\ ', '| \\'],
  L: ['|   ', '|   ', '|   ', '|___'],
  M: ['|\\/|', '|  |', '|  |', '|  |'],
  N: ['|\\ |', '| \\|', '|  |', '|  |'],
  O: [' __ ', '|  |', '|  |', ' \\/ '],
  P: ['|\\  ', '| > ', '|/  ', '|   '],
  Q: [' __  ', '|  | ', '| \\. |', ' \\/\\.'],
  R: ['|\\  ', '| > ', '|\\.  ', '| \\  '],
  S: [' ___ ', '/__ ', '  \\> ', '___/ '],
  T: ['=====', ' _|_ ', ' _|_ ', ' _|_ '],
  U: ['|  |', '|  |', '|  |', ' \\/ '],
  V: ['\\   /', ' \\ / ', '  V  ', '     '],
  W: ['|    |', '|    |', '| /\\ |', '|/  \\|'],
  X: ['\\ /', '_><_', '/  \\', '\\  /'],
  Y: ['\\ /', '_><', ' |  ', ' |  '],
  Z: ['====', '  _/', '_/  ', '===='],
  ' ': ['    ', '    ', '    ', '    '],
};
const FALLBACK = ['[?]', '| |', '| |', '[_]'];

function renderBigText(word, style = "block") {
  const chars = word.toUpperCase().slice(0, 10).split('');
  const rows = 4;
  const lines = Array.from({ length: rows }, () => '');

  chars.forEach(c => {
    const glyph = FONT[c] || FALLBACK;
    const w = Math.max(...glyph.map(r => r.length));
    for (let r = 0; r < rows; r++) {
      lines[r] += (glyph[r] || ' '.repeat(w)).padEnd(w) + ' ';
    }
  });

  if (style === "shadow") {
    return lines.map((l, i) => l + (i > 0 ? ' \\' : '')).join('\n');
  }
  if (style === "banner") {
    const border = '*'.repeat(lines[0].length + 4);
    return [border, ...lines.map(l => `* ${l} *`), border].join('\n');
  }
  // default: block
  const underline = chars.map(c => '_'.repeat(Math.max(...(FONT[c] || FALLBACK).map(r => r.length)))).join('_');
  return lines.join('\n') + '\n' + '  ' + underline;
}

// ─── Fun ASCII Art Library ────────────────────────────────────────────────────

const FUN_ART = {
  rocket: [
    '     /\\     ',
    '    /  \\    ',
    '   | !! |   ',
    '   |    |   ',
    '  /|    |\\  ',
    '   | /\\ |   ',
    '   |/  \\|   ',
    '  //    \\\\  ',
    ' // BOOM \\\ ',
    '    ~~~~    ',
  ].join('\n'),

  trophy: [
    ' _______  ',
    '|       | ',
    '|  \\|/  | ',
    ' \\_____/  ',
    '    | |    ',
    '  __|_|__  ',
    ' |_______| ',
  ].join('\n'),

  castle: [
    '|=| |=| |=|',
    '|_| |_| |_|',
    ' |         |',
    ' |  JARVIS |',
    ' |_________|',
    ' |#########|',
    ' |#########|',
    '  \\_______/ ',
  ].join('\n'),

  robot: [
    ' _______ ',
    '|O     O|',
    '|  ___  |',
    '|_|   |_|',
    '  |   |  ',
    ' /|   |\\ ',
    '/ |___| \\',
    '  /   \\  ',
  ].join('\n'),

  fire: [
    '   )   (   ',
    '  ) \\ / (  ',
    ' / ) X ( \\ ',
    '(_/ /_\\ \\_)',
    '  (  V  )  ',
    '   \\_____/ ',
  ].join('\n'),

  crown: [
    '*     *     *',
    '|\\   /|\\   /|',
    '| \\ / | \\ / |',
    '|  V  |  V  |',
    '|_____________|',
    '|  YOUR NAME  |',
    '|_____________|',
  ].join('\n'),

  sword: [
    '       /|',
    '      / |',
    '     /  |',
    '    /   |',
    '   / *  |',
    '  /_____|',
    '    | |  ',
    '   _|_|_ ',
    '  |_____|',
  ].join('\n'),

  shield: [
    '  _______  ',
    ' /       \\ ',
    '|  /\\ /\\  |',
    '| <  X  > |',
    '|  \\/ \\/  |',
    ' \\  ___  / ',
    '  \\_____/  ',
    '     | |   ',
    '     \\_/   ',
  ].join('\n'),
};

// ─── /jarvis-shape (3D shapes) ───────────────────────────────────────────────

function shape3DCube(n) {
  const L = [];
  L.push(' '.repeat(n) + '/' + '_'.repeat(n * 2) + '\\');
  for (let i = 1; i < n; i++) {
    const s = ' '.repeat(n - i);
    L.push(s + '/' + ' '.repeat(n * 2) + '\\' + '_'.repeat((i - 1) * 2) + '\\');
  }
  L.push('/' + '_'.repeat(n * 2) + '/' + '_'.repeat(n - 1) + '\\' + '_'.repeat(n) + '\\');
  for (let i = 0; i < n - 1; i++)
    L.push('|' + ' '.repeat(n * 2) + '|' + ' '.repeat(n - 1) + '/' + ' '.repeat(n) + '|');
  L.push('|' + '_'.repeat(n * 2) + '|' + '_'.repeat(n - 1) + '/' + '_'.repeat(n) + '|');
  return L.join('\n');
}
function shape3DPyramid(n) {
  const L = [];
  for (let i = 1; i <= n; i++) {
    const s = ' '.repeat(n - i);
    if (i === 1) L.push(s + '/\\');
    else if (i === n) L.push('/' + '_'.repeat(n * 2 - 1) + '\\');
    else L.push(s + '/' + '  '.repeat(i - 1).slice(0, -1) + '\\');
  }
  for (let i = 1; i <= Math.floor(n / 2); i++)
    L.push(' '.repeat(n * 2 - i) + '\\' + '_'.repeat(i * 2 - 1) + '/');
  return L.join('\n');
}
function shape3DCylinder(n) {
  const w = n * 2;
  const L = ['  ' + '_'.repeat(w), ' /' + ' '.repeat(w) + '\\', '|' + ' '.repeat(w + 1) + '|'];
  for (let i = 0; i < n - 1; i++) L.push('|' + ' '.repeat(w + 1) + '|');
  L.push('|' + '_'.repeat(w + 1) + '|', ' \\' + '_'.repeat(w - 1) + '/');
  return L.join('\n');
}
function shape3DDiamond(n) {
  const h = Math.max(2, Math.floor(n * 0.7));
  const L = [];
  for (let i = 1; i <= h; i++) {
    const s = ' '.repeat(h - i);
    if (i === 1) L.push(s + ' /\\');
    else if (i === h) L.push('/' + '_'.repeat((h - 1) * 2) + '\\');
    else L.push(s + '/' + '  '.repeat(i - 1).slice(0, -1) + '\\');
  }
  for (let i = h - 1; i >= 1; i--) {
    const s = ' '.repeat(h - i);
    if (i === 1) L.push(' '.repeat(h - 1) + '\\/');
    else L.push(s + '\\' + '  '.repeat(i - 1).slice(0, -1) + '/');
  }
  return L.join('\n');
}
function shape3DCone(n) {
  const L = [];
  for (let i = 1; i <= n; i++) {
    const s = ' '.repeat(n - i);
    if (i === 1) L.push(s + ' *');
    else L.push(s + '/' + '  '.repeat(i - 1).slice(0, -1) + '\\');
  }
  L.push('|' + '_'.repeat(n * 2 - 1) + '|', ' \\' + '_'.repeat(n * 2 - 3) + '/');
  return L.join('\n');
}
function shape3DPrism(n) {
  const L = [];
  for (let i = 1; i <= n; i++) {
    const s = ' '.repeat(n - i);
    if (i === n) L.push(s + '/' + '_'.repeat((i - 1) * 2) + '\\' + '_'.repeat(n) + '\\');
    else L.push(s + '/' + '  '.repeat(i - 1) + '\\' + ' '.repeat(n) + '\\');
  }
  L.push('\\' + '_'.repeat((n - 1) * 2) + '/' + '_'.repeat(n) + '/');
  return L.join('\n');
}

const SHAPES = { cube: shape3DCube, pyramid: shape3DPyramid, cylinder: shape3DCylinder, diamond: shape3DDiamond, cone: shape3DCone, prism: shape3DPrism };

app.command("/jarvis-shape", async ({ command, ack, respond }) => {
  await ack();
  const lines = command.text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return respond({ text: `Provide shape and size on separate lines:\n\`\`\`\n/jarvis-shape\ncube\n5\n\`\`\`\nShapes: \`cube\` \`pyramid\` \`prism\` \`cylinder\` \`diamond\` \`cone\`` });
  }
  const shapeName = lines[0].toLowerCase();
  const size = parseInt(lines[1]);
  const fn = SHAPES[shapeName];
  if (!fn) return respond({ text: `Unknown shape *"${lines[0]}"*. Try: \`cube\`, \`pyramid\`, \`prism\`, \`cylinder\`, \`diamond\`, \`cone\`` });
  if (isNaN(size) || size < 2 || size > 12) return respond({ text: `Size must be between *2 and 12*.` });
  await respond({ text: `*3D ${shapeName}* (size ${size}):\n\`\`\`\n${fn(size)}\n\`\`\`` });
});

// ─── /jarvis-text (3D big name) ───────────────────────────────────────────────

app.command("/jarvis-text", async ({ command, ack, respond }) => {
  await ack();
  const lines = command.text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines[0]) {
    return respond({ text: `Provide a name/word and optional style:\n\`\`\`\n/jarvis-text\nIRON MAN\nblock\n\`\`\`\nStyles: \`block\` (default) · \`shadow\` · \`banner\`` });
  }
  const word = lines[0].slice(0, 10);
  const style = ['block', 'shadow', 'banner'].includes(lines[1]?.toLowerCase()) ? lines[1].toLowerCase() : 'block';
  const art = renderBigText(word, style);
  await respond({ text: `*"${word}"* in 3D (${style}):\n\`\`\`\n${art}\n\`\`\`` });
});

// ─── /jarvis-fun ──────────────────────────────────────────────────────────────

app.command("/jarvis-fun", async ({ command, ack, respond }) => {
  await ack();
  const key = command.text.trim().toLowerCase() || 'rocket';
  const art = FUN_ART[key];
  if (!art) {
    return respond({ text: `Unknown fun command *"${key}"*.\nAvailable: \`rocket\` \`trophy\` \`castle\` \`robot\` \`fire\` \`crown\` \`sword\` \`shield\`` });
  }
  await respond({ text: `*${key.charAt(0).toUpperCase() + key.slice(1)}*:\n\`\`\`\n${art}\n\`\`\`` });
});

// ─── Existing commands ────────────────────────────────────────────────────────

app.command("/jarvis-catfact", async ({ ack, respond }) => {
  await ack();
  try {
    const res = await axios.get("https://catfact.ninja/fact");
    await respond({ text: `Cat Fact:\n${res.data.fact}` });
  } catch { await respond({ text: "Failed to fetch a cat fact." }); }
});
app.command("/jarvis-ping", async ({ ack, respond }) => {
  const start = Date.now(); await ack();
  await respond({ text: `Pong!\nLatency: ${Date.now() - start}ms` });
});
app.command("/jarvis-joke", async ({ ack, respond }) => {
  await ack();
  try {
    const res = await axios.get("https://official-joke-api.appspot.com/random_joke");
    await respond({ text: `${res.data.setup}\n\n${res.data.punchline}` });
  } catch { await respond({ text: "Failed to fetch a joke." }); }
});

app.command("/jarvis-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`*JARVIS Commands:*
\`/jarvis-ping\`    — Latency check
\`/jarvis-catfact\` — Random cat fact
\`/jarvis-joke\`    — Random joke
\`/jarvis-shape\`   — 3D ASCII shape  _(cube · pyramid · prism · cylinder · diamond · cone)_
\`/jarvis-text\`    — 3D big text / name  _(block · shadow · banner)_
\`/jarvis-fun\`     — Fun ASCII art  _(rocket · trophy · castle · robot · fire · crown · sword · shield)_`,
  });
});

(async () => {
  await app.start();
  console.log("JARVIS is running!");
})();