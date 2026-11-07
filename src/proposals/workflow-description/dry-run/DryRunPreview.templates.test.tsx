import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

import { act, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DryRunViewAsResult } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { DryRunPreview } from './DryRunPreview';

vi.mock('@/proposals/presentation', () => ({
  usesCallVocabulary: () => true,
  showsWorkflowSteps: () => true,
}));

/**
 * What the backend's dry run returned for every role of four shipped call
 * templates, at points of their happy path and after a rejection at the
 * first step. fixtures/capture_previews.py writes it; run it again when
 * the reads of a preview change.
 */
const PREVIEWS: Record<
  string,
  Record<string, Record<string, DryRunViewAsResult>>
> = JSON.parse(
  gunzipSync(
    readFileSync(
      'src/proposals/workflow-description/dry-run/fixtures/previews.json.gz',
    ),
  ).toString(),
);

const CASES = Object.entries(PREVIEWS).flatMap(([template, points]) =>
  Object.entries(points).flatMap(([point, roles]) =>
    Object.entries(roles).map(
      ([role, view]) => [template, point, role, view] as const,
    ),
  ),
);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={createStore(() => ({ workspace: { user: null } }))}>
    {children}
  </Provider>
);

describe('DryRunPreview over the shipped templates', () => {
  const warn = vi.spyOn(console, 'warn');
  const fetchSpy = vi.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = fetchSpy as any;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('covers every template and role', () => {
    expect(Object.keys(PREVIEWS).sort()).toEqual([
      'ai_for_science',
      'extreme_scale',
      'regular_access',
      'single_panel_review',
    ]);
    expect(CASES.length).toBeGreaterThan(100);
  });

  it.each(CASES)(
    '%s, %s, as %s: every query the page asks is answered',
    async (_template, _point, _role, view) => {
      renderWithProviders(
        <DryRunPreview view={view} roleLabel="someone" pointLabel="a point" />,
        { wrapper: Wrapper },
      );
      // A query nobody answered fails in the next tick; let it.
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
      const asked = warn.mock.calls
        .map((args) => String(args[0]))
        .filter((message) => message.startsWith('Dry run preview'));
      expect(asked).toEqual([]);
      expect(screen.queryByTestId('dry-run-not-previewed')).toBeNull();
      const text = screen.getByTestId('dry-run-preview').textContent;
      expect(text).not.toMatch(/Could not load|Unable to load/);
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );
});
