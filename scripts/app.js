import { connectionGeometry, eyeOffset } from './geometry.js';
import { projectCatalog, translations } from './content.js';

const experience = document.querySelector('#experience');
const scene = document.querySelector('#constellation');
const coreAnchor = document.querySelector('.project-core .logo-anchor');
const eyes = document.querySelector('#bee-eyes');
const dialog = document.querySelector('#detail-dialog');
const content = document.querySelector('#detail-content');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const projects = [...document.querySelectorAll('.project-satellite')];
const lines = [...document.querySelectorAll('.connection')];
const labels = [...document.querySelectorAll('.connection-label')];
const githubIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#github-icon"/></svg>';
const featureIcon = '<svg class="feature-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m5 12 4 4L19 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const languageButton = document.querySelector('#language-toggle');
const backdrop = document.querySelector('#dialog-backdrop');
const hero = document.querySelector('#hero');
function initialLanguage() {
  try {
    const saved = localStorage.getItem('gojue.language');
    if (saved === 'zh' || saved === 'en') return saved;
  } catch { /* Fall back to the browser when storage is unavailable. */ }
  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const locale of preferences) {
    const base = String(locale ?? '').split(/[-_]/)[0].toLowerCase();
    if (base === 'zh' || base === 'en') return base;
  }
  return 'en';
}
let language = initialLanguage();
const copy = () => translations[language];

let activeProject = null;
let lastTrigger = null;
let eyeFrame = 0;
let layoutFrame = 0;
let gaze = { x: 0, y: 0 };
let gazeTarget = { x: 0, y: 0 };
let sceneBounds;
let coreBounds;

function setActive(id) {
  if (activeProject === id) return;
  activeProject = id;
  scene.dataset.active = id ?? '';
  projects.forEach((node) => node.classList.toggle('is-active', node.dataset.project === id));
  lines.forEach((node) => node.classList.toggle('is-active', node.dataset.connection === id));
  labels.forEach((node) => node.classList.toggle('is-active', node.dataset.label === id));
}

function animateEyes() {
  eyeFrame = 0;
  const speed = reducedMotion.matches ? 1 : .16;
  gaze.x += (gazeTarget.x - gaze.x) * speed;
  gaze.y += (gazeTarget.y - gaze.y) * speed;
  eyes.setAttribute('transform', `translate(${gaze.x.toFixed(2)} ${gaze.y.toFixed(2)})`);
  if (Math.abs(gazeTarget.x - gaze.x) + Math.abs(gazeTarget.y - gaze.y) > .06) {
    eyeFrame = requestAnimationFrame(animateEyes);
  }
}

function lookAt(point) {
  if (!coreBounds) return;
  // Match the eyes' original location inside the SVG, not the glasses' location.
  const origin = {
    x: coreBounds.left + coreBounds.width * 627 / 1254,
    y: coreBounds.top + coreBounds.height * 377 / 1254,
  };
  gazeTarget = point && !reducedMotion.matches ? eyeOffset(point, origin) : { x: 0, y: 0 };
  if (!eyeFrame) eyeFrame = requestAnimationFrame(animateEyes);
}

function relativeRect(rect, bounds) {
  return { x: rect.left - bounds.left, y: rect.top - bounds.top, width: rect.width, height: rect.height };
}

function updateLayout() {
  layoutFrame = 0;
  sceneBounds = scene.getBoundingClientRect();
  coreBounds = coreAnchor.getBoundingClientRect();
  const core = relativeRect(coreBounds, sceneBounds);
  const gap = sceneBounds.width < 600 ? 12 : sceneBounds.width < 900 ? 16 : 26;
  for (const project of projects) {
    const id = project.dataset.project;
    // Anchor is stationary; only the child logo floats, and gap includes its travel.
    const rect = relativeRect(project.querySelector('.logo-anchor').getBoundingClientRect(), sceneBounds);
    const geometry = connectionGeometry(core, rect, gap);
    scene.querySelectorAll(`[data-connection="${id}"] path`).forEach((path) => path.setAttribute('d', geometry.d));
    const label = scene.querySelector(`[data-label="${id}"]`);
    const labelOffset = sceneBounds.width < 480 ? Math.sign(core.x + core.width / 2 - geometry.label.x) * 28 : 0;
    label.style.left = `${geometry.label.x + labelOffset}px`;
    label.style.top = `${geometry.label.y - 5}px`;
  }
}

