# Phase 2 UI pattern coverage implementation plan

**Goal.** Help a product engineer take an unfamiliar requirement, find a suitable pattern, experience its behavior, and reuse the pattern’s instruction in their own prompt.

**Architecture and stack.** Extend the existing offline HTML, CSS and JavaScript guide. Use ordinary scripts so opening index.html directly still works. Keep existing entry IDs and hash links. Implementation can follow the executing-plans workflow one family at a time.

**Scope.** This checklist defines completion for common web-product interfaces. Group visual variants when the user makes the same decision; give patterns separate entries when their selection rules, interaction, or analytical purpose changes. Record later specialist requests separately. Entries labeled Phase 1 already have a demo. All boxes start open because even those demos need the Phase 2 learning and usability checks.

## Acceptance rule for every checkbox

Someone unfamiliar with the term can find it using a realistic requirement, see its canonical name and aliases, complete a concrete task with sample data, explain when to choose it over its closest alternative, and copy an instruction that fits their own prompt without editing out details from the demo. Give passive elements a scenario control so learners can trigger the relevant state. Charts must let the learner change or inspect data and read the underlying values without relying on color or hover.

## Writing reusable agent instructions

Write each copyable instruction as a short phrase or sentence that can be appended to any prompt calling for that pattern. Name the pattern and the behavior that defines it. Let the surrounding prompt supply the business purpose, data, labels, styling, and implementation choices. Keep concrete business examples in search terms and demos.

For a searchable combobox, use “Use a searchable combobox so the user can type to filter the options and select one.” Check it by appending that exact sentence to both “Let me assign a reviewer” and “Let me choose a destination airport.” It should make sense in both without edits or placeholders. Apply this two-context check to every entry, including the 12 existing instructions.

## Delivery sequence

1. **Preserve the baseline and ship one complete example.** In catalog.js replace positional arrays with named fields for id, name, family, aliases, needs, guidance, instruction and related IDs. In app.js adapt search and rendering together. Register demos explicitly by ID so a missing demo cannot render the fallback funnel. Start with native select beside the existing combobox. Verify all 12 old hashes still open their original demos directly from disk, and a query about finding a customer by email still returns the combobox.
2. **Ship common product workflows.** Deliver families 1–4 below, one independently usable family at a time. For each family add entries to catalog.js, put demo renderers in a classic script under demos/, and load it in index.html. Scope each renderer to its supplied container so two demos can coexist. Use style.css for shared states and focus indicators. Complete each family's example task before moving on.
3. **Ship application states and richer interactions.** Deliver families 5–10 using the same contract. Check focus return after dismissing overlays, state reset when reopening demos, keyboard alternatives for dragging, and cancellation of simulated uploads when leaving the demo. Keep file handling local.
4. **Ship charts and diagrams.** Deliver families 11–12 with small, labeled datasets. Use the same data where it makes a comparison meaningful. Check that changing the dataset updates marks, labels and the accessible values together. Include a zero-value or empty dataset case.
5. **Teach the choice.** In app.js add a compare action using related IDs. Start with select/combobox, checkbox/switch, tooltip/popover/dialog, table/grid, histogram/bar and tree/network. Show the same requirement alongside both demos and name the condition that changes the choice. Stack demos at narrow widths. Verify each demo responds independently, including keyboard focus.
6. **Evaluate discovery and close coverage.** Add tests/search-cases.json with at least two independently worded business queries per family and acceptable result IDs. Use a Node test in tests/catalog.test.js to check IDs, related links, demo coverage and rankings. Proposed release target: every canonical name ranks first and at least 90% of held-out queries return an acceptable entry in the top three. Inspect misses before adding aliases or considering semantic search. Run node --test plus a browser walkthrough on narrow and wide screens, by keyboard and pointer. Check boxes only after the acceptance rule passes; publish the verified count in README.md.

## Coverage checklist

### 1. Actions

Try: Save a draft, navigate to its author, or choose a secondary save action.

- [ ] Button (primary, secondary, destructive, icon-only)
- [ ] Link
- [ ] Toggle button
- [ ] Split button
- [ ] Action menu
- [ ] Toolbar
- [ ] Application menubar

### 2. Inputs and selection

Try: Assign multiple reviewers and remove one without clearing the others.

- [ ] Text field
- [ ] Text area
- [ ] Number input
- [ ] Native select
- [ ] Searchable combobox (Phase 1)
- [ ] Radio group (Phase 1)
- [ ] Checkbox group (Phase 1)
- [ ] Switch (Phase 1)
- [ ] Slider (Phase 1)
- [ ] Multi-select with removable tokens
- [ ] Date picker
- [ ] Date range picker
- [ ] Color picker
- [ ] Listbox
- [ ] Two-thumb range slider
- [ ] Time picker
- [ ] Password input with reveal control
- [ ] Segmented control (content switcher)

### 3. Forms and validation

Try: Submit an incomplete form, follow its error summary, correct a field and submit successfully.

- [ ] Inline validation
- [ ] Error summary
- [ ] Field group with conditional fields
- [ ] Multi-step form
- [ ] Unsaved changes prompt
- [ ] Masked input
- [ ] Character counter

