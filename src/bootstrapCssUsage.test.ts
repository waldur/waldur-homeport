// @vitest-environment node
import postcss from 'postcss';
import { describe, expect, it } from 'vitest';

import {
  compilePartial,
  diffSelectors,
  extractClasses,
  extractSelectors,
  findNewUnusedClasses,
  isClassAllowed,
  tokenizeContent,
} from '../scripts/bootstrap-css-usage.mjs';

describe('bootstrapCssUsage', () => {
  describe('tokenizeContent', () => {
    it('extracts tokens from JSX/HTML source', () => {
      const code = `
        import { Button } from 'react-bootstrap';
        export const MyComp = () => (
          <div className="card text-center d-flex p-3">
            <span className="badge badge-light">Hello</span>
          </div>
        );
      `;
      const tokens = tokenizeContent(code);
      expect(tokens.has('card')).toBe(true);
      expect(tokens.has('text-center')).toBe(true);
      expect(tokens.has('d-flex')).toBe(true);
      expect(tokens.has('p-3')).toBe(true);
      expect(tokens.has('badge')).toBe(true);
      expect(tokens.has('badge-light')).toBe(true);
      expect(tokens.has('Button')).toBe(true);
      expect(tokens.has('non-existent')).toBe(false);
    });

    it('matches whole words in comments and strings (upper bound behavior)', () => {
      const code = `
        // Check if table layout is visible and supports scroll
        const note = 'table header';
      `;
      const tokens = tokenizeContent(code);
      expect(tokens.has('table')).toBe(true);
      expect(tokens.has('visible')).toBe(true);
      expect(tokens.has('scroll')).toBe(true);
    });
  });

  describe('extractClasses', () => {
    it('extracts class names without leading dots and sorts them', () => {
      const css = `
        .btn { display: inline-block; }
        .btn-primary, .btn-secondary { color: #fff; }
        div > .card.card-flush { padding: 1rem; }
        .btn:hover, :not(.active) { opacity: 0.8; }
      `;
      const classes = extractClasses(css);
      expect(classes).toEqual([
        'active',
        'btn',
        'btn-primary',
        'btn-secondary',
        'card',
        'card-flush',
      ]);
    });

    it('ignores at-rule keyframe step names', () => {
      const css = `
        @keyframes spinner-border {
          to { transform: rotate(360deg); }
        }
        .spinner-border { animation: spinner-border 0.75s linear infinite; }
      `;
      const classes = extractClasses(css);
      expect(classes).toEqual(['spinner-border']);
    });
  });

  describe('extractSelectors', () => {
    it('preserves selector source order and adds at-rule context', () => {
      const css = `
        .header { display: flex; }
        @layer bootstrap {
          .nav { list-style: none; }
          @media (min-width: 576px) {
            .col-sm-6 { width: 50%; }
          }
        }
        .footer { clear: both; }
      `;
      const selectors = extractSelectors(css);
      expect(selectors).toEqual([
        '.header',
        '@layer bootstrap :: .nav',
        '@layer bootstrap > @media (min-width: 576px) :: .col-sm-6',
        '.footer',
      ]);
    });
  });

  describe('isClassAllowed', () => {
    it('allows classes present directly in corpus tokens', () => {
      const tokens = new Set(['my-custom-btn', 'd-flex']);
      expect(isClassAllowed('my-custom-btn', tokens)).toBe(true);
      expect(isClassAllowed('d-flex', tokens)).toBe(true);
      expect(isClassAllowed('unreferenced-class', tokens)).toBe(false);
    });

    describe('React-Bootstrap component allow-lists', () => {
      it('allows Stack classes only when Stack is present in corpus', () => {
        expect(isClassAllowed('hstack', new Set(['Stack']))).toBe(true);
        expect(isClassAllowed('vstack', new Set(['Stack']))).toBe(true);
        expect(isClassAllowed('hstack', new Set())).toBe(false);
      });

      it('allows Col grid classes only when Col is present in corpus', () => {
        const colTokens = new Set(['Col']);
        expect(isClassAllowed('col', colTokens)).toBe(true);
        expect(isClassAllowed('col-auto', colTokens)).toBe(true);
        expect(isClassAllowed('col-6', colTokens)).toBe(true);
        expect(isClassAllowed('col-md-4', colTokens)).toBe(true);
        expect(isClassAllowed('col-sm-auto', colTokens)).toBe(true);
        expect(isClassAllowed('col-xxl-12', colTokens)).toBe(true);

        expect(isClassAllowed('col-6', new Set())).toBe(false);
        expect(isClassAllowed('col-form-label', colTokens)).toBe(false);
      });

      it('allows Row classes only when Row is present in corpus', () => {
        const rowTokens = new Set(['Row']);
        expect(isClassAllowed('row', rowTokens)).toBe(true);
        expect(isClassAllowed('row-cols-2', rowTokens)).toBe(true);
        expect(isClassAllowed('row-cols-auto', rowTokens)).toBe(true);
        expect(isClassAllowed('row-cols-md-3', rowTokens)).toBe(true);

        expect(isClassAllowed('row', new Set())).toBe(false);
      });

      it('allows Card classes only when Card is present in corpus', () => {
        const cardTokens = new Set(['Card']);
        expect(isClassAllowed('card', cardTokens)).toBe(true);
        expect(isClassAllowed('card-header', cardTokens)).toBe(true);
        expect(isClassAllowed('card-body', cardTokens)).toBe(true);
        expect(isClassAllowed('card-title', cardTokens)).toBe(true);
        expect(isClassAllowed('card-footer', cardTokens)).toBe(true);
        expect(isClassAllowed('card-subtitle', cardTokens)).toBe(true);
        expect(isClassAllowed('card-text', cardTokens)).toBe(true);
        expect(isClassAllowed('card-img', cardTokens)).toBe(true);
        expect(isClassAllowed('card-img-top', cardTokens)).toBe(true);

        expect(isClassAllowed('card', new Set())).toBe(false);
        expect(isClassAllowed('card-group', cardTokens)).toBe(false);
      });

      it('allows Table classes only when Table is present in corpus', () => {
        const tableTokens = new Set(['Table']);
        expect(isClassAllowed('table', tableTokens)).toBe(true);
        expect(isClassAllowed('table-sm', tableTokens)).toBe(true);
        expect(isClassAllowed('table-hover', tableTokens)).toBe(true);
        expect(isClassAllowed('table-striped', tableTokens)).toBe(true);
        expect(isClassAllowed('table-bordered', tableTokens)).toBe(true);
        expect(isClassAllowed('table-borderless', tableTokens)).toBe(true);
        expect(isClassAllowed('table-responsive', tableTokens)).toBe(true);

        expect(isClassAllowed('table-responsive', new Set())).toBe(false);
      });

      it('allows ListGroup classes only when ListGroup is present in corpus', () => {
        const lgTokens = new Set(['ListGroup']);
        expect(isClassAllowed('list-group', lgTokens)).toBe(true);
        expect(isClassAllowed('list-group-flush', lgTokens)).toBe(true);
        expect(isClassAllowed('list-group-item', lgTokens)).toBe(true);
        expect(isClassAllowed('list-group-item-action', lgTokens)).toBe(true);

        expect(isClassAllowed('list-group', new Set())).toBe(false);
        expect(isClassAllowed('list-group-numbered', lgTokens)).toBe(false);
      });

      it('allows Spinner classes only when Spinner is present in corpus', () => {
        const spTokens = new Set(['Spinner']);
        expect(isClassAllowed('spinner-border', spTokens)).toBe(true);
        expect(isClassAllowed('spinner-border-sm', spTokens)).toBe(true);
        expect(isClassAllowed('spinner-grow', spTokens)).toBe(true);
        expect(isClassAllowed('spinner-grow-sm', spTokens)).toBe(true);

        expect(isClassAllowed('spinner-border', new Set())).toBe(false);
      });

      it('allows Collapse classes only when Collapse is present in corpus', () => {
        const collTokens = new Set(['Collapse']);
        expect(isClassAllowed('collapse', collTokens)).toBe(true);
        expect(isClassAllowed('collapsing', collTokens)).toBe(true);
        expect(isClassAllowed('show', collTokens)).toBe(true);

        expect(isClassAllowed('collapse', new Set())).toBe(false);
        expect(isClassAllowed('collapse-horizontal', collTokens)).toBe(false);
      });
    });

    describe('Runtime and third-party prefixes', () => {
      it('rejects retired symbol-* runtime classes', () => {
        expect(isClassAllowed('symbol', new Set())).toBe(false);
        expect(isClassAllowed('symbol-25px', new Set())).toBe(false);
        expect(isClassAllowed('symbol-100px', new Set())).toBe(false);
        expect(isClassAllowed('symbol-circle', new Set())).toBe(false);
        expect(isClassAllowed('symbol-group', new Set())).toBe(false);
        expect(isClassAllowed('symbol-group-hover', new Set())).toBe(false);
      });

      it('rejects retired svg-icon-* runtime classes', () => {
        expect(isClassAllowed('svg-icon', new Set())).toBe(false);
        expect(isClassAllowed('svg-icon-2hx', new Set())).toBe(false);
        expect(isClassAllowed('svg-icon-primary', new Set())).toBe(false);
      });

      it('allows LiveKit third-party lk-* classes', () => {
        expect(isClassAllowed('lk-video-container', new Set())).toBe(true);
        expect(isClassAllowed('lk-control-bar', new Set())).toBe(true);
      });
    });
  });

  describe('diffSelectors', () => {
    it('passes when selector lists are identical', () => {
      const selectors = ['.a', '.b', '.c'];
      const result = diffSelectors(selectors, selectors);
      expect(result.changedOtherThanRemoval).toBe(false);
    });

    it('passes when selectors are only removed (pure removal)', () => {
      const base = ['.a', '.b', '.c', '.d'];
      const current = ['.a', '.c'];
      const result = diffSelectors(base, current);
      expect(result.changedOtherThanRemoval).toBe(false);
    });

    it('fails when selectors are reordered', () => {
      const base = ['.a', '.b', '.c'];
      const current = ['.b', '.a', '.c'];
      const result = diffSelectors(base, current);
      expect(result.changedOtherThanRemoval).toBe(true);
      expect(result.patch).toContain('+.b');
      expect(result.patch).toContain('-.b');
    });

    it('fails when new selectors are added', () => {
      const base = ['.a', '.b'];
      const current = ['.a', '.b', '.c'];
      const result = diffSelectors(base, current);
      expect(result.changedOtherThanRemoval).toBe(true);
      expect(result.patch).toContain('+.c');
    });

    it('fails when a selector is renamed or modified', () => {
      const base = ['.a', '.btn-old'];
      const current = ['.a', '.btn-new'];
      const result = diffSelectors(base, current);
      expect(result.changedOtherThanRemoval).toBe(true);
    });
  });

  describe('findNewUnusedClasses', () => {
    it('returns empty when unused classes match baseline', () => {
      const baseline = { 'bootstrap/scss/type': ['display-1', 'display-2'] };
      const current = { 'bootstrap/scss/type': ['display-1', 'display-2'] };
      expect(findNewUnusedClasses(baseline, current)).toEqual({});
    });

    it('returns empty when an unused class was removed or used (pure shrink)', () => {
      const baseline = { 'bootstrap/scss/type': ['display-1', 'display-2'] };
      const current = { 'bootstrap/scss/type': ['display-1'] };
      expect(findNewUnusedClasses(baseline, current)).toEqual({});
    });

    it('detects new unused classes in an existing partial', () => {
      const baseline = { 'bootstrap/scss/type': ['display-1'] };
      const current = { 'bootstrap/scss/type': ['display-1', 'display-2'] };
      expect(findNewUnusedClasses(baseline, current)).toEqual({
        'bootstrap/scss/type': ['display-2'],
      });
    });

    it('detects unused classes in a newly added partial', () => {
      const baseline = {};
      const current = { 'custom/new-partial': ['unreferenced-class'] };
      expect(findNewUnusedClasses(baseline, current)).toEqual({
        'custom/new-partial': ['unreferenced-class'],
      });
    });
  });

  describe('table cell gutters', () => {
    const css = compilePartial(
      "@import 'config'; @import 'components/tables';",
    );
    const declarations = (selector: string) => {
      const found: Record<string, string> = {};
      postcss.parse(css).walkRules((rule) => {
        if (rule.selectors.includes(selector)) {
          rule.walkDecls((decl) => {
            found[decl.prop] = decl.value;
          });
        }
      });
      return found;
    };

    it.each([
      ['.table.table-list td', { padding: '0 8px' }],
      ['.table.table-list th', { padding: '0 8px' }],
      [
        '.table.form-table td',
        { 'padding-left': '1.25rem', 'padding-right': '1.25rem' },
      ],
      [
        '.table.form-table th',
        { 'padding-left': '1.25rem', 'padding-right': '1.25rem' },
      ],
    ])('pads %s', (selector, expected) => {
      expect(declarations(selector)).toMatchObject(expected);
    });
  });
});
