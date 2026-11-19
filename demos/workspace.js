// Each renderer owns its DOM, event handlers and sample data.
(() => {
  let sequence = 0;
  function stage(container, html) {
    const root = document.createElement('div');
    root.className = 'ws';
    root.innerHTML = html;
    container.replaceChildren(root);
    return {
      root,
      find: selector => root.querySelector(selector),
      all: selector => [...root.querySelectorAll(selector)],
      on(selector, event, handler) { root.querySelector(selector).addEventListener(event, handler); },
      status(message) { root.querySelector('output').textContent = message; }
    };
  }
  const uid = () => 'ws-' + ++sequence;
  const output = '<output aria-live="polite"></output>';
  const button = (label, action) => '<button type="button" data-action="' + action + '">' + label + '</button>';
  const block = content => '<div class="ws-box">' + content + '</div>';
  const row = content => '<div class="ws-row">' + content + '</div>';
  const action = name => '[data-action="' + name + '"]';
  const handle = (s, name, fn) => s.on(action(name), 'click', fn);
  function dialogEvents(s, onClose) {
    const dialog = s.find('dialog');
    let trigger;
    s.all('[data-open]').forEach(b => b.onclick = () => {
      trigger = b;
      dialog.returnValue = '';
      dialog.showModal();
    });
    dialog.addEventListener('close', () => {
      if (onClose) onClose(dialog.returnValue);
      trigger?.focus();
    });
    return dialog;
  }

  demos['Accordion'] = container => {
    const group = uid();
    stage(container, ['When will my order ship?', 'Can I change my address?', 'Where can I track delivery?'].map((title, i) =>
      '<details name="' + group + '"' + (i === 0 ? ' open' : '') + '><summary>' + title + '</summary><p>' +
      ['Orders ship within two business days.', 'Edit your address any time before dispatch.', 'Your dispatch email includes a tracking link.'][i] + '</p></details>').join(''));
  };
  demos['Single disclosure'] = container => {
    stage(container, block('<b>Delivery estimate</b><p>Thursday, 22 May</p><details><summary>How we calculate this</summary><p>Two days for packing and three days for ground delivery.</p></details>'));
  };
  const records = [
    ['Field notebook', 'Stationery', '120 ruled pages', 'NW-104'],
    ['Survey compass', 'Equipment', 'Brass case with a sighting mirror', 'EQ-071'],
    ['Field atlas', 'Reference', '24 regional maps', 'BK-206']
  ];
  demos['Card grid'] = container => {
    const s = stage(container, '<div class="ws-cards">' + records.map(([name, category], i) =>
      block('<small>' + category + '</small><h4>' + name + '</h4>' + button('Inspect', i).replace('type="button"', 'type="button" aria-label="Inspect ' + name + '"'))).join('') + '</div>' + output);
    s.all('button').forEach((b, i) => b.onclick = () => s.status(records[i][0] + ' · ' + records[i][2] + ' · ' + records[i][3]));
  };
  demos['List-detail view'] = container => {
    const s = stage(container, '<div class="ws-split"><div class="ws-stack">' + records.map(([name], i) => button(name, i)).join('') + '</div><div class="ws-box" aria-live="polite"></div></div>');
    const buttons = s.all('button');
    function select(i) {
      buttons.forEach((b, n) => b.setAttribute('aria-pressed', String(n === i)));
      const [name, type, detail, code] = records[i];
      s.find('.ws-box').innerHTML = '<small>' + type + '</small><h4>' + name + '</h4><p>' + detail + '</p><code>' + code + '</code>';
    }
    buttons.forEach((b, i) => b.onclick = () => select(i));
    select(0);
  };
  demos['Resizable split pane'] = container => {
    const s = stage(container, '<div class="ws-panes">' + block('<b>Outline</b><p>Findings<br>Sources<br>Next steps</p>') +
      '<div role="separator" tabindex="0" aria-label="Outline width" aria-orientation="vertical" aria-valuemin="20" aria-valuemax="75"></div>' +
      block('<b>Findings</b><p>The northern trail is clear from the survey camp to the river crossing.</p>') + '</div><p>Drag the divider or focus it and use the arrow keys.</p>');
    const pane = s.find('.ws-panes'), grip = s.find('[role=separator]');
    let width = 35;
    function resize(n) {
      width = Math.round(Math.min(75, Math.max(20, n)));
      pane.style.gridTemplateColumns = 'minmax(0,' + width + 'fr) 12px minmax(0,' + (100-width) + 'fr)';
      grip.setAttribute('aria-valuenow', width);
      grip.setAttribute('aria-valuetext', width + ' percent');
    }
    grip.onpointerdown = e => grip.setPointerCapture(e.pointerId);
    grip.onpointermove = e => {
      if (!grip.hasPointerCapture(e.pointerId)) return;
      const bounds = pane.getBoundingClientRect();
      resize((e.clientX - bounds.left) * 100 / bounds.width);
    };
    grip.onkeydown = e => {
      const n = {ArrowLeft: width-5, ArrowRight: width+5, Home: 20, End: 75}[e.key];
      if (n !== undefined) { e.preventDefault(); resize(n); }
    };
    resize(width);
  };
  demos['Carousel'] = container => {
    const s = stage(container, '<div aria-label="Field collection" role="region" aria-roledescription="carousel"><div class="ws-box" aria-live="polite"></div>' + row(button('Previous', 'prev') + button('Next', 'next')) + '</div>');
    let position = 0;
    function slide(by) {
      position = (position + by + records.length) % records.length;
      const [name, type, detail] = records[position];
      s.find('.ws-box').innerHTML = '<small>' + type + ' · ' + (position+1) + ' of ' + records.length + '</small><h4>' + name + '</h4><p>' + detail + '</p>';
    }
    handle(s, 'prev', () => slide(-1)); handle(s, 'next', () => slide(1)); slide(0);
  };
  demos['Page landmarks and application shell'] = container => {
    const s = stage(container, '<label>Jump to region <select><option value="">Choose a landmark</option><option value="banner">Header</option><option value="navigation">Navigation</option><option value="main">Main content</option><option value="contentinfo">Footer</option></select></label><div class="ws-shell"><div role="banner" aria-label="Sample workspace" tabindex="-1"><b>Field inventory</b></div><div role="navigation" aria-label="Inventory views" tabindex="-1">' + row(button('Stock', 'Stock') + button('Orders', 'Orders')) + '</div><div role="main" aria-label="Inventory results" tabindex="-1"><b>Stock</b><p>3 field kits available.</p></div><div role="contentinfo" aria-label="Inventory footer" tabindex="-1">Inventory team · North depot</div></div>');
    s.on('select','change', e => { if (e.target.value) s.find('[role="' + e.target.value + '"]').focus(); });
    s.all('button').forEach(b => b.onclick = () => {
      s.find('[role=main]').innerHTML = b.textContent === 'Stock' ? '<b>Stock</b><p>3 field kits available.</p>' : '<b>Orders</b><p>2 kit orders awaiting dispatch.</p>';
    });
  };

  demos['Tooltip'] = container => {
    const id = uid();
    const s = stage(container, '<span class="ws-anchor"><button aria-label="Bookmark report" aria-describedby="' + id + '" aria-pressed="false">☆</button><span class="ws-tip" hidden id="' + id + '" role="tooltip">Save this report to bookmarks</span></span>' + output);
    const b = s.find('button'), tip = s.find('[role=tooltip]'), anchor = s.find('.ws-anchor');
    let hovering = false;
    anchor.onpointerenter = () => { hovering = true; tip.hidden = false; };
    anchor.onpointerleave = () => { hovering = false; tip.hidden = document.activeElement !== b; };
    b.onfocus = () => tip.hidden = false;
    b.onblur = () => tip.hidden = !hovering;
    b.onkeydown = e => { if (e.key === 'Escape') tip.hidden = true; };
    b.onclick = () => {
      const marked = b.getAttribute('aria-pressed') === 'false';
      b.setAttribute('aria-pressed', marked);
      b.textContent = marked ? '★' : '☆';
      s.status(marked ? 'Report bookmarked.' : 'Bookmark removed.');
    };
  };
  demos['Popover'] = container => {
    const edit = uid(), help = uid();
    const s = stage(container, row('<button popovertarget="' + edit + '">Reminder settings</button><button popovertarget="' + help + '">What is a reminder?</button>') +
      '<div popover class="ws-pop" id="' + edit + '"><label>Notify me <select><option>One day before</option><option>One hour before</option></select></label>' + button('Save', 'save') + '</div>' +
      '<div popover class="ws-pop" id="' + help + '">A reminder alerts the assignee before a task is due. <button popovertarget="' + help + '" popovertargetaction="hide">Close</button></div>' + output);
    s.all('[popover]').forEach(pop => {
      const b = s.find('[popovertarget="' + pop.id + '"]');
      pop.addEventListener('beforetoggle', e => {
        if (e.newState !== 'open') return;
        const rect = b.getBoundingClientRect();
        pop.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 260)) + 'px';
        pop.style.top = Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - 140)) + 'px';
      });
    });
    handle(s, 'save', () => {
      s.status('Reminder saved · ' + s.find('select').value);
      s.find('[popover]').hidePopover();
      s.find('button').focus();
    });
  };
  demos['Confirmation dialog'] = container => {
    const s = stage(container, '<button data-open>Discard draft…</button><dialog aria-label="Discard this draft?"><h3>Discard this draft?</h3><p>Your unsaved edits will be lost.</p><form method="dialog"><button autofocus value="cancel">Cancel</button> <button value="discard">Discard draft</button></form></dialog>' + output);
    dialogEvents(s, value => s.status(value === 'discard' ? 'Demo draft discarded.' : 'Draft kept.'));
  };
  demos['Drawer'] = container => {
    const s = stage(container, block('<b>Shipment 204</b><p>North depot · In transit</p><button data-open>View shipment details</button>') +
      '<dialog class="ws-drawer" aria-label="Shipment 204 details"><small>Shipment 204</small><h3>North depot</h3><p>Carrier · Swift Parcel</p><p>Next stop · River station</p><p>Arrival · Thursday, 22 May</p><form method="dialog"><button>Close details</button></form></dialog>');
    dialogEvents(s);
  };
  demos['Context menu'] = container => {
    const s = stage(container, '<div class="ws-box" tabindex="0" aria-label="Survey notes file"><b>survey-notes.txt</b> ' + button('File actions', 'open').replace('type="button"', 'type="button" aria-haspopup="menu" aria-expanded="false"') +
      '<div class="ws-menu" role="menu" aria-label="File actions" hidden><button role="menuitem">Star file</button><button role="menuitem">Show file size</button></div></div><p>Right-click the file or open File actions.</p>' + output);
    const menu = s.find('[role=menu]'), trigger = s.find('button'), items = s.all('[role=menuitem]');
    function open(e) { e.preventDefault(); menu.hidden = false; trigger.setAttribute('aria-expanded','true'); items[0].focus(); }
    function close(focus) { menu.hidden = true; trigger.setAttribute('aria-expanded','false'); if (focus) trigger.focus(); }
    handle(s, 'open', open); s.on('.ws-box','contextmenu', open);
    s.root.onkeydown = e => {
      if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) open(e);
      if (menu.hidden) return;
      const i = items.indexOf(document.activeElement);
      if (['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {
        e.preventDefault(); items[e.key === 'Home' ? 0 : e.key === 'End' ? 1 : (i+1)%2].focus();
      } else if (e.key === 'Escape') { e.preventDefault(); close(true); }
    };
    s.root.onfocusout = e => { if (!s.root.contains(e.relatedTarget)) close(false); };
    items.forEach((b,i) => b.onclick = () => { s.status(i ? 'survey-notes.txt · 24 KB' : 'survey-notes.txt starred.'); close(true); });
  };
  demos['Modal form dialog'] = container => {
    const s = stage(container, '<button data-open>Rename project…</button><dialog aria-label="Rename project"><h3>Rename project</h3><form method="dialog"><label>Project name <input required maxlength="60"></label>' + row('<button value="save">Save name</button><button value="cancel" formnovalidate>Cancel</button>') + '</form></dialog>' + output);
    let name = 'Northern survey';
    s.status('Project · ' + name);
    s.on('[data-open]', 'click', () => s.find('input').value = name);
    dialogEvents(s, value => {
      if (value === 'save') name = s.find('input').value.trim() || name;
      s.status('Project · ' + name);
    });
  };
  demos['Cookie consent banner'] = container => {
    const s = stage(container, '<div class="ws-box" role="region" aria-label="Cookie preferences"><b>Cookie preferences</b><p>Essential cookies keep you signed in. Optional analytics help us improve the guide.</p>' + row(button('Essential only','essential') + button('Allow analytics','allow')) + '</div>' + button('Review preferences','review') + output);
    s.find(action('review')).hidden = true;
    function choose(analytics) {
      s.find('.ws-box').hidden = true;
      s.find(action('review')).hidden = false;
      s.find(action('review')).focus();
      s.status(analytics ? 'Essential and analytics cookies allowed.' : 'Essential cookies only.');
    }
    handle(s, 'essential', () => choose(false)); handle(s, 'allow', () => choose(true));
    handle(s, 'review', () => { s.find('.ws-box').hidden = false; s.find(action('review')).hidden = true; s.find('button').focus(); });
  };
  demos['Progress bar'] = container => {
    const s = stage(container, '<label>Batch upload <progress max="4" value="0"></progress></label>' + button('Finish one file','advance') + output);
    const progress = s.find('progress'), b = s.find('button');
    function update() {
      s.status(progress.value + ' of 4 files · ' + progress.value*25 + '%');
      b.textContent = progress.value === 4 ? 'Reset upload' : 'Finish one file';
    }
    b.onclick = () => { progress.value = (progress.value+1)%5; update(); }; update();
  };
  function loadDemo(container, skeleton) {
    const s = stage(container, button('Load reports','load') + '<div class="ws-box"></div>' + output);
    let loading = false;
    s.find('.ws-box').textContent = 'Reports are ready to fetch.';
    s.find('button').onclick = e => {
      loading = !loading;
      s.find('.ws-box').setAttribute('aria-busy', loading);
      s.find('.ws-box').innerHTML = loading ?
        (skeleton ? '<div class="ws-skeleton" aria-hidden="true"><i></i><i></i><i></i></div>' : '<span class="ws-spinner" aria-hidden="true"></span>') :
        '<b>Survey reports</b><ul><li>Trail inspection</li><li>Water quality</li><li>Bridge survey</li></ul>';
      s.status(loading ? 'Loading reports…' : '3 reports loaded.');
      e.target.textContent = loading ? 'Complete request' : 'Reload reports';
    };
  }
  demos['Spinner'] = c => loadDemo(c, false);
  demos['Skeleton'] = c => loadDemo(c, true);
  demos['Toast'] = container => {
    const s = stage(container, button('Save field note','save') + '<div class="ws-toast" role="status" hidden></div>');
    const toast = s.find('[role=status]');
    let timer;
    handle(s, 'save', () => {
      clearTimeout(timer);
      toast.hidden = false;
      toast.textContent = 'Field note saved.';
      timer = setTimeout(() => { toast.hidden = true; }, 4000);
    });
    return () => clearTimeout(timer);
  };
  demos['Inline alert'] = container => {
    const s = stage(container, block('<b>Survey settings</b><p>The device is offline. Try saving your changes.</p>' + row(button('Save settings','save') + button('Reconnect','connect')) + '<div role="alert"></div>') + output);
    let online = false;
    handle(s, 'save', () => {
      s.find('[role=alert]').textContent = online ? '' : 'Couldn’t save settings. Reconnect and try again.';
      if (online) s.status('Survey settings saved.');
    });
    handle(s, 'connect', () => {
      online = true; s.find('[role=alert]').textContent = ''; s.find('p').textContent = 'The device is online.';
      s.find(action('connect')).disabled = true; s.status('Connection restored.'); s.find(action('save')).focus();
    });
  };
  demos['Status badge'] = container => {
    const s = stage(container, block('<b>Trail inspection</b> <span class="ws-badge" role="status">Draft</span>') + '<label>Report status <select><option>Draft</option><option>In review</option><option>Approved</option></select></label>');
    s.on('select', 'change', e => { const badge = s.find('.ws-badge'); badge.textContent = e.target.value; badge.dataset.state = e.target.selectedIndex; });
  };
  demos['Empty state'] = container => {
    const s = stage(container, block('<b>No saved routes yet</b><p>Save a route to find it here before your next trip.</p>') + button('Save river route','save') + output);
    let saved = false;
    handle(s, 'save', () => {
      saved = !saved;
      s.find('.ws-box').innerHTML = saved ? '<b>River route</b><p>North depot to River station · 8 km</p>' : '<b>No saved routes yet</b><p>Save a route to find it here before your next trip.</p>';
      s.find('button').textContent = saved ? 'Remove saved route' : 'Save river route'; s.status(saved ? '1 saved route.' : '0 saved routes.');
    });
  };
  demos['Error state with retry'] = container => {
    const s = stage(container, block('<div role="status">Route overview is ready.</div>') + button('Simulate failed request','request'));
    let failed = false;
    s.find('button').onclick = e => {
      failed = !failed;
      s.find('[role=status]').textContent = failed ? 'Routes couldn’t load. The connection timed out.' : 'Routes loaded · Ridge trail, River route, North loop.';
      e.target.textContent = failed ? 'Retry loading routes' : 'Simulate failed request';
    };
  };
  demos['Meter'] = container => {
    const s = stage(container, '<label>Storage used <meter min="0" max="100" low="60" high="85" optimum="20" value="42"></meter></label><label>Used capacity (GB) <input type="range" min="0" max="100" value="42"></label>' + output);
    function update() {
      const n = Number(s.find('input').value);
      s.find('meter').value = n; s.status(n + ' of 100 GB used · ' + (n >= 85 ? 'Nearly full' : n >= 60 ? 'Moderate use' : 'Space available'));
    }
    s.on('input','input',update); update();
  };
  demos['Step indicator'] = container => {
    const steps = ['Details','Review','Confirmation'];
    const s = stage(container, '<ol class="ws-steps">' + steps.map(step => '<li>' + step + '</li>').join('') + '</ol>' + row(button('Back','prev') + button('Next stage','next')) + output);
    let i = 0;
    function update() {
      s.all('li').forEach((li,j) => {
        if (j === i) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current');
        li.textContent = steps[j] + (j < i ? ' ✓' : '');
      });
      s.find(action('prev')).disabled = !i; s.find(action('next')).disabled = i === 2;
      s.status('Step ' + (i+1) + ' of 3 · ' + steps[i]);
    }
    handle(s, 'prev', () => { i--; update(); }); handle(s, 'next', () => { i++; update(); }); update();
  };
  demos['Site-wide notification banner'] = container => {
    const s = stage(container, button('Publish maintenance notice','publish') + '<div class="ws-shell"><div class="ws-banner" role="status" hidden></div><div>' + row(button('Overview','Overview') + button('Reports','Reports')) + '<p>Overview · 3 active surveys</p></div></div>');
    const banner = s.find('.ws-banner');
    handle(s, 'publish', e => {
      banner.hidden = !banner.hidden;
      banner.textContent = banner.hidden ? '' : 'Scheduled maintenance · Saturday, 09:00–10:00 UTC';
      e.target.textContent = banner.hidden ? 'Publish maintenance notice' : 'Withdraw notice';
    });
    ['Overview','Reports'].forEach(name => handle(s, name, () => s.find('p').textContent = name === 'Reports' ? 'Reports · 2 reports ready for review' : 'Overview · 3 active surveys'));
  };

  const invoices = [
    {id: 'INV-204', owner: 'Maya', balance: 720},
    {id: 'INV-205', owner: 'Lee', balance: 180},
    {id: 'INV-206', owner: 'Sam', balance: 450}
  ];
  const invoiceCells = record => '<th scope="row">' + record.id + '</th><td>' + record.owner + '</td><td>$' + record.balance + '</td>';
  demos['Data table'] = container => {
    const s = stage(container, '<label>Invoice owner <select><option>All owners</option>' + invoices.map(inv => '<option>' + inv.owner + '</option>').join('') + '</select></label><table><caption>Outstanding invoices</caption><thead><tr><th>Invoice</th><th>Owner</th><th>Balance</th></tr></thead><tbody></tbody></table>' + output);
    function update() {
      const owner = s.find('select').value, filtered = invoices.filter(inv => owner === 'All owners' || inv.owner === owner);
      s.find('tbody').innerHTML = filtered.map(inv => '<tr>' + invoiceCells(inv) + '</tr>').join(''); s.status(filtered.length + ' matching ' + (filtered.length === 1 ? 'invoice' : 'invoices'));
    }
    s.on('select','change',update); update();
  };
  demos['Sortable table'] = container => {
    const fields = ['id','owner','balance'];
    const s = stage(container, '<table><caption>Outstanding invoices</caption><thead><tr>' + ['Invoice','Owner','Balance'].map((v,i) => '<th>' + button(v,fields[i]) + '</th>').join('') + '</tr></thead><tbody></tbody></table>' + output);
    let sort = 'id', ascending = true;
    function update() {
      const order = [...invoices].sort((a,b) => (sort === 'balance' ? a[sort]-b[sort] : a[sort].localeCompare(b[sort]))*(ascending ? 1 : -1));
      s.find('tbody').innerHTML = order.map(inv => '<tr>' + invoiceCells(inv) + '</tr>').join('');
      s.all('thead th').forEach((th,i) => {
        if (fields[i] === sort) th.setAttribute('aria-sort',ascending ? 'ascending' : 'descending');
        else th.removeAttribute('aria-sort');
      });
      s.status('Sorted by ' + (sort === 'id' ? 'invoice' : sort) + ', ' + (ascending ? 'ascending' : 'descending') + '.');
    }
    fields.forEach(field => handle(s, field, () => { ascending = sort === field ? !ascending : true; sort = field; update(); })); update();
  };
  demos['Editable data grid'] = container => {
    const s = stage(container, '<p>Use arrows to move between cells. Press Enter to edit, then Enter to save or Escape to cancel.</p><table role="grid" aria-label="Invoice editor"><thead><tr><th>Invoice</th><th>Owner</th><th>Balance ($)</th></tr></thead><tbody>' +
      invoices.map(inv => '<tr><th scope="row">' + inv.id + '</th><td role="gridcell" tabindex="-1">' + inv.owner + '</td><td role="gridcell" tabindex="-1">' + inv.balance + '</td></tr>').join('') + '</tbody></table>' + output);
    const cells = s.all('[role=gridcell]');
    cells[0].tabIndex = 0;
    function select(cell) { cells.forEach(c => c.tabIndex = c === cell ? 0 : -1); cell.focus(); }
    function edit(cell, i) {
      if (cell.firstElementChild) return;
      select(cell);
      const old = cell.textContent, input = document.createElement('input');
      input.setAttribute('aria-label', (i%2 ? 'Balance' : 'Owner') + ' for ' + invoices[Math.floor(i/2)].id);
      input.required = true; if (i%2) { input.type = 'number'; input.min = '0'; input.step = '0.01'; }
      input.value = old; cell.replaceChildren(input); input.focus(); input.select();
      function finish(commit, refocus) {
        if (!cell.contains(input)) return;
        const valid = input.checkValidity() && input.value.trim() !== '';
        cell.textContent = commit && valid ? input.value.trim() : old;
        s.status(commit && valid ? 'Cell saved.' : 'Original value kept.');
        if (refocus) cell.focus();
      }
      input.onkeydown = e => {
        e.stopPropagation();
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          if (e.key === 'Enter' && !input.reportValidity()) return;
          finish(e.key === 'Enter', true);
        }
      };
      input.onblur = () => finish(true, false);
    }
    cells.forEach((cell,i) => {
      cell.onclick = () => edit(cell,i);
      cell.onkeydown = e => {
        if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); edit(cell,i); return; }
        const dest = {ArrowDown: i+2, ArrowUp: i-2, ArrowRight: i%2 ? i : i+1, ArrowLeft: i%2 ? i-1 : i, Home: i-i%2, End: i-i%2+1}[e.key];
        if (dest !== undefined) { e.preventDefault(); if (cells[dest]) select(cells[dest]); }
      };
    });
  };
  demos['Tree view'] = container => {
    const s = stage(container, '<ul class="ws-tree" role="tree" aria-label="Survey files"><li role="treeitem" tabindex="0" aria-label="North depot" aria-expanded="false"><span>North depot</span><ul role="group" hidden><li role="treeitem" tabindex="-1">Inventory.csv</li><li role="treeitem" tabindex="-1">Routes.pdf</li></ul></li><li role="treeitem" tabindex="-1">Field notes.txt</li></ul>' + output);
    const folder = s.find('[aria-expanded]'), group = s.find('[role=group]'), tree = s.find('[role=tree]'), items = s.all('[role=treeitem]');
    function expand(open) { folder.setAttribute('aria-expanded', open); group.hidden = !open; }
    function focus(item) { items.forEach(li => li.tabIndex = li === item ? 0 : -1); item.focus(); }
    function activate(item) {
      focus(item);
      if (item === folder) expand(group.hidden);
      else {
        items.forEach(li => li.setAttribute('aria-selected', li === item));
        s.status('Selected ' + item.textContent);
      }
    }
    tree.onclick = e => { const item = e.target.closest('[role=treeitem]'); if (item) activate(item); };
    tree.onkeydown = e => {
      const item = e.target, visible = items.filter(li => !li.closest('[hidden]')), i = visible.indexOf(item);
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End','Enter',' '].includes(e.key)) e.preventDefault(); else return;
      if (e.key === 'Enter' || e.key === ' ') activate(item);
      if (e.key === 'ArrowRight' && item === folder) { if (group.hidden) expand(true); else focus(items[1]); }
      if (e.key === 'ArrowLeft') { if (item === folder) expand(false); else if (group.contains(item)) focus(folder); }
      const destination = {ArrowDown: i+1, ArrowUp: i-1, Home: 0, End: visible.length-1}[e.key];
      if (visible[destination]) focus(visible[destination]);
    };
  };
  demos['Timeline'] = container => {
    const events = [['08:15','Order received','Maya submitted the equipment request.'],['09:30','Packed','Lee sealed the field kit at North depot.'],['11:10','Dispatched','Swift Parcel collected the kit.']];
    const s = stage(container, '<ol class="ws-timeline">' + events.map(([time,event],i) => '<li><time>' + time + '</time> ' + button(event,i) + '</li>').join('') + '</ol>' + output);
    s.all('button').forEach((b,i) => b.onclick = () => s.status(events[i][0] + ' · ' + events[i][2]));
  };
  demos['Inline edit'] = container => {
    const s = stage(container, block('<b>Project title</b><p class="ws-value"></p>' + button('Edit title','edit') + '<form hidden><label>Title <input required maxlength="60"></label>' + row('<button>Save</button>' + button('Cancel','cancel')) + '</form>') + output);
    let name = 'Northern survey';
    const form = s.find('form'), edit = s.find(action('edit')), display = s.find('.ws-value');
    display.textContent = name;
    function toggle(open) {
      form.hidden = !open; edit.hidden = open; display.hidden = open;
      if (open) { s.find('input').value = name; s.find('input').focus(); s.find('input').select(); } else edit.focus();
    }
    edit.onclick = () => toggle(true);
    handle(s, 'cancel', () => toggle(false));
    form.onkeydown = e => { if (e.key === 'Escape') toggle(false); };
    form.onsubmit = e => { e.preventDefault(); name = s.find('input').value.trim() || name; display.textContent = name; toggle(false); s.status('Title saved.'); };
  };
  demos['Bulk selection and actions'] = container => {
    const s = stage(container, '<table><caption>Invoices to review</caption><thead><tr><th><input type="checkbox" aria-label="Select all invoices"></th><th>Invoice</th><th>Review</th></tr></thead><tbody>' + invoices.map(inv => '<tr><td><input type="checkbox" aria-label="Select ' + inv.id + '"></td><th scope="row">' + inv.id + '</th><td>Pending</td></tr>').join('') + '</tbody></table>' + button('Mark selected reviewed','apply') + output);
    const master = s.find('thead input'), boxes = s.all('tbody input'), apply = s.find('button');
    function sync() {
      const count = boxes.filter(b => b.checked).length;
      master.checked = count === boxes.length; master.indeterminate = count > 0 && !master.checked; apply.disabled = !count;
      return count;
    }
    master.onchange = () => { boxes.forEach(b => b.checked = master.checked); s.status(sync() + ' selected.'); };
    boxes.forEach(b => b.onchange = () => s.status(sync() + ' selected.'));
    apply.onclick = () => {
      const selected = boxes.filter(b => b.checked);
      selected.forEach(b => { b.closest('tr').lastElementChild.textContent = 'Reviewed'; b.checked = false; });
      sync(); master.focus(); s.status(selected.length + ' marked reviewed.');
    };
    sync();
  };
  demos['Treegrid'] = container => {
    const s = stage(container, '<table role="treegrid" aria-label="Depot stock"><thead><tr><th>Location</th><th>Kits</th><th>Owner</th></tr></thead><tbody><tr aria-expanded="false" aria-level="1" tabindex="0"><th scope="row"><button type="button" tabindex="-1" aria-label="Expand North depot">▸ North depot</button></th><td>12</td><td>Maya</td></tr><tr aria-level="2" tabindex="-1" hidden><th scope="row">Bay A</th><td>7</td><td>Lee</td></tr><tr aria-level="2" tabindex="-1" hidden><th scope="row">Bay B</th><td>5</td><td>Sam</td></tr><tr aria-level="1" tabindex="-1"><th scope="row">River station</th><td>8</td><td>Jo</td></tr></tbody></table><p>Expand North depot to inspect stock by bay.</p>');
    const rows = s.all('tbody tr'), parent = rows[0], trigger = s.find('button');
    function expand(open) {
      parent.setAttribute('aria-expanded', open); rows[1].hidden = rows[2].hidden = !open;
      trigger.textContent = (open ? '▾' : '▸') + ' North depot';
      trigger.setAttribute('aria-label', (open ? 'Collapse' : 'Expand') + ' North depot');
    }
    function focus(r) { rows.forEach(tr => tr.tabIndex = tr === r ? 0 : -1); r.focus(); }
    trigger.onclick = () => { expand(rows[1].hidden); focus(parent); };
    rows.forEach(r => {
      r.onkeydown = e => {
        const visible = rows.filter(tr => !tr.hidden), i = visible.indexOf(r);
        if (!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft','Enter',' ','Home','End'].includes(e.key)) return;
        e.preventDefault();
        if (r === parent && ['ArrowRight','ArrowLeft','Enter',' '].includes(e.key)) {
          if (e.key === 'ArrowRight' && !rows[1].hidden) focus(rows[1]);
          else expand(e.key === 'ArrowRight' || (e.key !== 'ArrowLeft' && rows[1].hidden));
        } else if (e.key === 'ArrowLeft' && r.getAttribute('aria-level') === '2') focus(parent);
        const next = {ArrowDown:i+1,ArrowUp:i-1,Home:0,End:visible.length-1}[e.key];
        if (visible[next]) focus(visible[next]);
      };
    });
  };
  demos['Summary list'] = container => {
    const s = stage(container, '<label>Review order <select><option>Order 204</option><option>Order 205</option></select></label><dl class="ws-summary"></dl>');
    const orders = [['Field kit','North depot','Thursday, 22 May'],['Survey compass','River station','Friday, 23 May']];
    function show() {
      s.find('dl').innerHTML = ['Item','Destination','Delivery'].map((label,i) => '<div><dt>' + label + '</dt><dd>' + orders[s.find('select').selectedIndex][i] + '</dd></div>').join('');
    }
    s.on('select','change',show); show();
  };
  demos['Task list with completion states'] = container => {
    const names = ['Check inventory','Assign a driver','Confirm delivery window'];
    const s = stage(container, names.map((v,i) => '<label class="ws-task">' + v + ' <select aria-label="' + v + ' state"><option>To do</option><option' + (!i ? ' selected' : '') + '>In progress</option><option>Complete</option></select></label>').join('') + output);
    function update() { s.status(s.all('select').filter(el => el.value === 'Complete').length + ' of 3 tasks complete.'); }
    s.all('select').forEach(el => el.onchange = update); update();
  };
  demos['Copyable code snippet'] = container => {
    const s = stage(container, '<label>Example <select><option>Node.js</option><option>Browser</option></select></label><pre><code></code></pre>' + button('Copy code','copy') + output);
    const snippets = ["const path = require('node:path');\nconsole.log(path.basename('/reports/survey.csv'));", "const title = document.title;\nconsole.log(title);"];
    function show() { s.find('code').textContent = snippets[s.find('select').selectedIndex]; s.status(''); }
    s.on('select','change',show); show();
    handle(s, 'copy', async () => {
      const code = s.find('code');
      try {
        if (!navigator.clipboard) throw new Error('clipboard unavailable');
        await navigator.clipboard.writeText(code.textContent); s.status('Code copied.');
      } catch {
        const range = document.createRange(); range.selectNodeContents(code);
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
        let copied = false;
        try { copied = document.execCommand('copy'); } catch {}
        s.status(copied ? 'Code copied.' : 'Code selected. Use your copy shortcut.');
      }
    });
  };

  function fileList(container, drop) {
    const s = stage(container, (drop ? '<div class="ws-drop"><b>Drop files here</b><p>Or choose files from your device.</p>' : '') + '<label>Select local files <input type="file" multiple></label>' + (drop ? '</div>' : '') + '<ul class="ws-files"></ul>' + output);
    function inspect(files) {
      const list = s.find('ul'); list.replaceChildren();
      for (const file of files) {
        const li = document.createElement('li');
        li.textContent = file.name + ' · ' + file.size.toLocaleString() + ' bytes · ' + (file.type || 'Unknown type');
        list.append(li);
      }
      s.status(files.length + (files.length === 1 ? ' file selected.' : ' files selected.'));
    }
    s.on('input','change', e => inspect(e.target.files));
    if (drop) {
      const zone = s.find('.ws-drop');
      zone.ondragover = e => { e.preventDefault(); zone.classList.add('ws-over'); };
      zone.ondragleave = () => zone.classList.remove('ws-over');
      zone.ondrop = e => { e.preventDefault(); zone.classList.remove('ws-over'); inspect(e.dataTransfer.files); };
    }
  }
  demos['File picker'] = c => fileList(c,false);
  demos['File drop zone'] = c => fileList(c,true);
  demos['Upload queue'] = container => {
    const s = stage(container, '<label>Queue local files <input type="file" multiple></label>' + row(button('Add two sample files','sample') + button('Start simulated upload','start')) + '<ul class="ws-files"></ul>' + output);
    let files = [], timer = null;
    function stop() { clearInterval(timer); timer = null; }
    function update() {
      const ready = files.some(f => f.value < 100 && !f.canceled);
      s.find(action('start')).disabled = !ready || timer !== null;
      files.forEach(f => {
        f.progress.value = f.value;
        f.state.textContent = f.canceled ? 'Canceled' : f.value === 100 ? 'Complete' : f.value + '%';
        f.cancel.disabled = f.canceled || f.value === 100;
      });
      if (!ready && timer !== null) { stop(); s.status('Queue finished.'); }
    }
    function add(name) {
      const li = document.createElement('li');
      li.innerHTML = '<b></b> <progress max="100" value="0"></progress> <span></span> <button type="button">Cancel</button>';
      li.querySelector('b').textContent = name;
      const f = {value:0, canceled:false, progress:li.querySelector('progress'), state:li.querySelector('span'), cancel:li.querySelector('button')};
      f.progress.setAttribute('aria-label','Upload progress for ' + name);
      f.cancel.setAttribute('aria-label','Cancel upload of ' + name);
      f.cancel.onclick = () => { f.canceled = true; update(); s.status(name + ' canceled.'); };
      files.push(f); s.find('ul').append(li); update(); s.status(name + ' queued.');
    }
    s.on('input','change', e => { [...e.target.files].forEach(f => add(f.name)); e.target.value = ''; });
    handle(s, 'sample', () => ['field-notes.txt','inventory.csv'].forEach(add));
    handle(s, 'start', () => {
      timer = setInterval(() => {
        if (!s.root.isConnected) { stop(); return; }
        const next = files.find(f => !f.canceled && f.value < 100);
        if (next) next.value = Math.min(100, next.value + 10);
        update();
      }, 400);
      s.status('Simulated upload running.'); update();
    });
    update();
    return stop;
  };
  const prints = [
    ['North ridge','Folded ridgelines under the evening sun.','ridge'],
    ['River bend','A river winds between the foothills.','river'],
    ['Coastal dunes','Sand dunes above the tide line.','dunes']
  ];
  demos['Image gallery with lightbox'] = container => {
    const s = stage(container, '<div class="ws-cards">' + prints.map(([name,,file],i) =>
      '<button class="ws-print" data-open data-index="' + i + '"><img alt="" src="demos/media/' + file + '.png"><span>' + name + '</span></button>').join('') + '</div>' +
      '<dialog class="ws-lightbox" aria-label="Print preview"><img alt=""><p aria-live="polite"></p>' + row(button('Previous','prev') + button('Next','next') + '<form method="dialog"><button>Close preview</button></form>') + '</dialog>');
    let current = 0;
    function show(index) {
      current = (index + prints.length) % prints.length;
      const [name,alt,file] = prints[current], img = s.find('dialog img');
      img.src = 'demos/media/' + file + '.png'; img.alt = alt;
      s.find('dialog p').textContent = name + ' · ' + (current+1) + ' of 3';
    }
    s.all('[data-open]').forEach(b => b.addEventListener('click', () => show(Number(b.dataset.index))));
    dialogEvents(s); handle(s,'prev', () => show(current-1)); handle(s,'next', () => show(current+1));
    s.on('dialog','keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); show(current + (e.key === 'ArrowLeft' ? -1 : 1)); } });
  };
  demos['Media player'] = container => {
    const s = stage(container, block('<b>Field recorder sound check</b><p>Play the four-note chime or seek back to hear the opening note.</p><audio controls preload="metadata" aria-label="Four-note sound check" src="demos/media/sound-check.wav">Your browser cannot play this WAV recording.</audio><details><summary>Audio description</summary><p>Four soft bells rise in pitch, then the sequence repeats.</p></details>'));
    return () => s.find('audio').pause();
  };

  function taskBoard(container, kanban) {
    const columns = kanban ? ['Planned','In progress','Done'] : ['Dispatch order'];
    const tasks = ['Check stock','Print labels','Pack kits'].map((name,i) => ({name, column: kanban && i===2 ? 1 : 0}));
    const s = stage(container,'<div class="' + (kanban ? 'ws-board' : 'ws-stack') + '"></div>' + output);
    const board = s.root.firstElementChild;
    let dragging = null;
    function move(task, column, before, focusAction) {
      if (before === task) return;
      tasks.splice(tasks.indexOf(task),1);
      task.column = column;
      const destination = before ? tasks.indexOf(before) : -1;
      tasks.splice(destination < 0 ? tasks.length : destination, 0, task);
      draw();
      const card = board.querySelector('[data-task="' + tasks.indexOf(task) + '"]');
      const preferred = focusAction && card.querySelector(action(focusAction));
      (preferred && !preferred.disabled ? preferred : card).focus();
      const group = tasks.filter(t => t.column === column);
      s.status(task.name + ' · ' + columns[column] + ' · position ' + (group.indexOf(task)+1) + ' of ' + group.length);
    }
    function draw() {
      board.replaceChildren();
      columns.forEach((name,column) => {
        const lane = document.createElement('div'); lane.className = 'ws-lane';
        lane.innerHTML = '<b>' + name + '</b><ol></ol>'; board.append(lane);
        const group = tasks.filter(t => t.column === column);
        group.forEach((task,i) => {
          const card = document.createElement('li');
          card.className = 'ws-box'; card.draggable = true; card.tabIndex = -1; card.dataset.task = tasks.indexOf(task);
          card.innerHTML = '<strong>' + task.name + '</strong>' + row(button('↑','up') + button('↓','down')) +
            (kanban ? '<label>Column <select aria-label="Column for ' + task.name + '">' + columns.map((v,j) => '<option value="' + j + '"' + (j===column ? ' selected' : '') + '>' + v + '</option>').join('') + '</select></label>' : '');
          lane.querySelector('ol').append(card);
          const up = card.querySelector(action('up')), down = card.querySelector(action('down'));
          up.disabled = i === 0; down.disabled = i === group.length-1;
          up.setAttribute('aria-label','Move ' + task.name + ' up'); down.setAttribute('aria-label','Move ' + task.name + ' down');
          up.onclick = () => move(task,column,group[i-1],'up'); down.onclick = () => move(task,column,group[i+2],'down');
          if (kanban) card.querySelector('select').onchange = e => move(task,Number(e.target.value));
          card.ondragstart = e => { dragging = task; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain',task.name); };
          card.ondragend = () => dragging = null;
          card.ondrop = e => {
            if (!dragging) return;
            e.preventDefault(); e.stopPropagation();
            if (dragging === task) { dragging = null; return; }
            const bounds = card.getBoundingClientRect();
            const before = e.clientY > bounds.top + bounds.height/2 ? group[i+1] : task;
            move(dragging,column,before); dragging = null;
          };
        });
        lane.ondragover = e => { if (dragging) e.preventDefault(); };
        lane.ondrop = e => { if (dragging) { e.preventDefault(); move(dragging,column); dragging = null; } };
      });
    }
    draw();
  }
  demos['Reorderable list'] = c => taskBoard(c,false);
  demos['Kanban board'] = c => taskBoard(c,true);
  demos['Pan and zoom canvas'] = container => {
    const s = stage(container, '<div class="ws-map" tabindex="0" role="group" aria-label="Survey map. Use arrow keys to pan and plus or minus to zoom."><div class="ws-map-sheet"><i class="ws-route"></i><span>North depot</span><span>River station</span><span>Field camp</span></div></div>' +
      row([['←','left'],['↑','up'],['↓','down'],['→','right'],['−','out'],['+','in'],['Reset','reset']].map(([label,a]) => button(label,a)).join('')) + output);
    const map = s.find('.ws-map'), sheet = s.find('.ws-map-sheet');
    let x = 0, y = 0, scale = 1, start = null;
    function paint() {
      x = Math.max(-180*scale, Math.min(180*scale,x)); y = Math.max(-100*scale,Math.min(100*scale,y));
      sheet.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')';
      s.status('Zoom ' + Math.round(scale*100) + '% · Offset ' + Math.round(x) + ', ' + Math.round(y));
    }
    const moves = {left:[-30,0],up:[0,-30],down:[0,30],right:[30,0]};
    function change(a) {
      if (moves[a]) { x += moves[a][0]; y += moves[a][1]; }
      if (a === 'in' || a === 'out') scale = Math.max(0.5, Math.min(3, scale + (a === 'in' ? 0.25 : -0.25)));
      if (a === 'reset') { x = y = 0; scale = 1; }
      paint();
    }
    s.all('button').forEach(b => {
      const a = b.dataset.action;
      b.setAttribute('aria-label',moves[a] ? 'Pan ' + a : a === 'reset' ? 'Reset map' : 'Zoom ' + a);
      b.onclick = () => change(a);
    });
    map.onkeydown = e => {
      const a = {ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down','+':'in','=':'in','-':'out',Home:'reset'}[e.key];
      if (a) { e.preventDefault(); change(a); }
    };
    map.onpointerdown = e => { start = [e.clientX-x,e.clientY-y]; map.setPointerCapture(e.pointerId); };
    map.onpointermove = e => { if (start) { x = e.clientX-start[0]; y = e.clientY-start[1]; paint(); } };
    map.onlostpointercapture = () => start = null;
    paint();
  };
})();
