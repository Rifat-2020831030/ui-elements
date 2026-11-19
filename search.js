/* Normalize terms on both sides, keeping the visible vocabulary intact. */
const wordGroups = [
  'choose pick select choosing selected selecting', 'customer client customers clients', 'revenue sales',
  'compare comparison comparing', 'delete discard deleting remove', 'alerts notifications', 'dropoff abandon abandonment lose loses',
  'show see display visualize', 'inputs fields field', 'documents document', 'file files attachment attachments',
  'many several multiple', 'tasks task jobs', 'reviewer reviewers', 'items item records record', 'edit change update editing',
  'period interval', 'amount quantity', 'minimum min lower cheapest', 'maximum max upper highest',
  'press click activate', 'weekly week weeks', 'location locations place places', 'label labels labeled',
  'status state', 'move moving', 'value values', 'find locate search', 'regions regional region',
  'navigate navigation', 'command commands action actions', 'distribution distributed spread',
  'view views', 'parts components', 'size sizes magnitude', 'step steps stage stages', 'services service',
  'photo picture image photos images', 'notice notification', 'unfinished incomplete pending', 'errors error invalid',
  'connection connections dependencies relationships', 'team staff', 'character characters', 'scroll scrolling',
  'type typing typed', 'sort sorting sorted sortable rank', 'export exports exporting', 'edit edited edits editing update change',
  'playing play playback', 'drag dragging draggable', 'divider boundary separator splitter', 'slide sliding',
  'save saved saving', 'wider widen resize resizing resizable', 'directory directories lookup',
  'side sides adjacent', 'rearrange rearranging reorder reorderable ordering', 'between interval',
  'address addresses', 'application app', 'previous prior earlier', 'reorder rearrange reorderable',
  'attach upload uploading', 'time duration', 'assign assigned', 'failed failure', 'ordered order ordering',
];
const vocabulary = new Map();
for (const group of wordGroups) {
  const terms = group.split(' ');
  for (const term of terms) vocabulary.set(term, terms[0]);
}
const stopWords = new Set('a an the how of or to by for in from which is i and with at my do can where want need me let that user users it as on we when something without each what should be are so all you this'.split(' '));
function keywords(text) {
  return [...new Set((text.toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter(word => !stopWords.has(word)))];
}
const indexedPatterns = entries.map(entry => {
  const fields = [entry.name, entry.aliases.join(' '), ...entry.needs, entry.instruction, entry.guidance];
  const keywordsByField = fields.map(keywords);
  const normalized = keywordsByField.map(words => words.map(word => vocabulary.get(word) || word));
  return {entry, fields: normalized, keywordsByField};
});
const rarity = new Map();
for (const {fields} of indexedPatterns) {
  for (const term of new Set(fields.flat())) rarity.set(term, (rarity.get(term) || 0) + 1);
}
function searchPatterns(query, family = '') {
  const raw = query.trim().toLowerCase();
  if (!raw) return entries.filter(e => !family || family === e.family);
  const words = keywords(raw);
  return indexedPatterns.filter(({entry}) => !family || entry.family === family).map(({entry, fields, keywordsByField}) => {
    const exact = entry.name.toLowerCase() === raw ? 10000 : entry.aliases.some(a => a.toLowerCase() === raw) ? 1000 : 0;
    const scores = fields.map((field, index) => {
      let hits = 0;
      let score = 0;
      for (const word of words) {
        const normalized = vocabulary.get(word) || word;
        let strength = field.includes(normalized) ? 1 : 0;
        if (!strength && word.length >= 3) {
          const originals = keywordsByField[index];
          if (originals.some(t => t.startsWith(word))) strength = 0.45;
          else if (originals.some(t => t.includes(word))) strength = 0.25;
        }
        if (strength) {
          hits++;
          score += strength * Math.log(1 + entries.length / (rarity.get(normalized) || 1));
        }
      }
      return score * (1 + hits / Math.max(1, words.length)) * (index === 0 ? 1.3 : index === fields.length - 1 ? 0.65 : 1);
    });
    return {entry, score: exact + Math.max(...scores) + scores.reduce((a,b) => a+b, 0) * 0.15};
  }).filter(hit => hit.score > 0).sort((a,b) => b.score-a.score).map(hit => hit.entry);
}
