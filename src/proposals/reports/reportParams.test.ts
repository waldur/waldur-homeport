import { describe, expect, it } from 'vitest';

import { states } from '@/proposals/routes';

import {
  buildReportQuery,
  CALL_REPORT_PARAMS_CLEARED,
  hasActiveFilters,
  leaveReportParamsBehind,
  parseReportFilters,
  parseReportKind,
  serializeReportFilters,
} from './reportParams';

const C1 = 'ca200000000000000000000000000001';
const C2 = 'ca200000000000000000000000000002';
const R1 = 'ca500000000000000000000000000001';

describe('report params', () => {
  it('opens the portfolio when the URL names no report or an unknown one', () => {
    expect(parseReportKind(undefined)).toBe('portfolio');
    expect(parseReportKind('nonsense')).toBe('portfolio');
    expect(parseReportKind('budgets')).toBe('budgets');
  });

  it('reads one call or several, and only well-formed dates', () => {
    expect(
      parseReportFilters({
        call: C1,
        round: R1,
        from: '2026-01-01',
        to: 'yesterday', // state-check: ignore (a date filter, not a route)
      }),
    ).toEqual({
      organizations: [],
      calls: [C1],
      round: R1,
      // A start with no valid end is no range.
      from: undefined,
      to: undefined,
    });
    expect(parseReportFilters({ call: [C1, C2] }).calls).toEqual([C1, C2]);
    expect(parseReportFilters({})).toEqual({
      organizations: [],
      calls: [],
      round: undefined,
      from: undefined,
      to: undefined,
    });
  });

  // The picker shows a range only with both ends; a report narrowed by one
  // it does not show would not match the page.
  it('reads the dates only as a whole range', () => {
    expect(
      parseReportFilters({ from: '2026-01-01', to: '2026-06-30' }),
    ).toMatchObject({ from: '2026-01-01', to: '2026-06-30' });
    expect(parseReportFilters({ from: '2026-01-01' })).toMatchObject({
      from: undefined,
      to: undefined,
    });
    expect(parseReportFilters({ to: '2026-06-30' })).toMatchObject({
      from: undefined,
      to: undefined,
    });
  });

  // The API refuses these with a 400; the URL is read as if without them.
  it('drops a malformed uuid and a day the calendar has not got', () => {
    expect(
      parseReportFilters({
        organization: ['nobody', C2],
        call: [C1, 'not-a-uuid'],
        round: 'elsewhere',
        from: '2026-02-31',
        to: '2026-13-01',
      }),
    ).toEqual({
      organizations: [C2],
      calls: [C1],
      round: undefined,
      from: undefined,
      to: undefined,
    });
    // A uuid with hyphens is a uuid too.
    expect(
      parseReportFilters({ round: 'ca500000-0000-0000-0000-000000000003' })
        .round,
    ).toBe('ca500000-0000-0000-0000-000000000003');
  });

  it('writes a cleared filter as null so the URL drops it', () => {
    expect(
      serializeReportFilters({
        calls: [],
        round: undefined,
        from: '2026-01-01',
      }),
    ).toEqual({ call: null, round: null, from: '2026-01-01' });
    // Only what changed: the rest of the URL is kept.
    expect(serializeReportFilters({ round: 'r1' })).toEqual({ round: 'r1' });
  });

  it('sends the filters as the report endpoint names them', () => {
    const filters = {
      calls: ['c1', 'c2'],
      round: 'r1',
      from: '2026-01-01',
      to: '2026-06-30',
    };
    expect(
      buildReportQuery('portfolio', filters, { callLevel: false }),
    ).toEqual({
      call_uuid: ['c1', 'c2'],
      round_uuid: 'r1',
      submitted_from: '2026-01-01',
      submitted_to: '2026-06-30',
    });
    // The call is in the path of a call-level report.
    expect(
      buildReportQuery('portfolio', filters, { callLevel: true }),
    ).not.toHaveProperty('call_uuid');
    // Across organizations, the chosen ones; elsewhere there are none.
    expect(
      buildReportQuery(
        'rounds',
        { ...filters, organizations: [C2] },
        { callLevel: false, global: true },
      ),
    ).toMatchObject({ organisation_uuid: [C2] });
    expect(
      buildReportQuery(
        'rounds',
        { ...filters, organizations: [C2] },
        { callLevel: false },
      ),
    ).not.toHaveProperty('organisation_uuid');
    // Pools are offered per call and round: the dates do not apply.
    expect(buildReportQuery('budgets', filters, { callLevel: false })).toEqual({
      call_uuid: ['c1', 'c2'],
      round_uuid: 'r1',
    });
  });

  it('does not count dates as a filter of the budgets', () => {
    const filters = { calls: [], from: '2026-01-01', to: '2026-06-30' };
    expect(hasActiveFilters(filters, 'portfolio')).toBe(true);
    expect(hasActiveFilters(filters, 'budgets')).toBe(false);
  });

  // Tab links keep the page's params: leaving Reports for the Dashboard
  // carried `report`, `round` and the dates along.
  it("clears the reports' params on the links of a call's other tabs", () => {
    const tabs = leaveReportParamsBehind([
      { key: 'dashboard', title: 'Dashboard' },
      { key: 'reports', title: 'Reports' },
      { key: 'events', title: 'Events', linkParams: { page: 2 } },
    ]);
    expect(tabs[0].linkParams).toEqual(CALL_REPORT_PARAMS_CLEARED);
    expect(tabs[1].linkParams).toBeUndefined();
    expect(tabs[2].linkParams).toEqual({
      page: 2,
      ...CALL_REPORT_PARAMS_CLEARED,
    });
  });

  // A link inherits only the params of the states it shares with the page,
  // so at the organization level the report params stay on the Reports page
  // as long as no other page of call management declares them.
  it('declares the report params on no other call-management page', () => {
    const reportParams = ['report', 'call', 'round', 'from', 'to'];
    const declaring = states
      .filter((state) => String(state.name).startsWith('call-management'))
      .filter((state) => {
        const query = String(state.url ?? '').split('?')[1] ?? '';
        const names = [
          ...query.split('&').map((name) => name.replace(/[{}]/g, '')),
          ...Object.keys(state.params ?? {}),
        ];
        return names.some((name) => reportParams.includes(name));
      })
      .map((state) => state.name);
    expect(declaring).toEqual(['call-management.reports']);
  });
});
