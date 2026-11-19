// Each mount owns its controls, live region, generated IDs, and event handlers.
(() => {
  let instance = 0;
  function register(name, render) {
    demos[name] = container => {
      const prefix = 'control-' + ++instance + '-';
      container.classList.add('control-demo');
      const one = selector => container.querySelector(selector);
      const all = selector => [...container.querySelectorAll(selector)];
      const html = markup => { container.innerHTML = markup.replaceAll('ID_', prefix); };
      const say = value => { one('output').textContent = value; };
      render({container, one, all, html, say, prefix});
    };
  }
  const status = '<output aria-live="polite"></output>';
  const action = (label, extra = '') => '<button type="button" ' + extra + '>' + label + '</button>';
  function rove(buttons, select = () => {}) {
    buttons.forEach((button, i) => {
      button.tabIndex = i ? -1 : 0;
      button.addEventListener('focus', () => {
        buttons.forEach(b => { b.tabIndex = b === button ? 0 : -1; });
        select(button);
      });
      button.addEventListener('keydown', e => {
        const index = {ArrowLeft: (i + buttons.length - 1) % buttons.length, ArrowRight: (i + 1) % buttons.length, Home: 0, End: buttons.length - 1}[e.key];
        if (index !== undefined) { e.preventDefault(); buttons[index].focus(); }
      });
    });
  }

  register('Button', ({html, all, say}) => {
    html('<p>Draft · Field notes</p><div class="cd-row">' + action('Save draft', 'class="cd-primary"') + action('Preview') + action('Discard', 'class="cd-danger"') + action('⎙', 'aria-label="Print preview" title="Print preview"') + '</div>' + status);
    const buttons = all('button'), title = all('p')[0];
    buttons[0].onclick = () => { title.textContent = 'Saved · Field notes'; say('Draft saved.'); };
    buttons[1].onclick = () => say('Preview · Interviews begin on Monday. Three participant slots remain.');
    buttons[2].onclick = () => {
      const discarded = buttons[2].textContent === 'Discard';
      title.textContent = discarded ? 'Discarded · Field notes' : 'Draft · Field notes';
      buttons[2].textContent = discarded ? 'Restore draft' : 'Discard';
      [buttons[0], buttons[1], buttons[3]].forEach(button => { button.disabled = discarded; });
      say(discarded ? 'Draft moved to trash.' : 'Draft restored.');
    };
    buttons[3].onclick = () => say('Print preview · Page 1 of 1 · Field notes · Interviews begin on Monday. Three participant slots remain.');
  });
  register('Link', ({html, one}) => {
    html('<p>Field notes by <a href="#ID_author">Maya Roy</a></p><div id="ID_author" tabindex="-1" hidden><b>Maya Roy</b><p>Editor · Research team</p></div>');
    one('a').onclick = e => { e.preventDefault(); const bio = one('[tabindex]'); bio.hidden = false; bio.focus(); };
  });
  register('Toggle button', ({html, one, say}) => {
    html(action('Bookmark field notes', 'aria-pressed="false"') + status);
    one('button').onclick = e => {
      const next = e.currentTarget.getAttribute('aria-pressed') === 'false';
      e.currentTarget.setAttribute('aria-pressed', next);
      say(next ? 'Field notes added to bookmarks.' : 'Field notes removed from bookmarks.');
    };
  });

  function menuDemo(name, groups, primary) {
    register(name, ({container, html, all, one, say}) => {
      const bar = groups.length > 1;
      html('<p data-document>Field notes · Draft</p><div class="cd-row" ' + (bar ? 'role="menubar" aria-label="Document commands"' : '') + '>' +
        (primary ? action(primary, 'class="cd-primary" data-primary') : '') +
        groups.map(([label], i) => action(label, (bar ? 'role="menuitem" ' : '') + 'id="ID_trigger' + i + '" aria-expanded="false" aria-haspopup="menu" aria-controls="ID_menu' + i + '" data-trigger')).join('') + '</div>' +
        groups.map(([, items], i) => '<div class="cd-menu" role="menu" id="ID_menu' + i + '" aria-labelledby="ID_trigger' + i + '" hidden>' + items.map(item => action(item, 'tabindex="-1" role="menuitem"')).join('') + '</div>').join('') + status);
      const triggers = all('[data-trigger]'), menus = all('[role="menu"]');
      function close() {
        menus.forEach(menu => { menu.hidden = true; });
        triggers.forEach(b => b.setAttribute('aria-expanded', 'false'));
      }
      function open(i, end = false) {
        close();
        menus[i].hidden = false;
        triggers[i].setAttribute('aria-expanded', 'true');
        const items = menus[i].children;
        items[end ? items.length - 1 : 0].focus();
      }
      const preview = one('[data-document]'); let zoom = 100, copies = 0;
      const history = [preview.textContent]; let revision = 0;
      function run(command) {
        if (command === 'Zoom in' || command === 'Zoom out') {
          zoom = Math.max(70, Math.min(160, zoom + (command === 'Zoom in' ? 10 : -10)));
          preview.style.fontSize = zoom + '%'; say('Document zoom · ' + zoom + '%'); return;
        }
        if (command === 'Undo' || command === 'Redo') {
          const next = revision + (command === 'Undo' ? -1 : 1);
          if (next < 0 || next >= history.length) { say('No changes to ' + command.toLowerCase() + '.'); return; }
          revision = next; preview.textContent = history[revision]; say(command + ' complete.'); return;
        }
        let result;
        if (command === 'Duplicate' || command === 'Save a copy') result = 'Field notes · Copy ' + ++copies;
        else result = ({Archive:'Field notes · Archived', Export:'Field notes · Export preview ready', 'Save as template':'Field notes · Reusable template', Save:'Field notes · Saved'})[command];
        history.splice(revision + 1); history.push(result); revision++;
        preview.textContent = result; say(command === 'Export' ? 'Export preview · field-notes.txt · Plain text document.' : result);
      }
      if (bar) rove(triggers);
      if (primary) one('[data-primary]').onclick = () => { close(); run('Save'); };
      triggers.forEach((button, i) => {
        button.onclick = () => menus[i].hidden ? open(i) : close();
        button.onkeydown = e => {
          if (['ArrowDown','ArrowUp'].includes(e.key)) { e.preventDefault(); open(i, e.key === 'ArrowUp'); }
        };
        const items = [...menus[i].children];
        items.forEach((item, j) => {
          item.onclick = () => { close(); run(item.textContent); button.focus(); };
          item.onkeydown = e => {
            const next = {ArrowDown: (j + 1) % items.length, ArrowUp: (j + items.length - 1) % items.length, Home: 0, End: items.length - 1}[e.key];
            if (next !== undefined) { e.preventDefault(); items[next].focus(); }
            else if (e.key === 'Escape') { e.preventDefault(); close(); button.focus(); }
            else if (bar && ['ArrowLeft','ArrowRight'].includes(e.key)) {
              e.preventDefault();
              const group = (i + (e.key === 'ArrowRight' ? 1 : -1) + groups.length) % groups.length;
              triggers[group].focus(); open(group);
            }
          };
        });
      });
      container.addEventListener('focusout', e => { if (!container.contains(e.relatedTarget)) close(); });
    });
  }
  menuDemo('Split button', [['More save options ▾', ['Save a copy', 'Save as template']]], 'Save draft');
  menuDemo('Action menu', [['Document actions ▾', ['Duplicate', 'Archive', 'Export']]], '');
  menuDemo('Application menubar', [['File', ['Save', 'Export']], ['Edit', ['Undo', 'Redo']], ['View', ['Zoom in', 'Zoom out']]], '');

  register('Toolbar', ({html, all, one}) => {
    const styles = ['bold', 'italic', 'underline'];
    html('<div class="cd-row" role="toolbar" aria-label="Text formatting">' + styles.map(s => action(s[0].toUpperCase() + s.slice(1), 'aria-pressed="false"')).join('') + '</div><p class="cd-preview">Quarterly field notes</p>');
    const buttons = all('button');
    rove(buttons);
    buttons.forEach((b, i) => { b.onclick = () => { const active = one('p').classList.toggle('cd-' + styles[i]); b.setAttribute('aria-pressed', active); }; });
  });
  register('Text field', ({html, one, say}) => {
    html('<label for="ID_slug">Workspace address</label><div class="cd-row"><span id="ID_prefix">team.example/</span><input id="ID_slug" aria-describedby="ID_prefix" placeholder="field-notes"></div>' + status);
    one('input').oninput = e => say('Address preview · team.example/' + e.target.value);
  });
  register('Text area', ({html, one, say}) => {
    html('<label for="ID_notes">Handoff notes</label><textarea id="ID_notes" rows="3">Confirm the delivery address.</textarea>' + action('Save notes') + status);
    one('button').onclick = () => say('Saved notes · ' + (one('textarea').value || '(empty)'));
  });
  register('Number input', ({html, one, say}) => {
    html('<label for="ID_weight">Parcel weight</label><div class="cd-row"><input type="number" id="ID_weight" value="2" min="0.5" max="30" step="0.5" aria-describedby="ID_unit"><span id="ID_unit">kg</span></div>' + status);
    const input = one('input');
    input.oninput = () => say(input.value && input.validity.valid ? 'Shipping estimate · $' + (input.valueAsNumber * 3).toFixed(2) : 'Enter 0.5–30 kg in half-kilogram increments.');
    input.oninput();
  });
  const people = ['Maya Roy · maya@acme.test', 'Sam Cole · sam@orbit.test', 'Lee Kim · lee@acme.test'];
  register('Native select', ({html, one, say}) => {
    html('<label for="ID_person">Customer</label><select id="ID_person"><option value="">Choose a customer</option>' + people.map(p => '<option>' + p + '</option>').join('') + '</select>' + status);
    one('select').onchange = e => say(e.target.value ? 'Selected ' + e.target.value : 'Choose a customer.');
  });
  register('Searchable combobox', ({html, one, all, say, prefix}) => {
    html('<label for="ID_customer">Customer</label><input id="ID_customer" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="ID_choices" autocomplete="off" placeholder="Type a name or email"><ul class="options" id="ID_choices" role="listbox" aria-label="Customers" hidden></ul>' + status);
    const input = one('input'), list = one('ul');
    let matches = [], position = -1, selected = '';
    function close() { list.hidden = true; position = -1; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); }
    function paint() {
      list.innerHTML = matches.map((p, i) => '<li role="option" id="' + prefix + 'opt' + i + '" aria-selected="' + (i === position) + '">' + p + '</li>').join('');
      list.hidden = !matches.length;
      input.setAttribute('aria-expanded', String(!!matches.length));
      if (position >= 0) input.setAttribute('aria-activedescendant', prefix + 'opt' + position);
      else input.removeAttribute('aria-activedescendant');
    }
    function filter() {
      matches = people.filter(p => input.value === selected || p.toLowerCase().includes(input.value.toLowerCase()));
      position = -1; paint(); say(matches.length ? matches.length + ' customers available.' : 'No customers match.');
    }
    function choose(i) { input.value = selected = matches[i]; close(); say('Selected ' + selected); }
    input.onfocus = input.oninput = filter;
    input.onblur = () => { input.value = selected; close(); };
    input.onkeydown = e => {
      if (['ArrowDown','ArrowUp'].includes(e.key)) {
        e.preventDefault(); if (list.hidden) filter();
        if (matches.length) { position = e.key === 'ArrowDown' ? (position + 1) % matches.length : (position <= 0 ? matches.length - 1 : position - 1); paint(); }
      } else if (e.key === 'Enter' && position >= 0) { e.preventDefault(); choose(position); }
      else if (e.key === 'Escape') { input.value = selected; close(); }
    };
    list.onpointerdown = e => { if (e.target.closest('[role=option]')) e.preventDefault(); };
    list.onclick = e => { const i = all('[role=option]').indexOf(e.target.closest('[role=option]')); if (i >= 0) choose(i); };
    say('Try Maya, Sam, or Lee.');
  });
  register('Radio group', ({html, all, say}) => {
    html('<fieldset><legend>Delivery speed</legend>' + ['Standard','Express','Next day'].map((v,i) => '<label><input type="radio" name="ID_delivery" ' + (i ? '' : 'checked') + '> ' + v + '</label>').join('') + '</fieldset>' + status);
    all('input').forEach((r,i) => { r.onchange = () => say(['Arrives in 5 business days.','Arrives in 2 business days.','Arrives tomorrow.'][i]); });
    all('input')[0].onchange();
  });
  register('Checkbox group', ({html, one, all, say}) => {
    html('<fieldset><legend>Notification topics</legend><label><input data-master type="checkbox"> All topics</label>' + ['Orders','Inventory','Billing'].map((v,i) => '<label><input data-topic type="checkbox" value="' + v + '" ' + (i ? '' : 'checked') + '> ' + v + '</label>').join('') + '</fieldset>' + status);
    const master = one('[data-master]'), topics = all('[data-topic]');
    function sync() {
      const selected = topics.filter(t => t.checked);
      master.indeterminate = selected.length > 0 && selected.length < topics.length;
      master.checked = selected.length === topics.length;
      say('Selected · ' + (selected.map(t => t.value).join(', ') || 'None'));
    }
    master.onchange = () => { topics.forEach(t => { t.checked = master.checked; }); sync(); };
    topics.forEach(t => { t.onchange = sync; }); sync();
  });
  register('Switch', ({html, one, say}) => {
    html('<label><input type="checkbox" role="switch"> Email alerts</label>' + status);
    one('input').onchange = e => say(e.target.checked ? 'On · Alerts will arrive by email.' : 'Off · Email alerts paused.');
    say('Off · Email alerts paused.');
  });
  register('Slider', ({html, one, say}) => {
    html('<label for="ID_budget">Maximum budget</label><input type="range" id="ID_budget" min="0" max="500" step="10" value="250">' + status);
    const input = one('input'); input.oninput = () => { input.setAttribute('aria-valuetext', '$' + input.value); say('$' + input.value); }; input.oninput();
  });
  register('Multi-select with removable tokens', ({html, one, say}) => {
    html('<label for="ID_reviewer">Add a reviewer</label><select id="ID_reviewer"><option value="">Choose a reviewer</option>' + people.map(p => '<option>' + p.split(' · ')[0] + '</option>').join('') + '</select><div class="cd-row cd-tokens" aria-label="Assigned reviewers"></div>' + status);
    const select = one('select'), tokens = one('.cd-tokens');
    function add(option) {
      const name = option.textContent;
      option.disabled = true; select.selectedIndex = 0;
      const token = tokens.ownerDocument.createElement('button'); token.type = 'button'; token.textContent = name + ' ×'; token.setAttribute('aria-label', 'Remove ' + name);
      token.onclick = () => { option.disabled = false; token.remove(); select.focus(); say(name + ' removed.'); };
      tokens.append(token); say(name + ' assigned.');
    }
    select.onchange = () => { if (select.value) add(select.selectedOptions[0]); };
    add(select.options[1]);
  });
  register('Date picker', ({html, one, say}) => {
    html('<label for="ID_due">Review due date</label><input id="ID_due" type="date" value="2026-11-24">' + status);
    const input = one('input'); input.oninput = () => say(input.value ? 'Review due · ' + input.value : 'No due date.'); input.oninput();
  });
  register('Date range picker', ({html, all, say}) => {
    html('<fieldset><legend>Reporting period</legend><label>Start <input type="date" value="2026-11-01"></label><label>End <input type="date" value="2026-11-07"></label></fieldset>' + status);
    const [start, end] = all('input');
    function sync() {
      end.min = start.value;
      const valid = end.validity.valid; end.setAttribute('aria-invalid', String(!valid));
      if (!start.value || !end.value) say('Choose both dates.');
      else if (!valid) say('End date must be on or after the start date.');
      else say('Report covers ' + ((end.valueAsNumber - start.valueAsNumber) / 86400000 + 1) + ' calendar days.');
    }
    start.oninput = end.oninput = sync; sync();
  });
  register('Color picker', ({html, one, say}) => {
    html('<label for="ID_color">Calendar color</label><input id="ID_color" type="color" value="#497747"><p class="cd-sample">Team calendar</p>' + status);
    const input = one('input'); input.oninput = () => { one('p').style.borderColor = input.value; say('Selected color · ' + input.value.toUpperCase()); }; input.oninput();
  });
  register('Listbox', ({html, one, say}) => {
    html('<label for="ID_assignee">Review owner</label><select size="3" id="ID_assignee">' + people.map((p,i) => '<option ' + (i ? '' : 'selected') + '>' + p + '</option>').join('') + '</select>' + status);
    const select = one('select'); select.onchange = () => say('Assigned to ' + select.value); select.onchange();
  });
  register('Two-thumb range slider', ({html, all, one, say}) => {
    html('<fieldset><legend>Nightly price range</legend><div class="cd-dual"><span aria-hidden="true"></span><input aria-label="Minimum nightly price" type="range" min="0" max="500" step="10" value="100"><input aria-label="Maximum nightly price" type="range" min="0" max="500" step="10" value="400"></div></fieldset>' + status);
    const [low, high] = all('input');
    function update(e) {
      if (+low.value > +high.value) { if (e.target === low) low.value = high.value; else high.value = low.value; }
      low.setAttribute('aria-valuemax', high.value); high.setAttribute('aria-valuemin', low.value);
      [low, high].forEach(b => b.setAttribute('aria-valuetext', '$' + b.value));
      const track = one('.cd-dual'); track.style.setProperty('--low', low.value / 5 + '%'); track.style.setProperty('--high', high.value / 5 + '%');
      low.style.zIndex = +high.value === 500 && low.value === high.value ? 3 : 1;
      say('$' + low.value + ' – $' + high.value + ' per night');
    }
    low.oninput = high.oninput = update; update();
  });
  register('Time picker', ({html, one, say}) => {
    html('<label for="ID_time">Daily digest time</label><input type="time" id="ID_time" value="09:30">' + status);
    const input = one('input'); input.oninput = () => say(input.value ? 'Digest scheduled for ' + input.value + ' local time.' : 'Choose a time.'); input.oninput();
  });
  register('Password input with reveal control', ({html, one}) => {
    html('<label for="ID_pass">Sample password</label><div class="cd-row"><input id="ID_pass" type="password" value="field-notes" autocomplete="off">' + action('Show password', 'aria-controls="ID_pass"') + '</div>');
    const input = one('input'), trigger = one('button');
    trigger.onclick = () => { const reveal = input.type === 'password'; input.type = reveal ? 'text' : 'password'; trigger.textContent = reveal ? 'Hide password' : 'Show password'; };
  });
  register('Segmented control', ({html, one, all}) => {
    html('<fieldset class="cd-segments"><legend>Reviewers view</legend>' + ['List','Cards'].map((v,i) => '<label><input type="radio" name="ID_view" ' + (i ? '' : 'checked') + '><span>' + v + '</span></label>').join('') + '</fieldset><ul class="cd-people">' + people.map(p => '<li>' + p.replace(' · ', '<br>') + '</li>').join('') + '</ul>');
    all('input').forEach((radio,i) => { radio.onchange = () => one('ul').classList.toggle('cd-cards', i === 1); });
  });

  register('Inline validation', ({html, one, say}) => {
    html('<form novalidate><label for="ID_email">Reviewer email</label><input type="email" id="ID_email" required aria-describedby="ID_hint" placeholder="maya@example.com"><p id="ID_hint"></p><button>Invite reviewer</button></form>' + status);
    const input = one('input'); let checked = false;
    function validate() {
      const good = input.validity.valid;
      input.setAttribute('aria-invalid', String(!good));
      one('#' + input.getAttribute('aria-describedby')).textContent = good ? '' : 'Enter an email address, such as maya@example.com.';
      return good;
    }
    input.onblur = () => { checked = true; validate(); };
    input.oninput = () => { say(''); if (checked) validate(); };
    one('form').onsubmit = e => { e.preventDefault(); checked = true; if (validate()) say('Invitation ready for ' + input.value); else input.focus(); };
  });
  register('Error summary', ({html, all, one, say}) => {
    html('<form novalidate><div class="cd-errors" tabindex="-1" hidden><b>Check the following fields</b><ul></ul></div><label>Name <input id="ID_name" required></label><label>Email <input type="email" id="ID_email" required></label><button>Submit contact</button></form>' + status);
    const inputs = all('input'), summary = one('.cd-errors'), messages = ['Enter a contact name.', 'Enter a valid email address.'];
    function check() {
      const invalid = inputs.filter(i => !i.validity.valid);
      inputs.forEach(i => i.setAttribute('aria-invalid', String(invalid.includes(i))));
      summary.hidden = !invalid.length;
      one('ul').innerHTML = invalid.map(i => '<li><a href="#' + i.id + '">' + messages[inputs.indexOf(i)] + '</a></li>').join('');
      all('a').forEach(a => { a.onclick = e => { e.preventDefault(); one(a.hash).focus(); }; });
      return !invalid.length;
    }
    one('form').onsubmit = e => { e.preventDefault(); if (check()) say('Contact saved.'); else { say(''); summary.focus(); } };
    inputs.forEach(i => { i.oninput = () => { say(''); if (!summary.hidden) check(); }; });
  });
  register('Field group with conditional fields', ({html, all, one, say}) => {
    html('<form><fieldset><legend>Delivery method</legend><label><input type="radio" name="ID_method" checked> Pick up</label><label><input type="radio" name="ID_method"> Ship to address</label><label data-address hidden>Street address <input required disabled></label></fieldset><button>Save delivery</button></form>' + status);
    const address = one('[data-address]'), field = address.querySelector('input'), radios = all('[type=radio]');
    radios.forEach(r => { r.onchange = () => { address.hidden = field.disabled = !radios[1].checked; say(''); }; });
    one('form').onsubmit = e => { e.preventDefault(); say(field.disabled ? 'Pickup selected.' : 'Shipping to ' + field.value); };
  });
  register('Multi-step form', ({html, one, say}) => {
    html('<form><p tabindex="-1" data-step></p><label data-name>Project name <input required></label><label data-owner hidden>Review owner <select>' + people.map(p => '<option>' + p.split(' · ')[0] + '</option>').join('') + '</select></label><p data-review hidden></p><div class="cd-row">' + action('Back', 'data-back hidden') + '<button data-next>Continue</button></div></form>' + status);
    const title = one('[data-step]'), input = one('input'), next = one('[data-next]'), back = one('[data-back]');
    let step = 0;
    function draw() {
      title.textContent = 'Step ' + (step + 1) + ' of 3 · ' + ['Project','Reviewer','Review'][step];
      one('[data-name]').hidden = input.disabled = step !== 0;
      one('[data-owner]').hidden = step !== 1;
      one('[data-review]').hidden = step !== 2;
      one('[data-review]').textContent = input.value + ' · ' + one('select').value;
      back.hidden = !step; next.textContent = step === 2 ? 'Create project' : 'Continue';
    }
    back.onclick = () => { step--; draw(); title.focus(); };
    one('form').onsubmit = e => { e.preventDefault(); if (step < 2) { step++; draw(); title.focus(); } else { one('form').hidden = true; say('Created ' + input.value + ' with ' + one('select').value + ' as reviewer.'); one('output').tabIndex = -1; one('output').focus(); } };
    draw();
  });
  register('Unsaved changes prompt', ({html, one, say}) => {
    html('<label>Draft title <input value="Field notes"></label><div class="cd-row">' + action('Save draft', 'data-save') + action('Leave editor', 'data-leave') + '</div><dialog aria-labelledby="ID_question"><h4 id="ID_question">Discard unsaved changes?</h4><form method="dialog"><button value="keep" autofocus>Keep editing</button> <button value="discard">Discard changes</button></form></dialog>' + status);
    const input = one('input'), dialog = one('dialog'), leave = one('[data-leave]'); let saved = input.value;
    input.oninput = () => say(input.value === saved ? 'All changes saved.' : 'Unsaved changes.');
    one('[data-save]').onclick = () => { saved = input.value; say('All changes saved.'); };
    function exit() { input.disabled = one('[data-save]').disabled = true; leave.textContent = 'Reopen editor'; say('Editor closed.'); }
    leave.onclick = () => {
      if (input.disabled) { input.disabled = one('[data-save]').disabled = false; leave.textContent = 'Leave editor'; input.focus(); say('Editor reopened.'); }
      else if (input.value === saved) exit();
      else { dialog.returnValue = 'keep'; dialog.showModal(); }
    };
    dialog.onclose = () => { if (dialog.returnValue === 'discard') { input.value = saved; exit(); leave.focus(); } else { input.focus(); say('Unsaved changes kept.'); } };
  });
  register('Masked input', ({html, one, say}) => {
    html('<label for="ID_phone">US phone number</label><input id="ID_phone" type="tel" inputmode="tel" placeholder="(555) 123-4567" aria-describedby="ID_example"><p id="ID_example">Enter 10 digits, including the area code.</p>' + status);
    const input = one('input');
    input.oninput = e => {
      const raw = input.value, caret = input.selectionStart, digits = raw.replace(/\D/g, '').slice(0,10);
      const count = raw.slice(0,caret).replace(/\D/g, '').length;
      input.value = digits.length > 6 ? '(' + digits.slice(0,3) + ') ' + digits.slice(3,6) + '-' + digits.slice(6) : digits.length > 3 ? '(' + digits.slice(0,3) + ') ' + digits.slice(3) : digits;
      let pos = 0, seen = 0;
      while (pos < input.value.length && seen < count) { if (/\d/.test(input.value[pos])) seen++; pos++; }
      input.setSelectionRange(pos,pos); say(digits.length === 10 ? 'Phone number complete.' : digits.length + ' of 10 digits');
    };
  });
  register('Character counter', ({html, one, say}) => {
    html('<label for="ID_headline">Announcement headline</label><textarea id="ID_headline" rows="2" maxlength="60" aria-describedby="ID_count">Release notes</textarea><output id="ID_count" aria-live="polite"></output>');
    const input = one('textarea'); input.oninput = () => say((60 - input.value.length) + ' characters remaining'); input.oninput();
  });

  register('Tabs', ({html, all, one}) => {
    const sections = ['Profile', 'Billing'], content = ['Account owner · Maya Roy', 'Current plan · Monthly'];
    html('<div role="tablist" aria-label="Account sections" class="cd-row">' + sections.map((s,i) => action(s, 'role="tab" id="ID_tab' + i + '" aria-controls="ID_panel' + i + '"')).join('') + '</div>' + content.map((c,i) => '<p role="tabpanel" tabindex="0" id="ID_panel' + i + '" aria-labelledby="ID_tab' + i + '">' + c + '</p>').join(''));
    const tabs = all('[role=tab]');
    function select(b) { tabs.forEach(t => { const active = t === b; t.setAttribute('aria-selected', active); one('#' + t.getAttribute('aria-controls')).hidden = !active; }); }
    rove(tabs, select); tabs.forEach(b => { b.onclick = () => select(b); }); select(tabs[0]);
  });
  register('Breadcrumbs', ({html, one, all, prefix}) => {
    const names = ['Workspace', 'Research', 'Field notes'];
    html('<nav aria-label="Breadcrumb" class="cd-crumb"></nav><p data-body></p>');
    function draw(i) {
      one('nav').innerHTML = names.slice(0, i + 1).map((name,j) => j === i ? '<span aria-current="page">' + name + '</span>' : '<a href="#' + prefix + j + '" data-page="' + j + '">' + name + '</a> <span aria-hidden="true">/</span> ').join('');
      const body = one('[data-body]');
      body.innerHTML = i === 2 ? 'Field notes · Research interviews and findings.' : 'Contains <a href="#' + prefix + (i+1) + '" data-page="' + (i+1) + '">' + names[i+1] + '</a>';
      all('a').forEach(a => { a.onclick = e => { e.preventDefault(); draw(Number(a.dataset.page)); body.tabIndex = -1; body.focus(); }; });
    }
    draw(2);
  });
  register('Sidebar navigation', ({html, all, one}) => {
    const pages = ['Inbox','Assigned','Archive'];
    html('<div class="cd-sidebar"><nav aria-label="Mail folders">' + pages.map((p,i) => '<a href="#ID_mail' + i + '">' + p + '</a>').join('') + '</nav><div><strong></strong><p></p></div></div>');
    const links = all('a');
    function show(i) { links.forEach((l,j) => { if (i === j) l.setAttribute('aria-current','page'); else l.removeAttribute('aria-current'); }); one('strong').textContent = pages[i]; one('p').textContent = ['New · Review request from Maya','Assigned to you · Confirm delivery','Archived · April report'][i]; }
    links.forEach((l,i) => { l.onclick = e => { e.preventDefault(); show(i); }; }); show(0);
  });
  const invoices = [
    ['1041','Orbit','Maya','Overdue'], ['1042','Harbor','Lee','Paid'], ['1043','Atlas','Sam','Open'],
    ['1044','Northstar','Lee','Overdue'], ['1045','Meadow','Maya','Open'], ['1046','Acme','Sam','Paid'],
    ['1047','Juniper','Lee','Open'], ['1048','Aurora','Maya','Paid'], ['1049','Vale','Sam','Overdue']
  ];
  const invoiceRow = row => '<li><b>#' + row[0] + ' · ' + row[1] + '</b><span>' + row[2] + ' · ' + row[3] + '</span></li>';
  register('Pagination', ({html, all, one, say}) => {
    html('<ul class="cd-records"></ul><nav aria-label="Invoice pages" class="cd-row">' + [1,2,3].map(p => action(p, 'aria-label="Page ' + p + '"')).join('') + '</nav>' + status);
    const pages = all('button');
    function show(i) {
      pages.forEach((p,j) => { if (j === i) p.setAttribute('aria-current','page'); else p.removeAttribute('aria-current'); });
      one('ul').innerHTML = invoices.slice(i*3,i*3+3).map(invoiceRow).join(''); say('Page ' + (i+1) + ' of 3');
    }
    pages.forEach((p,i) => { p.onclick = () => show(i); }); show(0);
  });
  register('Load more', ({html, one, say}) => {
    html('<ul class="cd-records"></ul>' + action('Load more invoices') + status);
    let count = 0;
    function append() { one('ul').insertAdjacentHTML('beforeend', invoices.slice(count,count+3).map(invoiceRow).join('')); count += 3; one('button').disabled = count === invoices.length; say('Showing ' + count + ' of ' + invoices.length + ' invoices.'); }
    one('button').onclick = append; append();
  });
  register('Infinite scroll', ({html, all, one, say}) => {
    html('<p>Scroll for more activity. Use Page Down or Page Up to move between articles.</p><div role="feed" aria-label="Invoice activity" class="cd-feed"></div>' + status);
    const feed = one('[role=feed]'); let count = 0;
    function append() {
      if (count === invoices.length) return;
      const start = count; count = Math.min(count + 3,invoices.length);
      feed.setAttribute('aria-busy','true');
      invoices.slice(start,count).forEach(([id,client,owner,state],i) => {
        const article = feed.ownerDocument.createElement('article'), pos = start+i+1;
        article.tabIndex = 0; article.setAttribute('aria-posinset',pos); article.setAttribute('aria-setsize',invoices.length); article.setAttribute('aria-label','Invoice ' + id + ' · ' + client);
        article.innerHTML = '<b>#' + id + ' · ' + client + '</b><p>' + owner + ' marked this invoice ' + state.toLowerCase() + '.</p>';
        feed.append(article);
      });
      feed.setAttribute('aria-busy','false'); say(count + ' of ' + invoices.length + ' activity entries loaded.');
    }
    feed.onscroll = () => { if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 16) append(); };
    feed.onkeydown = e => {
      if (!['PageDown','PageUp'].includes(e.key)) return;
      e.preventDefault(); const i = all('article').indexOf(e.target);
      if (e.key === 'PageDown' && i === count-1) append();
      all('article')[Math.max(0,Math.min(count-1,i + (e.key === 'PageDown' ? 1 : -1)))].focus();
    };
    append();
  });
  register('Search box', ({html, one, say}) => {
    html('<label for="ID_search">Search invoices</label><input type="search" id="ID_search" placeholder="Client, number, owner or status">' + status + '<ul class="cd-records"></ul>');
    const input = one('input');
    function search() { const q = input.value.toLowerCase().trim(); const results = invoices.filter(r => r.join(' ').toLowerCase().includes(q)); one('ul').innerHTML = results.map(invoiceRow).join(''); say(results.length + ' matching invoices'); }
    input.oninput = search; search();
  });
  register('Faceted filters', ({html, one, all, say}) => {
    const groups = [['Owner',2,['Maya','Sam','Lee']], ['Status',3,['Overdue','Open','Paid']]];
    html('<div class="cd-facets">' + groups.map(([label,col,values]) => '<fieldset><legend>' + label + '</legend>' + values.map(v => '<label><input type="checkbox" data-col="' + col + '" value="' + v + '"> ' + v + '</label>').join('') + '</fieldset>').join('') + '</div>' + action('Clear filters') + status + '<ul class="cd-records"></ul>');
    const boxes = all('input');
    function filter() {
      const selections = groups.map(([,col]) => boxes.filter(b => b.checked && +b.dataset.col === col).map(b => b.value));
      const results = invoices.filter(r => groups.every(([,col],i) => !selections[i].length || selections[i].includes(r[col])));
      one('ul').innerHTML = results.map(invoiceRow).join(''); say(results.length + ' matching invoices');
    }
    boxes.forEach(b => { b.onchange = filter; }); one('button').onclick = () => { boxes.forEach(b => { b.checked = false; }); filter(); }; filter();
  });
  register('Command palette', ({html, one, say, prefix}) => {
    html(action('Open command palette') + '<dialog aria-labelledby="ID_caption"><h4 id="ID_caption">Run a command</h4><label>Find a command <input autofocus role="combobox" aria-controls="ID_commands" aria-expanded="true" aria-autocomplete="list"></label><ul class="options" id="ID_commands" role="listbox" aria-label="Commands"></ul><p data-empty hidden>No matching commands.</p>' + action('Close') + '</dialog>' + status);
    const dialog = one('dialog'), trigger = one('button'), input = one('input'), list = one('ul');
    const commands = ['Create draft','Open billing','Archive report','Invite reviewer']; let results = commands, pos = 0;
    function paint() {
      list.innerHTML = results.map((v,i) => '<li role="option" id="' + prefix + 'cmd' + i + '" data-i="' + i + '" aria-selected="' + (i === pos) + '">' + v + '</li>').join('');
      if (results.length) input.setAttribute('aria-activedescendant',prefix + 'cmd' + pos); else input.removeAttribute('aria-activedescendant');
      one('[data-empty]').hidden = !!results.length;
    }
    let drafts = 0;
    function choose(i) {
      const command = results[i];
      if (!command) return;
      dialog.close();
      const resultsByCommand = {'Open billing':'Billing · Monthly plan · $24 due December 1.', 'Archive report':'Quarterly report moved to Archive.', 'Invite reviewer':'Invitation draft ready for a reviewer.'};
      say(command === 'Create draft' ? 'Created Untitled draft ' + ++drafts + '.' : resultsByCommand[command]);
    }
    trigger.onclick = () => { input.value = ''; results = commands; pos = 0; paint(); dialog.showModal(); input.focus(); };
    input.oninput = () => { results = commands.filter(v => v.toLowerCase().includes(input.value.toLowerCase())); pos = 0; paint(); };
    input.onkeydown = e => {
      if (['ArrowUp','ArrowDown'].includes(e.key) && results.length) { e.preventDefault(); pos = (pos + (e.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length; paint(); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(pos); }
    };
    list.onclick = e => { const option = e.target.closest('[data-i]'); if (option) choose(+option.dataset.i); };
    one('dialog button').onclick = () => dialog.close(); dialog.onclose = () => trigger.focus();
  });
  register('Skip link', ({html, one, all}) => {
    html('<p>Tab past “Start keyboard demo” to reveal the skip link, then press Enter.</p>' + action('Start keyboard demo') + '<a class="cd-skip" href="#ID_main">Skip to invoice details</a><nav aria-label="Account navigation">' + ['Overview','Activity','Invoices'].map(s => '<a href="#ID_main">' + s + '</a>').join('') + '</nav><div id="ID_main" role="region" aria-label="Invoice details" tabindex="-1"><b>Invoice details</b><p>#1041 · Orbit · Overdue</p></div>');
    const target = one('[role=region]');
    one('button').onclick = () => one('.cd-skip').focus();
    all('a').forEach(a => { a.onclick = e => { e.preventDefault(); target.focus(); target.querySelector('b').textContent = a.classList.contains('cd-skip') ? 'Invoice details' : a.textContent; target.querySelector('p').textContent = ({Overview:'Account · Orbit',Activity:'Latest event · Invoice issued'})[a.textContent] || '#1041 · Orbit · Overdue'; }; });
  });
  register('In-page navigation', ({html, one, all}) => {
    const sections = [['Overview','The review starts when a draft is ready.'],['Requirements','Include the owner, due date, and supporting notes.'],['Approval','A reviewer signs off before publication.']];
    html('<nav aria-label="On this page">' + sections.map(([s],i) => '<a href="#ID_part' + i + '">' + s + '</a>').join('') + '</nav><div class="cd-guide">' + sections.map(([s,body],i) => '<div><h4 id="ID_part' + i + '" tabindex="-1">' + s + '</h4><p>' + body + '</p></div>').join('') + '</div>');
    all('a').forEach(a => { a.onclick = e => { e.preventDefault(); const target = one(a.hash), guide = one('.cd-guide'); target.focus({preventScroll:true}); guide.scrollTop += target.getBoundingClientRect().top - guide.getBoundingClientRect().top; }; });
  });
  register('Language selector', ({html, one}) => {
    html('<label for="ID_lang">Language</label><select id="ID_lang"><option value="en" lang="en">English</option><option value="es" lang="es">Español</option><option value="fr" lang="fr">Français</option></select><p aria-live="polite"></p>');
    const select = one('select'), preview = one('p');
    select.onchange = () => { preview.lang = select.value; preview.textContent = {en:'Your next invoice is ready.',es:'Tu próxima factura está lista.',fr:'Votre prochaine facture est prête.'}[select.value]; }; select.onchange();
  });
})();
