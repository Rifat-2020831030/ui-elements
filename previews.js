// Static miniatures keep card links as the only keyboard and pointer targets.
const previewArt = (() => {
  const ink='#294e42', green='#36745a', pale='#d8e9ce', paper='#fff', edge='#9bb4a2', warm='#a34c3d';
  const rect=(x,y,w,h,fill=paper,r=4,stroke=edge)=>'<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+fill+'" stroke="'+stroke+'"/>';
  const text=(x,y,s,color=ink,size=10)=>'<text x="'+x+'" y="'+y+'" fill="'+color+'" font-family="system-ui,sans-serif" font-weight="550" font-size="'+size+'">'+s+'</text>';
  const line=(x,y,w)=>rect(x,y,w,3,edge,1,'none');
  const btn=(s,x=42,y=21,w=86,fill=green)=>rect(x,y,w,24,fill,5,fill===paper?edge:fill)+text(x+9,y+16,s,fill===paper?ink:paper);
  const field=(s,y=23)=>rect(21,y,128,21)+text(28,y+14,s);
  const panel=(heading,body)=>rect(18,6,136,54)+text(25,21,heading)+body;
  const rows=(labels,selected=-1)=>labels.map((s,i)=>rect(24,4+i*20,122,18,i===selected?pale:paper,3)+text(30,17+i*20,s)).join('');
  const track=(value=72)=>rect(24,31,122,6,'#dbe5da',3,'none')+rect(24,31,value,6,green,3,'none');
  const knob=x=>'<circle cx="'+x+'" cy="34" r="6" fill="white" stroke="'+green+'" stroke-width="2"/>';
  const bars=line(26,28,95)+line(26,37,74)+line(26,46,86);
  const tiles=rect(20,14,39,36)+rect(65,14,39,36)+rect(110,14,39,36);
  const tab=(a,b)=>btn(a,25,21,60)+btn(b,85,21,60,paper);
  const table=(a,b,c,d)=>rect(16,7,138,50)+rect(16,7,138,16,pale,2)+text(22,19,a)+text(103,19,b)+text(22,37,c)+text(104,37,d)+line(22,47,60)+line(104,47,32);
  const art = {
    button:btn('Save draft'), 'button/primary':btn('Save draft'), 'button/secondary':btn('Preview',42,21,86,paper),
    'button/destructive':btn('Discard',42,21,86,warm), 'button/icon':btn('✎',68,21,30),
    link:text(44,36,'View profile',green,14)+rect(44,39,74,1,green,0,'none'),
    'toggle-button':btn('✓  Pinned'), 'split-button':btn('Save',33,21,78)+btn('▾',113,21,26),
    'action-menu':rows(['Actions   ▾','Duplicate','Archive'],1), toolbar:tab('B    I','U    ≡'),
    'application-menubar':rect(10,12,150,36)+text(19,34,'File ▾     Edit ▾     View ▾'),
    'text-field':field('A short title  │'), 'text-area':rect(21,11,128,44)+bars,
    'number-input':field('12                   −   +'), 'native-select':field('Standard                 ▾'),
    combobox:rows(['⌕   Ma│','Maya Roy','Mason Lee'],1), radio:rows(['◉   Standard','○   Express'],0),
    checks:rows(['☑   Orders','☐   Inventory'],0), switch:rect(43,20,46,25,green,14,green)+knob(76)+text(96,37,'On'),
    range:track()+knob(96),'multi-select-with-removable-tokens':rect(8,17,154,30)+btn('Lee ×',13,20,51)+btn('Maya ×',68,20,65),
    'date-picker':panel('June   ‹  ›',text(28,37,'12    13    14    15')+text(28,51,'19    20    21    22')),
    'date-range-picker':panel('June   ‹  ›',rect(37,27,78,20,pale)+text(26,42,'11   12   13   14   15')),
    'color-picker':rect(33,19,29,27,green)+text(72,37,'#36745A'),listbox:rows(['Amber','Fern','Sage'],1),
    'two-thumb-range-slider':track(90)+knob(47)+knob(114),'time-picker':field('09  :  30    AM'),
    'password-input-with-reveal-control':field('••••••••      Show'),'segmented-control':tab('List','Grid'),
    'inline-validation':field('name@',10)+text(23,47,'!  Enter a valid email',warm),
    'error-summary':panel('2 fields need attention',text(26,37,'• Email address',warm)+text(26,51,'• Full name',warm)),
    'field-group-with-conditional-fields':text(24,18,'☑   Ship to address')+field('Street address',27),
    'multi-step-form':panel('Step 2 of 3',line(26,30,72)+btn('Next',98,30,47)),
    'unsaved-changes-prompt':panel('Discard your edits?',btn('Stay',26,29,46,paper)+btn('Discard',78,29,68,warm)),
    'masked-input':field('(555) 123-____'),'character-counter':field('A short bio',12)+text(116,50,'11 / 80'),
    tabs:text(22,22,'Profile      Billing')+rect(21,27,36,3,green)+line(22,39,110),
    breadcrumbs:text(13,37,'Home   ›   Files   ›   Drafts'),
    'sidebar-navigation':rect(18,7,134,51)+rect(18,7,46,51,pale)+text(22,23,'Inbox')+text(22,40,'Sent')+line(74,22,60),
    pagination:text(20,38,'‹    1')+btn('2',62,20,26)+text(98,38,'3    …    ›'),
    'load-more':line(23,9,117)+line(23,17,89)+btn('Load more',43,30,84,paper),
    'infinite-scroll':rows(['Article 01','Article 02','↓   Loading more…']),
    'search-box':field('⌕    Search…'),'faceted-filters':panel('Filter results',text(26,37,'☑  Open      ☐  Closed')+text(26,51,'Owner    ▾')),
    'command-palette':rows(['⌕   Run command','Open settings      ↵','New document'],1),
    'skip-link':btn('Skip to content',26,20,118,paper),'in-page-navigation':rows(['Contents','01   Introduction','02   Details']),
    'language-selector':field('◎   English               ▾'),accordion:rows(['▸   Shipping','▾   Returns','      Within 30 days'],1),
    'single-disclosure':text(26,31,'▸   More details'), 'card-grid':tiles+line(25,40,27)+line(70,40,25)+line(115,40,27),
    'list-detail-view':rect(18,9,54,44,pale)+rect(75,9,79,44)+text(23,30,'Inbox')+text(81,30,'Message'),
    'resizable-split-pane':rect(18,9,67,44)+rect(91,9,62,44,pale)+text(80,36,'⋮'),
    carousel:rect(30,9,110,40,pale)+text(8,34,'‹')+text(151,34,'›')+text(71,60,'• ○ ○'),
    'page-landmarks-and-application-shell':rect(20,6,130,53)+rect(20,6,130,11,pale)+rect(20,47,130,12,pale)+text(69,37,'Main'),
    tooltip:btn('Help',60,37,50,paper)+btn('More information',29,7,112),
    popover:panel('Settings   ×',field('Reminders    ▾',30)),
    dialog:panel('Discard draft?',btn('Cancel',26,29,58,paper)+btn('Discard',88,29,58,warm)),
    drawer:rect(18,7,133,50,pale)+rect(81,7,70,50)+text(87,23,'Details  ×')+line(87,33,50),
    'context-menu':rows(['Duplicate','Rename','Archive'],1),'modal-form-dialog':panel('Rename   ×',field('Field notes',30)),
    'cookie-consent-banner':rect(8,24,154,34)+text(14,45,'Cookies')+btn('Accept',88,29,65),
    progress:track()+text(24,23,'Uploading   60%'),spinner:'<circle cx="86" cy="32" r="16" fill="none" stroke="'+green+'" stroke-width="5" stroke-dasharray="73 28"/>',
    skeleton:rect(23,13,26,26,'#ccd9cd',13)+line(58,16,90)+line(58,26,67)+line(26,47,111),
    toast:btn('✓   Draft saved',38,28,101), 'inline-alert':panel('⚠  Check this value',line(25,33,96)),
    'status-badge':rect(44,19,82,25,pale,13)+text(56,35,'●   Active'),
    'empty-state':panel('No items yet',text(26,44,'+   Create first item')), 'error-state-with-retry':panel('Request failed',btn('Retry',28,29,52,paper)),
    meter:track(89)+text(24,22,'Capacity    73%'), 'step-indicator':text(17,37,'✓  Details    ─    ②  Review'),
    'site-wide-notification-banner':rect(12,9,146,47)+rect(12,9,146,18,pale)+text(19,22,'Service announcement')+line(19,40,84),
    'data-table':table('Name','Total','Orbit','24'), 'sortable-table':table('Name','Total ↓','Orbit','24'),
    'editable-data-grid':table('Item','Qty','Books','12')+rect(99,24,45,16,'none',1,green),
    'tree-view':rows(['▾  Projects','    ├  Drafts','    └  Final']),timeline:text(37,18,'●    Created')+text(37,37,'│')+text(37,54,'●    Reviewed'),
    'inline-edit':field('Field notes     ✎'), 'bulk-selection-and-actions':table('☑   Items','Archive','☑   Draft','✓'),
    treegrid:table('Folder','Size','▾  Files','12 MB')+text(23,53,'   └  Notes'), 'summary-list':table('Field','Value','Plan','Pro'),
    'task-list-with-completion-states':rows(['☑   Add details','☐   Review draft']),
    'copyable-code-snippet':panel('Code                Copy',text(29,43,'$ npm run build')),
    'file-picker':btn('Choose file…',35,20,99,paper),'file-drop-zone':'<rect x="18" y="7" width="134" height="49" rx="5" fill="white" stroke="'+green+'" stroke-dasharray="4 3"/>'+text(46,36,'↓   Drop files'),
    'upload-queue':rows(['notes.pdf      75%','photo.jpg      20%','draft.txt       Queued']),
    'image-gallery-with-lightbox':rect(31,8,107,48)+ '<image href="demos/media/ridge.png" x="34" y="11" width="101" height="42" preserveAspectRatio="xMidYMid slice"/>',
    'media-player':text(20,30,'▶    0:12 / 0:35')+track(44), 'reorderable-list':rows(['⠿    First item','⠿    Second item','⠿    Third item']),
    'kanban-board':tiles+line(24,20,26)+line(70,20,27)+line(115,20,25)+rect(25,30,27,11,pale)+rect(70,30,27,11,pale),
    'pan-and-zoom-canvas':rect(18,6,136,52,pale)+text(29,26,'● Depot')+text(85,45,'● Hub')+text(127,20,'±')
  };
  return art;
})();
const familySamples = {
  Actions:'split-button', 'Inputs and selection':'combobox', 'Forms and validation':'inline-validation',
  'Navigation and search':'breadcrumbs', 'Layout and disclosure':'card-grid', 'Overlays and contextual help':'dialog',
  'Feedback and status':'progress', 'Data display and editing':'data-table', 'Files and media':'image-gallery-with-lightbox',
  'Direct manipulation':'kanban-board', Charts:'bar', 'Diagrams and spatial data':'network-graph'
};
const previewCache = new Map();
function patternPreview(id) {
  if (!previewCache.has(id)) {
    const frame = document.createElement('div');
    frame.className = 'pattern-preview';
    frame.setAttribute('aria-hidden','true');
    if (Object.hasOwn(previewArt,id)) {
      frame.innerHTML = '<svg viewBox="0 0 170 64" focusable="false">'+previewArt[id]+'</svg>';
    } else {
      const entry = byPattern.get(id);
      const staging = document.createElement('div');
      demos[entry.name](staging);
      frame.append(staging.querySelector('svg'));
    }
    previewCache.set(id,frame);
  }
  return previewCache.get(id).cloneNode(true);
}
