// Leonida Trophy Guide: checklist, roadmap, filters, spoiler mode, export/import.
// All data lives in data/trophies.json and data/roadmap.json, fetched from this
// app's own files. Progress is kept in localStorage and never leaves the browser.

const STORAGE_KEY = 'gta6-trophy-guide-v1';
const cardsList = document.getElementById('cards');
const emptyNote = document.getElementById('empty');
const emptyOnline = document.getElementById('empty-online');
const statusline = document.getElementById('statusline');
const searchBox = document.getElementById('search');
const kindSelect = document.getElementById('kind');
const gradeSelect = document.getElementById('grade');
const spoilerBox = document.getElementById('spoiler');
const hideEarnedBox = document.getElementById('hide-earned');

const data = await (await fetch('data/trophies.json')).json();
const roadmap = await (await fetch('data/roadmap.json')).json();
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(loadEarned());

function loadEarned() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter((id) => byId.has(id));
  } catch {
    return [];
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function gradeLabel(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  return { story: 'Story', collectibles: 'Collectibles', activities: 'Activities' }[kind] ?? kind;
}

function renderRoadmap() {
  document.getElementById('roadmap-intro').textContent = roadmap.intro;
  const stages = document.getElementById('roadmap-stages');
  stages.replaceChildren();
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    const h3 = document.createElement('h3');
    h3.textContent = `Stage ${stage.stage} — ${stage.title}`;
    const p = document.createElement('p');
    p.textContent = stage.text;
    const chips = document.createElement('p');
    chips.className = 'chips';
    for (const id of stage.trophies) {
      const t = byId.get(id);
      if (!t) continue;
      const chip = document.createElement('span');
      chip.className = 'chip' + (earned.has(id) ? ' chip-earned' : '');
      chip.textContent = (earned.has(id) ? '✓ ' : '') + t.name + (t.missable ? ' ⚠ missable' : '');
      chips.append(chip);
    }
    li.append(h3, p, chips);
    stages.append(li);
  }
}

function trophyMatches(t) {
  const query = searchBox.value.trim().toLowerCase();
  if (query) {
    const haystack = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  const kind = kindSelect.value;
  if (kind === 'missable' && !t.missable) return false;
  if (kind === 'online') return false; // No trophy in the official list mentions online play.
  if (kind !== 'all' && kind !== 'missable' && t.kind !== kind) return false;
  if (gradeSelect.value !== 'all' && t.grade !== gradeSelect.value) return false;
  if (hideEarnedBox.checked && earned.has(t.id)) return false;
  return true;
}

function renderCards() {
  cardsList.replaceChildren();
  const spoilersOn = spoilerBox.checked;
  let shown = 0;
  for (const t of trophies) {
    if (!trophyMatches(t)) continue;
    shown += 1;
    const isEarned = earned.has(t.id);
    const hidden = spoilersOn && t.kind === 'story' && !isEarned;

    const li = document.createElement('li');
    li.className = 'card' + (isEarned ? ' card-earned' : '');
    li.dataset.id = String(t.id);

    const label = document.createElement('label');
    label.className = 'earn';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isEarned;
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      saveEarned();
      renderAll();
    });
    const mark = document.createElement('span');
    mark.className = 'earn-mark';
    mark.textContent = isEarned ? '✓ Earned' : 'Earn it';
    label.append(box, mark);

    const body = document.createElement('div');
    body.className = 'card-body';

    const heading = document.createElement('h3');
    heading.textContent = hidden ? 'Hidden story trophy' : t.name;
    const gradeBadge = document.createElement('span');
    gradeBadge.className = `grade grade-${t.grade}`;
    gradeBadge.textContent = gradeLabel(t.grade);
    heading.append(gradeBadge);
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = kindLabel(t.kind);
    heading.append(kindTag);
    if (t.missable) {
      const flag = document.createElement('span');
      flag.className = 'missable';
      flag.textContent = '⚠ Missable — do before the finale';
      heading.append(flag);
    }

    const desc = document.createElement('p');
    desc.className = 'desc';
    desc.textContent = hidden
      ? 'Spoilers hidden: earn this trophy to reveal its name and description.'
      : t.description;

    body.append(heading, desc);
    if (typeof t.count === 'number') {
      const count = document.createElement('p');
      count.className = 'count';
      count.textContent = `PlayStation tracks a count: ${t.count.toLocaleString('en-US')}`;
      body.append(count);
    }
    if (!hidden) {
      const guide = document.createElement('p');
      guide.className = 'guide';
      guide.textContent = t.guide;
      body.append(guide);
      const sources = document.createElement('p');
      sources.className = 'sources';
      sources.textContent = 'Sources: ';
      t.sources.forEach((s, i) => {
        if (i > 0) sources.append(document.createTextNode(' · '));
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        a.rel = 'noopener';
        sources.append(a);
      });
      body.append(sources);
    }

    li.append(label, body);
    cardsList.append(li);
  }
  emptyNote.hidden = shown !== 0;
  emptyOnline.hidden = kindSelect.value !== 'online';
  statusline.textContent = `Showing ${shown} of ${trophies.length} trophies · ${earned.size} earned`;
}

function renderProgress() {
  const total = trophies.length;
  const pct = Math.round((earned.size / total) * 100);
  document.getElementById('progress-text').textContent = `${earned.size} of ${total} earned`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  document.getElementById('progress-note').textContent =
    earned.size === total ? 'Platinum earned — Leonida Legend!' : `${pct}% to the platinum`;
}

function renderAll() {
  renderRoadmap();
  renderCards();
  renderProgress();
}

function download(filename, text) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

document.getElementById('export').addEventListener('click', () => {
  download('gta6-trophy-progress.json', JSON.stringify({
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  }, null, 2));
});

document.getElementById('import').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    const valid = ids.filter((id) => byId.has(id));
    if (valid.length === 0 && ids.length > 0) throw new Error('no known trophy ids');
    earned = new Set(valid);
    saveEarned();
    renderAll();
    statusline.textContent = `Imported ${valid.length} earned trophies.`;
  } catch {
    statusline.textContent = 'That file is not a progress export from this guide — nothing was changed.';
  }
  event.target.value = '';
});

document.getElementById('reset').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies? This cannot be undone.')) return;
  earned = new Set();
  saveEarned();
  renderAll();
});

for (const control of [searchBox, kindSelect, gradeSelect, spoilerBox, hideEarnedBox]) {
  control.addEventListener('input', renderCards);
  control.addEventListener('change', renderCards);
}

renderAll();
