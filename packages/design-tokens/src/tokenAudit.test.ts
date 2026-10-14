import { describe, expect, it } from 'vitest';

import {
  ALLOWLIST,
  auditDesignTokens,
  auditDuplicateBaseline,
  DUPLICATE_BASELINE,
  duplicateGroupKey,
  auditDuplicateSemanticTokens,
  auditGhostTokens,
  auditComponentLayer,
  auditRedundantAliases,
} from '../scripts/audit-tokens.mjs';

describe('CSS variable audit harness', () => {
  it('all declared design tokens have active call sites or documented exemptions', () => {
    const { deadTokens, totalDeclared } = auditDesignTokens();

    expect(
      totalDeclared,
      'Design tokens directory must contain declared tokens',
    ).toBeGreaterThan(0);

    expect(
      deadTokens,
      `Found dead / unused CSS variables in packages/design-tokens/src/css:\n` +
        deadTokens
          .map((d) => `  - ${d.name} (declared in ${d.file})`)
          .join('\n') +
        `\n\nPrune the dead tokens or document them in ALLOWLIST if part of an intentional API surface.`,
    ).toEqual([]);
  });

  it('no documented exemption in ALLOWLIST is stale (already in active use)', () => {
    const { staleAllowlist } = auditDesignTokens();

    expect(
      staleAllowlist,
      `Found stale exemptions in ALLOWLIST that now have active call sites:\n` +
        staleAllowlist
          .map((s) => `  - ${s.name} (${s.callers} active references)`)
          .join('\n') +
        `\n\nRemove these tokens from ALLOWLIST in scripts/audit-tokens.mjs.`,
    ).toEqual([]);
  });

  it('documented exemptions all have descriptive rationales', () => {
    for (const [token, rationale] of Object.entries(ALLOWLIST)) {
      expect(token).toMatch(/^--[a-z0-9-]+$/);
      expect(typeof rationale).toBe('string');
      expect(rationale.trim().length).toBeGreaterThan(10);
    }
  });

  it('no application code references undeclared ghost tokens', () => {
    const ghosts = auditGhostTokens();

    expect(
      ghosts,
      `Found ghost tokens (referenced via var(--token) or getCssVar('--token') but not declared anywhere):\n` +
        ghosts
          .map((g) => `  - ${g.name} (in ${g.callers.join(', ')})`)
          .join('\n'),
    ).toEqual([]);
  });

  it('no redundant multi-level token aliases in design tokens', () => {
    const redundant = auditRedundantAliases();

    expect(
      redundant,
      `Found redundant token-to-token alias declarations in packages/design-tokens/src/css:\n` +
        redundant
          .map((r) => `  - ${r.token} aliases ${r.target} (in ${r.file})`)
          .join('\n') +
        `\n\nSemantic tokens bind to primitive scales (--color-*, --brand-*); component tokens bind to semantic tokens. Never alias sideways (another domain's or another component's token).`,
    ).toEqual([]);
  });

  it('component tokens read semantic roles and leave dark mode to them', () => {
    const { violations } = auditComponentLayer();

    expect(
      violations,
      `Found component tokens that handle dark mode or colours themselves:\n` +
        violations
          .map((v) => `  - ${v.file}: ${v.token ?? v.selector} (${v.reason})`)
          .join('\n') +
        `\n\nPoint the token at a semantic role (var(--text-*), var(--bg-*), var(--border-*), ...) and drop its [data-theme='dark'] block. See docs/design-tokens.md.`,
    ).toEqual([]);
  });

  it('no component file in COMPONENT_LAYER_RATCHET already follows the rule', () => {
    const { staleRatchet } = auditComponentLayer();

    expect(
      staleRatchet,
      `These files already follow the component-layer rule; remove them from COMPONENT_LAYER_RATCHET in scripts/audit-tokens.mjs.`,
    ).toEqual([]);
  });

  it('no duplicate token name declarations across semantic stylesheets', () => {
    const { duplicateDeclarations } = auditDuplicateSemanticTokens();

    expect(
      duplicateDeclarations,
      `Found duplicate token name declarations across semantic stylesheets:\n` +
        duplicateDeclarations
          .map(
            (d) =>
              `  - ${d.token} (${d.reason}: ${d.file}${d.otherFile ? ` and ${d.otherFile}` : ''})`,
          )
          .join('\n'),
    ).toEqual([]);
  });

  it('no intra-file duplicate token value profiles within the same semantic stylesheet', () => {
    // A group documented in DUPLICATE_BASELINE is a deliberate pair of roles,
    // wherever its tokens live (brand.css keeps the brand border, mark and
    // focus ring together); anything else still has to be consolidated.
    const baselined = Object.keys(DUPLICATE_BASELINE).map(
      (key) => new Set(key.split(' = ')),
    );
    const sameFileDuplicates =
      auditDuplicateSemanticTokens().sameFileDuplicates.filter(
        (d) =>
          !baselined.some((group) =>
            d.tokens.every((name: string) => group.has(name)),
          ),
      );

    expect(
      sameFileDuplicates,
      `Found intra-file duplicate semantic tokens (redundancy candidates):\n` +
        sameFileDuplicates
          .map((d) => `  - ${d.file}: [${d.tokens.join(', ')}]`)
          .join('\n') +
        `\n\nConsolidate intra-file duplicate tokens to keep semantic token definitions lean.`,
    ).toEqual([]);
  });

  it('allows no duplicate semantic tokens beyond the documented baseline', () => {
    const { unexpected, stale } = auditDuplicateBaseline();
    expect(
      unexpected.map(
        (g) => `${duplicateGroupKey(g)} (light: ${g.light}, dark: ${g.dark})`,
      ),
      'New duplicate value profiles: merge the tokens, or add the group to DUPLICATE_BASELINE in audit-tokens.mjs with a reason',
    ).toEqual([]);
    expect(
      stale,
      'DUPLICATE_BASELINE entries that are no longer duplicates: remove them',
    ).toEqual([]);
  });

  it('reports a duplicate group missing from the baseline', () => {
    const { unexpected, stale } = auditDuplicateBaseline({ baseline: {} });
    expect(unexpected.length).toBeGreaterThan(0);
    expect(stale).toEqual([]);
  });

  it('detects cross-file semantic token value equivalence correctly', () => {
    const { totalSemanticTokens, duplicateValues, crossFileDuplicates } =
      auditDuplicateSemanticTokens();

    expect(totalSemanticTokens).toBeGreaterThan(0);
    expect(duplicateValues.length).toBeGreaterThan(0);
    expect(crossFileDuplicates.length).toBeGreaterThan(0);

    // Verify cross-file equivalent roles are identified across different concerns
    expect(
      crossFileDuplicates.some(
        (d) =>
          d.tokens.some((t) => t.name === '--border-divider-strong') &&
          d.tokens.some((t) => t.name === '--text-quinary'),
      ),
    ).toBe(true);
    expect(
      crossFileDuplicates.some(
        (d) =>
          d.tokens.some((t) => t.name === '--bg-quaternary') &&
          d.tokens.some((t) => t.name === '--border-divider'),
      ),
    ).toBe(true);
  });
});
