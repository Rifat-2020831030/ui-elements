const byId = id => document.getElementById(id);
const byPattern = new Map(entries.map(e => [e.id, e]));
const families = [...new Set(entries.map(e => e.family))];
const searchBox = byId('search');
let peer = '';
const cleanups = [];
function unmount() {
  while (cleanups.length) cleanups.pop()();
}
function mount(entry, container) {
  const cleanup = demos[entry.name](container);
  if (typeof cleanup === 'function') cleanups.push(cleanup);
}
function instruction(entry) {
  return entry.instruction.toLowerCase().includes(entry.name.toLowerCase())
    ? entry.instruction : entry.name + '. ' + entry.instruction;
}
function buildDetails(entry, slot, comparing = false) {
  const card = document.createElement('div');
  card.className = 'specimen';
  card.innerHTML = '<small class="eyebrow"></small><h2 tabindex="-1"></h2><p class="guidance"></p><p class="aliases"></p><section><h3>Live demo</h3><div class="demo"></div></section><section><h3>Example need</h3><p class="need"></p></section><section class="prompt"><h3>Agent instruction</h3><p></p><button type="button">Copy instruction</button></section>';
  card.querySelector('small').textContent = entry.family;
  const title = card.querySelector('h2');
  title.textContent = entry.name;
  if (!comparing) title.id = 'pattern-title';
  card.querySelector('.aliases').textContent = 'Search terms · ' + entry.aliases.join(', ');
  card.querySelector('.guidance').textContent = entry.guidance;
  card.querySelector('.need').textContent = entry.needs[0];
  card.querySelector('.prompt p').textContent = instruction(entry);
  const copy = card.querySelector('.prompt button');
  copy.onclick = async () => {
    try {
      await navigator.clipboard.writeText(card.querySelector('.prompt p').textContent);
      copy.textContent = 'Copied';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(card.querySelector('.prompt p'));
      const selection = window.getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      copy.textContent = 'Text selected · copy manually';
    }
  };
  slot.append(card);
  mount(entry, card.querySelector('.demo'));
}
const comparisons = [
  [['native-select','combobox','listbox','radio'], 'Choose one item from a known set. Try each control and consider how the list length changes the choice.'],
  [['checks','switch','toggle-button'], 'Let someone change a preference. Consider whether choices are independent and when each change should take effect.'],
  [['tooltip','popover','dialog','modal-form-dialog'], 'Show information beside a control. Decide whether the reader needs to interact with it or respond before continuing.'],
  [['data-table','editable-data-grid','sortable-table','treegrid'], 'Inspect a collection of records. Consider whether the task also requires editing, sorting, or expanding rows.'],
  [['histogram','bar','box-plot'], 'Summarize a dataset. Are you comparing named categories or exploring how numeric observations are distributed?'],
  [['tree-diagram','network-graph'], 'Trace a relationship. Check whether each item has a single parent or can connect to several peers.'],
  [['meter','progress','bullet-chart'], 'Show a numeric value in context. Decide whether it represents a level, completion, or performance against a target.']
];
function renderDetails(entry) {
  unmount();
  const detail = byId('detail');
  detail.replaceChildren();
  const compare = document.createElement('label');
  compare.className = 'compare';
  compare.textContent = 'Compare with ';
  const picker = document.createElement('select');
  picker.add(new Option('Choose a pattern…', ''));
  const related = entry.related.map(id => byPattern.get(id));
  const other = entries.filter(e => e.id !== entry.id && !entry.related.includes(e.id));
  for (const [label, patterns] of [['Related patterns',related],['Other patterns',other]]) {
    const group = document.createElement('optgroup');
    group.label = label;
    patterns.forEach(e => group.append(new Option(e.name,e.id)));
    picker.append(group);
  }
  picker.value = peer;

  compare.append(picker); detail.append(compare);
  const pair = document.createElement('div');
  pair.className = peer ? 'pair comparing' : 'pair';
  detail.append(pair);
  buildDetails(entry, pair);
  const primaryCleanupCount = cleanups.length;
  const note = document.createElement('p');
  note.className = 'comparison-note';
  pair.before(note);
  function showPeer() {
    while (cleanups.length > primaryCleanupCount) cleanups.pop()();
    pair.querySelector('.specimen + .specimen')?.remove();
    pair.classList.toggle('comparing', Boolean(peer));
    const context = comparisons.find(([ids]) => ids.includes(entry.id) && ids.includes(peer));
    note.hidden = !context;
    note.textContent = context ? context[1] : '';
    if (peer) buildDetails(byPattern.get(peer), pair, true);
  }
  picker.onchange = () => {peer = picker.value; showPeer()};
  showPeer();
}
const familyNotes = {
  'Actions': ['Buttons & actions','Run a command, switch an action on or off, or offer a menu of commands.'],
  'Inputs and selection': ['Inputs & selection','Enter a value or choose one or more options.'],
  'Forms and validation': ['Forms & validation','Guide people through a form and help them fix mistakes.'],
  'Navigation and search': ['Navigation & search','Find a destination, filter results, or move through pages.'],
  'Layout and disclosure': ['Layout & disclosure','Arrange content and let people reveal more detail.'],
  'Overlays and contextual help': ['Overlays & contextual help','Explain a control or open a task above the current view.'],
  'Feedback and status': ['Feedback & status','Show what happened, what is happening, or what needs attention.'],
  'Data display and editing': ['Data display & editing','Inspect, organize, and edit records.'],
  'Files and media': ['Files & media','Choose files, manage uploads, or play media.'],
  'Direct manipulation': ['Direct manipulation','Move, reorder, and explore objects on screen.'],
  'Charts': ['Charts','Compare quantities, investigate distributions, or follow trends.'],
  'Diagrams and spatial data': ['Diagrams & spatial data','Trace relationships, schedules, flows, and geographic patterns.']
};
const buttonVariants = [
  ['primary','Primary button','Give the main action in a task the most visual emphasis.'],
  ['secondary','Secondary button','Offer a supporting action alongside the main one.'],
  ['destructive','Destructive button','Signal that an action removes or discards something.'],
  ['icon','Icon-only button','Use a recognizable symbol in a compact space and provide an accessible name.']
];
const familyRoute = family => '#family/' + family.toLowerCase().replaceAll(' ', '-');
const browseQueries = new Map();
function link(text, href) {
  const a = document.createElement('a');
  a.textContent = text; a.href = href;
  return a;
}
function card(title, description, href, caption, previewId = href.slice(1)) {
  const a = link('',href);
  a.className = 'directory-card';
  const h = document.createElement('h3'); h.textContent = title;
  const p = document.createElement('p'); p.textContent = description;
  a.append(patternPreview(previewId),h,p);
  if (caption) {
    const tag = document.createElement('span'); tag.textContent = caption; a.append(tag);
  }
  byId('directory').append(a);
  return a;
}
function route() {
  const hash = location.hash;
  const [id, type] = hash.slice(1).split('/');
  const entry = byPattern.get(id);
  const family = entry?.family || families.find(f => familyRoute(f) === hash);
  const variant = id === 'button' && buttonVariants.find(v => v[0] === type);
  return {entry,family,variant};
}
function browse(family) {
  const query = searchBox.value.trim();
  const directory = byId('directory');
  directory.replaceChildren();
  const isHome = !family && !query;
  byId('browse-title').textContent = query ? 'Search results' : family ? familyNotes[family][0] : 'Explore by family';
  if (isHome) {
    byId('summary').textContent='';
    for (const group of families) {
      const members = entries.filter(e=>e.family===group);
      card(...familyNotes[group],familyRoute(group),members.length+' patterns',familySamples[group]);
    }
    return;
  }
  const hits = searchPatterns(query,family || '');
  byId('summary').textContent = query ? hits.length+' matching '+(hits.length===1?'pattern':'patterns') :
    familyNotes[family][1];
  for (const e of hits) {
    const item = card(e.name, e.guidance, '#'+e.id, query ? e.family : e.needs[0]);
    if (e.id === 'button' && (family || query.toLowerCase().includes('button'))) {
      const variants = document.createElement('div');
      variants.className = 'variant-links';
      for (const [key,name] of buttonVariants) variants.append(link(name,'#button/'+key));
      const group = document.createElement('div');
      group.className = 'button-group';
      item.replaceWith(group);
      group.append(item,variants);
    }
  }
  if (!hits.length) {
    const reset = document.createElement('button');
    reset.textContent='Clear search'; reset.onclick=()=>{searchBox.value='';searchBox.oninput();searchBox.focus()};
    directory.append(reset);
  }
}
function renderRoute(focus = false) {
  const {entry,family,variant} = route();
  peer='';
  const trail = byId('trail');
  trail.replaceChildren();
  trail.hidden = !family;
  if (family) {
    const home = link('All families','#home');
    home.onclick = () => browseQueries.delete('');
    trail.append(home, ' / ');
    if (entry) trail.append(link(familyNotes[family][0],familyRoute(family)), ' / ',variant ? variant[1] : entry.name);
    else trail.append(familyNotes[family][0]);
  }
  byId('intro').hidden = Boolean(family);
  byId('browse').hidden = Boolean(entry);
  byId('detail').hidden = !entry;
  searchBox.closest('.tools').hidden = Boolean(entry);
  let title;
  if (entry) {
    renderDetails(entry);
    title = byId('pattern-title');
    if (entry.id === 'button' && !variant) {
      const choices = document.createElement('section');
      choices.className = 'button-choices';
      const heading = document.createElement('h3');
      heading.textContent = 'Which button fits?';
      choices.append(heading);
      const types = buttonVariants.map(([key,name,description]) => [name,description,'#button/'+key]);
      for (const id of ['toggle-button','split-button']) {
        const option = byPattern.get(id);
        types.push([option.name,option.guidance,'#'+id]);
      }
      for (const [name,description,href] of types) {
        const option = link(name,href);
        const hint = document.createElement('span');
        hint.textContent = description;
        option.prepend(patternPreview(href.slice(1))); option.append(hint); choices.append(option);
      }
      title.closest('.specimen').querySelector('section').before(choices);
    }
    if (variant) {
      title.textContent = variant[1];
      const specimen = title.closest('.specimen');
      specimen.querySelector('.guidance').textContent = variant[2];
      const btn = specimen.querySelectorAll('.demo button')[buttonVariants.indexOf(variant)];
      btn?.classList.add('variant-focus');
      for (const other of specimen.querySelectorAll('.demo button')) other.hidden = other !== btn;
      specimen.querySelector('.need').textContent = ['Save edits to a draft','Preview a draft before saving','Discard a draft','Open a print preview from a compact toolbar'][buttonVariants.indexOf(variant)];
      specimen.querySelector('.aliases').replaceChildren(link('Explore other button types','#button'));
      const prompt = variant[1]+'. '+variant[2];
      specimen.querySelector('.prompt p').textContent = prompt;
    }
  } else {
    unmount(); byId('detail').replaceChildren();
    searchBox.value=browseQueries.get(family || '') || '';
    searchBox.placeholder=family ? 'Search this family' : 'Search a pattern or describe what you need';
    browse(family);
    title=byId('browse-title');
  }
  document.title=title.textContent+' · Fieldwork';
  if (focus) {title.focus({preventScroll:true}); window.scrollTo(0,0)}
}
searchBox.oninput=()=>{
  const {family}=route();
  browseQueries.set(family || '',searchBox.value);
  browse(family);
};
byId('total').textContent=entries.length;
byId('families').textContent=families.length;
window.addEventListener('hashchange',()=>renderRoute(true));
renderRoute();

document.addEventListener('keydown', event => {
  if (event.key !== '/' || event.defaultPrevented || event.isComposing ||
      event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
  if (document.querySelector('dialog[open]') || event.target.isContentEditable ||
      event.target.closest?.('input, textarea, select, [role="textbox"]')) return;
  event.preventDefault();
  if (route().entry) {
    window.addEventListener('hashchange', () => searchBox.focus(), {once:true});
    location.hash = 'home';
  } else searchBox.focus();
});
