/**
 * remark-sidenotes
 *
 * Converts standard Markdown / GFM footnotes into Edward Tufte's sidenote
 * markup (numbered notes that float into the right margin), so posts can be
 * authored in plain Markdown and still get authentic marginalia.
 *
 *   Some claim.[^1]
 *
 *   [^1]: The supporting note, shown in the margin.
 *
 * Footnotes whose identifier begins with "mn" render as *unnumbered* margin
 * notes (Tufte's `.marginnote`) instead of numbered sidenotes:
 *
 *   A passing remark.[^mn-aside]
 *
 *   [^mn-aside]: This sits in the margin with no number.
 *
 * The emitted markup matches tufte-css: a `<label>`/`<input type=checkbox>`
 * pair drives the inline toggle on narrow screens, and a `<span>` carries the
 * note. CSS counters handle numbering, so no number is computed here.
 */
export default function remarkSidenotes() {
  const visit = (node, parent, index, callback) => {
    if (!node || typeof node !== 'object') return;
    callback(node, parent, index);
    if (Array.isArray(node.children)) {
      // Iterate over a copy because callbacks may splice the array.
      const children = node.children.slice();
      for (let i = 0; i < children.length; i += 1) {
        visit(children[i], node, i, callback);
      }
    }
  };

  const isMarginNote = (identifier) => /^mn/i.test(identifier || '');

  const makeLabel = (htmlFor, marginNote) => ({
    type: 'sidenoteLabel',
    data: {
      hName: 'label',
      hProperties: {
        htmlFor,
        className: marginNote ? ['margin-toggle'] : ['margin-toggle', 'sidenote-number'],
      },
      // Margin notes need a visible toggle glyph (⊕) for narrow screens;
      // numbered sidenotes use the auto-generated counter instead.
      hChildren: marginNote ? [{ type: 'text', value: '⊕' }] : [],
    },
    children: [],
  });

  const makeToggle = (id) => ({
    type: 'sidenoteToggle',
    data: {
      hName: 'input',
      hProperties: { type: 'checkbox', id, className: ['margin-toggle'] },
      hChildren: [],
    },
    children: [],
  });

  const makeBody = (children, marginNote) => ({
    type: 'sidenoteBody',
    data: {
      hName: 'span',
      hProperties: { className: [marginNote ? 'marginnote' : 'sidenote'] },
    },
    children,
  });

  return (tree) => {
    // 1. Collect footnote definitions, then strip them from the tree.
    const definitions = new Map();

    const collectFrom = (node) => {
      if (!Array.isArray(node.children)) return;
      const kept = [];
      for (const child of node.children) {
        if (child.type === 'footnoteDefinition') {
          const inline = [];
          for (const block of child.children || []) {
            if (Array.isArray(block.children)) {
              if (inline.length) inline.push({ type: 'text', value: ' ' });
              inline.push(...block.children);
            }
          }
          definitions.set(child.identifier, inline);
        } else {
          collectFrom(child);
          kept.push(child);
        }
      }
      node.children = kept;
    };
    collectFrom(tree);

    // 2. Replace footnote references with Tufte sidenote/marginnote markup.
    let counter = 0;

    visit(tree, null, 0, (node) => {
      if (!Array.isArray(node.children)) return;
      const next = [];
      for (const child of node.children) {
        if (child.type !== 'footnoteReference') {
          next.push(child);
          continue;
        }
        const body = definitions.get(child.identifier);
        if (!body) {
          // No matching definition — leave the reference untouched.
          next.push(child);
          continue;
        }
        counter += 1;
        const marginNote = isMarginNote(child.identifier);
        const id = `${marginNote ? 'mn' : 'sn'}-${counter}`;
        next.push(
          makeLabel(id, marginNote),
          makeToggle(id),
          makeBody(body, marginNote),
        );
      }
      node.children = next;
    });
  };
}
