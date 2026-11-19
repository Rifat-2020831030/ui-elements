const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const ctx = vm.createContext({});
const run = code => vm.runInContext(code, ctx);
run('const demos = Object.create(null)');
for (const file of ['catalog.js','search.js','demos/controls.js','demos/workspace.js','demos/charts.js']) {
  run(fs.readFileSync(path.join(root,file),'utf8'));
}
const entries = run('entries');
const search = run('searchPatterns');
test('every planned pattern has content, exactly one renderer and valid comparison targets', () => {
  const plan = fs.readFileSync(path.join(root,'docs/superpowers/plans/2026-11-19-ui-pattern-coverage.md'),'utf8');
  const names = [...plan.matchAll(/^- \[[ x]\] (.+)$/gm)].map(m=>m[1].split(' (')[0]);
  assert.deepEqual(entries.map(e=>e.name).join('|'),names.join('|'));
  const ids = new Set(entries.map(e=>e.id));
  assert.equal(ids.size,names.length);
  assert.equal(run('Object.keys(demos).length'),names.length);
  for(const e of entries){
    assert.equal(typeof run('demos')[e.name], 'function',e.name);
    assert.ok(e.instruction && e.guidance && e.needs.length && e.aliases.length);
    assert.ok(e.related.length && e.related.every(id=>id!==e.id && ids.has(id)),e.name);
  }
});
test('canonical names rank first and family filters scope results',()=>{
  for(const e of entries){
    assert.equal(search(e.name)[0].id,e.id);
    assert.ok(search('',e.family).every(p=>p.family===e.family));
  }
  assert.equal(search('zxyqzz').length,0);
});
test('business-need regression queries return an acceptable top-three match at least 90% of the time',()=>{
  const cases = require('./search-cases.json');
  for(const family of new Set(entries.map(e=>e.family))) assert.ok(cases.filter(c=>c.family===family).length>=2);
  const misses = cases.filter(c=>!search(c.query).slice(0,3).some(e=>c.acceptable.includes(e.id)));
  console.log('Search benchmark: '+(cases.length-misses.length)+'/'+cases.length+'; misses: '+misses.map(c=>c.acceptable.join('/')).join(', '));
  assert.ok(1-misses.length/cases.length>=0.9);
});
test('partial keywords match the original spelling from three characters, including inside a word',()=>{
  assert.equal(search('ka').some(e=>e.id==='kanban-board'),false);
  for(const fragment of ['KAN','nba']) assert.equal(search(fragment)[0].id,'kanban-board');
  assert.ok(search('sorta').some(e=>e.id==='sortable-table'));
});
