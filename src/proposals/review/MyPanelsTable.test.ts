import { describe, expect, it, vi } from 'vitest';
import { proposalProtectedCallsPanelsList } from 'waldur-js-client';

import {
  collectMyPanels,
  fetchCallPanels,
  getPanelCalls,
} from './MyPanelsTable';

describe('getPanelCalls', () => {
  it('keeps the calls the user holds the panel member role on, once each', () => {
    expect(
      getPanelCalls([
        {
          scope_type: 'call',
          scope_uuid: 'c1',
          scope_name: 'Regular Access',
          role_name: 'CALL.PANEL_MEMBER',
        },
        {
          scope_type: 'call',
          scope_uuid: 'c1',
          scope_name: 'Regular Access',
          role_name: 'CALL.PANEL_MEMBER',
        },
        {
          scope_type: 'call',
          scope_uuid: 'c2',
          scope_name: 'Benchmark Access',
          role_name: 'CALL.REVIEWER',
        },
        {
          scope_type: 'customer',
          scope_uuid: 'o1',
          scope_name: 'JU',
          role_name: 'CALL.PANEL_MEMBER',
        },
      ]),
    ).toEqual([{ uuid: 'c1', name: 'Regular Access' }]);
  });

  it('is empty without grants', () => {
    expect(getPanelCalls(undefined)).toEqual([]);
  });
});

describe('collectMyPanels', () => {
  const calls = [
    { uuid: 'c1', name: 'Regular Access' },
    { uuid: 'c2', name: 'Benchmark Access' },
  ];
  const panel = (uuid: string, chair: string, members: string[]) =>
    ({
      uuid,
      name: uuid,
      chair,
      member_details: members.map((member) => ({
        uuid: member,
        full_name: member,
      })),
    }) as any;

  it('keeps the panels the user sits on when another call fails', () => {
    const { rows, failedCalls } = collectMyPanels(
      calls,
      [
        {
          status: 'fulfilled',
          value: [panel('p1', 'u1', ['u1']), panel('p2', 'u2', ['u2', 'u3'])],
        },
        { status: 'rejected', reason: new Error('boom') },
      ],
      'u1',
    );
    expect(rows.map((row) => [row.panel.uuid, row.chairs])).toEqual([
      ['p1', true],
    ]);
    expect(failedCalls).toEqual(['Benchmark Access']);
  });

  it('lists a panel the user is a member of, not its chair', () => {
    const { rows } = collectMyPanels(
      calls.slice(0, 1),
      [{ status: 'fulfilled', value: [panel('p2', 'u2', ['u2', 'u3'])] }],
      'u3',
    );
    expect(rows.map((row) => [row.panel.uuid, row.chairs])).toEqual([
      ['p2', false],
    ]);
    expect(rows[0].call.url).toContain('/proposal-protected-calls/c1/');
  });
});

describe('fetchCallPanels', () => {
  it("reads every page of the call's panels", async () => {
    const page = (uuids: string[], next?: string) => ({
      data: uuids.map((uuid) => ({ uuid })),
      response: {
        headers: new Headers(next ? { link: `<${next}>; rel="next"` } : {}),
      },
    });
    vi.mocked(proposalProtectedCallsPanelsList)
      .mockResolvedValueOnce(
        page(['p1', 'p2'], 'https://example.com/panels/?page=2') as any,
      )
      .mockResolvedValueOnce(page(['p11']) as any);
    const panels = await fetchCallPanels('c1');
    expect(panels.map((panel) => panel.uuid)).toEqual(['p1', 'p2', 'p11']);
    expect(
      vi
        .mocked(proposalProtectedCallsPanelsList)
        .mock.calls.map(([options]) => options.query.page),
    ).toEqual([1, 2]);
  });
});