function scheduleLayout() {
  if (!layoutFrame) layoutFrame = requestAnimationFrame(updateLayout);
}

function handlePointer(event) {
  if (dialog.open) return;
  lookAt({ x: event.clientX, y: event.clientY });
  // Only the stationary, logo-sized anchor activates a satellite. Captions and
  // the surrounding empty quadrant never enlarge the hover target.
  const anchor = event.target.closest('.logo-anchor');
  const satellite = anchor?.closest('.project-satellite');
  setActive(satellite?.dataset.project ?? null);
}

experience.addEventListener('pointermove', handlePointer, { passive: true });
experience.addEventListener('pointerdown', (event) => {
  if (event.pointerType === 'touch' || event.pointerType === 'pen') handlePointer(event);
}, { passive: true });
experience.addEventListener('pointerleave', (event) => {
  if (event.pointerType === 'touch' || dialog.open) return;
  setActive(null);
  lookAt(null);
});
window.addEventListener('blur', () => { if (!dialog.open) setActive(null); lookAt(null); });
window.addEventListener('scroll', scheduleLayout, { passive: true });
reducedMotion.addEventListener('change', () => lookAt(null));

function relationshipMarkup(relation) {
  return `<section class="relationship" aria-label="${copy().relationshipLabel}"><h3>${copy().relationship}</h3><div class="relationship-map">${relation.map(([name, role], i) => `${i ? '<span class="relationship-arrow" aria-hidden="true">→</span>' : ''}<div class="relationship-node"><strong>${name}</strong><small>${role}</small></div>`).join('')}</div></section>`;
}

function renderProject(id) {
  const info = { ...projectCatalog[id], ...copy().projects[id] };
  content.innerHTML = `
    <div class="detail-heading">
      ${info.logo ? `<img class="detail-logo ${info.logoClass || ''}" src="${info.logo}" alt="" width="78" height="78">` : ''}
      <div><span class="detail-category">${info.category}</span><h2 class="detail-title ${info.name.length > 12 ? 'long-title' : ''}" id="detail-title">${info.name}</h2></div>
    </div>
    <p class="detail-tagline">${info.tagline}</p>
    <p class="detail-description" id="detail-description">${info.description}</p>
    ${relationshipMarkup(info.relation)}
    <ul class="detail-features">${info.features.map((feature) => `<li>${featureIcon}<span>${feature}</span></li>`).join('')}</ul>
    <div class="detail-tags">${info.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
    <div class="detail-actions"><a href="https://github.com/gojue/${info.repo}" target="_blank" rel="noopener noreferrer">${githubIcon}${copy().githubAction}</a><a href="${info.docs}" target="_blank" rel="noopener noreferrer">${copy().docsAction}</a></div>
    <p class="detail-note">${info.note}</p>`;
}

function renderAbout() {
  const about = copy().about;
  content.innerHTML = `
    <h2 class="about-wordmark" id="detail-title">gojue<span style="color:#eeb522">.</span></h2>
    <p class="detail-tagline">${about.tagline}</p>
    <p class="detail-description" id="detail-description">${about.description}</p>
    ${about.sections.map(([title, text]) => `<section class="about-section"><h3>${title}</h3><p>${text}</p></section>`).join('')}
    <div class="detail-actions"><a href="https://github.com/gojue" target="_blank" rel="noopener noreferrer">${githubIcon}${copy().visitOrg}</a></div>`;
}