### 4. Navigation and search

Try: Find an overdue invoice, narrow by owner, then clear one filter.

- [ ] Tabs (Phase 1)
- [ ] Breadcrumbs
- [ ] Sidebar navigation
- [ ] Pagination
- [ ] Load more
- [ ] Infinite scroll
- [ ] Search box
- [ ] Faceted filters
- [ ] Command palette
- [ ] Skip link
- [ ] In-page navigation (table of contents)
- [ ] Language selector

### 5. Layout and disclosure

Try: Inspect a record while retaining your position in the list.

- [ ] Accordion (Phase 1)
- [ ] Single disclosure
- [ ] Card grid
- [ ] List-detail view
- [ ] Resizable split pane
- [ ] Carousel
- [ ] Page landmarks and application shell (header, main, footer)

### 6. Overlays and contextual help

Try: Explain an icon on focus, edit a setting in a popover, or confirm a destructive action in a dialog.

- [ ] Tooltip
- [ ] Popover
- [ ] Confirmation dialog (Phase 1)
- [ ] Drawer
- [ ] Context menu
- [ ] Modal form dialog
- [ ] Cookie consent banner

### 7. Feedback and status

Try: Simulate a failed request and retry it; distinguish unknown duration from measurable progress.

- [ ] Progress bar (Phase 1)
- [ ] Spinner
- [ ] Skeleton
- [ ] Toast
- [ ] Inline alert
- [ ] Status badge
- [ ] Empty state
- [ ] Error state with retry
- [ ] Meter (bounded measurement)
- [ ] Step indicator
- [ ] Site-wide notification banner

### 8. Data display and editing

Try: Sort invoices by balance, select two, and apply an action to both.

- [ ] Data table
- [ ] Sortable table
- [ ] Editable data grid
- [ ] Tree view
- [ ] Timeline
- [ ] Inline edit
- [ ] Bulk selection and actions
- [ ] Treegrid (expandable rows with columns)
- [ ] Summary list (key–value review)
- [ ] Task list with completion states
- [ ] Copyable code snippet

### 9. Files and media

Try: Queue two local files, cancel one, and inspect the other. Use bundled media for playback.

- [ ] File picker
- [ ] File drop zone
- [ ] Upload queue
- [ ] Image gallery with lightbox
- [ ] Media player

### 10. Direct manipulation

Try: Move a task within a column and across columns using pointer or keyboard.

- [ ] Reorderable list
- [ ] Kanban board
- [ ] Pan and zoom canvas

### 11. Charts

Try: Explore how delivery times are distributed, then check whether distance correlates with delay.

- [ ] Bar chart (Phase 1)
- [ ] Line chart (Phase 1)
- [ ] Funnel chart (Phase 1)
- [ ] Stacked bar chart
- [ ] Area chart
- [ ] Pie and donut chart
- [ ] Histogram
- [ ] Scatter plot
- [ ] Box plot
- [ ] Heatmap
- [ ] Waterfall chart
- [ ] Grouped bar chart
- [ ] Bullet chart
- [ ] Bubble chart
- [ ] Sparkline
- [ ] Combination chart
- [ ] Treemap

### 12. Diagrams and spatial data

Try: Select a service to see its dependencies, then trace the direction and volume of traffic between services.

- [ ] Network graph
- [ ] Tree diagram
- [ ] Flowchart
- [ ] Sankey diagram
- [ ] Gantt chart
- [ ] Choropleth map
- [ ] Proportional symbol map


## Coverage audit

The selection above prioritizes distinct decisions a product engineer can demonstrate. For selection and keyboard interaction, compare listbox/combobox, toolbar/menubar and tree/treegrid. Teach an indeterminate checkbox inside the checkbox group and a spinbutton inside the number input. Include a feed example under infinite scroll, with keyboard navigation between articles. [W3C ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/)

For forms and navigation, demonstrate input prefixes and suffixes within the text and number fields. In the multi-step form, link to the step indicator so learners can distinguish the workflow from the element showing their position. [USWDS components](https://designsystem.digital.gov/components/overview/)

Use the task list to teach work that can be resumed in any order, and the summary list to teach reviewing labeled values. A keyboard-only skip-link demo should move focus past repeated navigation into the main content. [GOV.UK components](https://design-system.service.gov.uk/components/)

Compare the segmented control with tabs using alternate presentations of one dataset. Demonstrate a click-triggered help tip within the popover entry and make “toggletip” a search alias for that example. [IBM Carbon components](https://www.carbondesignsystem.com/building-blocks/core/components/overview/components)

Compare grouped versus stacked bars, a bullet chart versus a meter, and a treemap versus a tree diagram. Use a proportional symbol map to encode magnitude at locations and a choropleth to encode a regional rate. Keep specialist candidates such as radar charts, circle packing and parallel coordinates in the backlog until there is a learning scenario for them. [IBM Carbon visualization catalog](https://www.carbondesignsystem.com/building-blocks/data-visualization/overview)