function setLanguage(nextLanguage, persist = false) {
  language = nextLanguage === 'en' ? 'en' : 'zh';
  const ui = copy();
  document.documentElement.lang = ui.lang;
  document.title = ui.pageTitle;
  document.querySelector('meta[name="description"]').content = ui.description;
  document.querySelector('meta[property="og:title"]').content = ui.pageTitle;
  document.querySelector('meta[property="og:description"]').content = ui.description;
  const headingEnd = document.createElement('span');
  headingEnd.textContent = ui.headline[1];
  hero.querySelector('h1').replaceChildren(document.createTextNode(ui.headline[0] + (language === 'en' ? ' ' : '')), headingEnd);
  hero.querySelector('p').textContent = ui.subtitle;
  document.querySelector('.header-actions').setAttribute('aria-label', ui.navLabel);
  document.querySelector('#about-button').setAttribute('aria-label', ui.aboutLabel);
  document.querySelector('#about-button').title = ui.aboutLabel;
  document.querySelector('.github-link').setAttribute('aria-label', ui.githubLabel);
  languageButton.setAttribute('aria-label', ui.switchLanguage);
  languageButton.title = ui.switchLanguage;
  languageButton.dataset.language = language;
  scene.setAttribute('aria-label', ui.sceneLabel);
  document.querySelector('#scene-instructions').textContent = ui.instructions;
  document.querySelector('#close-detail').setAttribute('aria-label', ui.close);
  for (const button of document.querySelectorAll('[data-open]')) {
    const id = button.dataset.open;
    const info = ui.projects[id];
    button.setAttribute('aria-label', `${projectCatalog[id].name}, ${info.subtitle}, ${ui.viewDetails}`);
    const subtitle = button.querySelector('.project-subtitle');
    if (subtitle) subtitle.textContent = info.subtitle;
  }
  labels.forEach((label) => { label.textContent = ui.projects[label.dataset.label].connection; });
  if (dialog.open) {
    const scroll = dialog.scrollTop;
    if (dialog.dataset.project === 'about') renderAbout(); else renderProject(dialog.dataset.project);
    dialog.scrollTop = scroll;
  }
  if (persist) {
    try { localStorage.setItem('gojue.language', language); } catch { /* Optional preference. */ }
  }
  scheduleLayout();
}

function openDetails(id, trigger) {
  if (id !== 'about' && !Object.hasOwn(projectCatalog, id)) return;
  lastTrigger = trigger;
  if (id === 'about') renderAbout(); else renderProject(id);
  setActive(id !== 'about' && id !== 'ecapture' ? id : null);
  const node = trigger.closest('.project');
  node?.classList.add('is-clicked');
  node?.addEventListener('animationend', () => node.classList.remove('is-clicked'), { once: true });
  experience.classList.add('has-dialog');
  dialog.dataset.project = id;
  // A nonmodal drawer keeps the header's language switch available while
  // reading details. The scene itself is inert until the drawer is closed.
  scene.inert = true;
  hero.inert = true;
  backdrop.hidden = false;
  if (!dialog.open) dialog.show();
  document.querySelector('#close-detail').focus({ preventScroll: true });
  dialog.scrollTop = 0;
  scheduleLayout();
}

document.querySelectorAll('[data-open]').forEach((button) => {
  button.addEventListener('click', () => openDetails(button.dataset.open, button));
  button.addEventListener('focus', () => {
    if (dialog.open || !button.matches(':focus-visible')) return;
    const id = button.dataset.open;
    setActive(id === 'ecapture' ? null : id);
    if (id !== 'ecapture') {
      const rect = button.getBoundingClientRect();
      lookAt({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
  });
  button.addEventListener('blur', () => {
    if (!dialog.open) setActive(null);
  });
});
document.querySelector('#about-button').addEventListener('click', (event) => openDetails('about', event.currentTarget));
document.querySelector('#close-detail').addEventListener('click', () => dialog.close());
backdrop.addEventListener('click', () => dialog.close());
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && dialog.open) {
    event.preventDefault();
    dialog.close();
  }
});
dialog.addEventListener('close', () => {
  experience.classList.remove('has-dialog');
  scene.inert = false;
  hero.inert = false;
  backdrop.hidden = true;
  delete dialog.dataset.project;
  setActive(null);
  scheduleLayout();
  // Keep a keyboard user's selected project visible after focus returns.
  lastTrigger?.focus({ preventScroll: true });
});
document.querySelector('.github-link').addEventListener('focus', () => setActive(null));
document.querySelector('#about-button').addEventListener('focus', () => setActive(null));
languageButton.addEventListener('focus', () => { if (!dialog.open) setActive(null); });
languageButton.addEventListener('click', () => setLanguage(language === 'zh' ? 'en' : 'zh', true));

const observer = new ResizeObserver(scheduleLayout);
observer.observe(scene);
observer.observe(coreAnchor);
projects.forEach((project) => observer.observe(project.querySelector('.logo-anchor')));
document.fonts.ready.then(scheduleLayout);
window.addEventListener('load', scheduleLayout, { once: true });
setLanguage(language);
updateLayout();
