import { describe, expect, it, vi } from 'vitest';
import { DryRunViewAsResult } from 'waldur-js-client';

import { publicCallKey } from '@/proposals/callQueries';

import { createPreviewClient } from './previewClient';

const read = (data: unknown, status = 200) => ({ status, data });

const view = (responses: Record<string, unknown>) =>
  ({
    role: 'applicant',
    proposal_uuid: 'p1',
    viewer: { uuid: 'v1' },
    responses: {
      proposal: read({ uuid: 'p1', call_uuid: 'c1' }),
      ...responses,
    },
  }) as unknown as DryRunViewAsResult;

describe('the preview of a whole proposal page', () => {
  it('answers the call settings, the team and its managers', () => {
    const client = createPreviewClient(
      view({
        call: read({ uuid: 'c1', fixed_duration_in_days: 365 }),
        team: read([
          { uuid: 'a', role_name: 'PROPOSAL.MANAGER' },
          { uuid: 'b', role_name: 'PROPOSAL.MEMBER' },
        ]),
      }),
      vi.fn(),
    );
    expect(
      client.getQueryData(publicCallKey('c1', ['fixed_duration_in_days'])),
    ).toMatchObject({ fixed_duration_in_days: 365 });
    expect(client.getQueryData(['ProposalManagerCount', 'p1'])).toBe(1);
    expect(client.getQueryData(['ProposalTeamReadable', 'p1'])).toBe(true);
  });

  it('answers a table by its name, whatever its page and filter', async () => {
    const onMissing = vi.fn();
    const client = createPreviewClient(
      view({ team: read([{ uuid: 'a', role_name: 'PROPOSAL.MANAGER' }]) }),
      onMissing,
    );
    const data: any = await client.fetchQuery({
      queryKey: ['table', 'ProposalUsersList', 1, 10, '', null, null, null, []],
      queryFn: () => Promise.reject(new Error('fetched')),
    });
    expect(data.rows).toHaveLength(1);
    expect(data.resultCount).toBe(1);
    expect(onMissing).not.toHaveBeenCalled();
  });

  it('settles compliance the viewer may not read as nothing to show', () => {
    const client = createPreviewClient(
      view({ compliance: read({ detail: 'No.' }, 403) }),
      vi.fn(),
    );
    expect(client.getQueryData(['ProposalChecklistSummary', 'p1'])).toBe(null);
  });

  it('never fetches a table it holds no rows for', async () => {
    const onMissing = vi.fn();
    const client = createPreviewClient(view({}), onMissing);
    const fetched = vi.fn();
    await expect(
      client.fetchQuery({
        queryKey: ['table', 'SomeTable', 1, 10],
        queryFn: fetched,
      }),
    ).rejects.toThrow();
    expect(fetched).not.toHaveBeenCalled();
    expect(onMissing).toHaveBeenCalled();
  });
});

describe('the activity of a previewed proposal', () => {
  it('pages the events and narrows them to the chosen category', async () => {
    const events = Array.from({ length: 12 }, (_, i) => ({
      uuid: `e${i}`,
      event_type: i % 2 ? 'role_granted' : 'step_started',
    }));
    const client = createPreviewClient(view({ events: read(events) }), vi.fn());
    const all: any = await client.fetchQuery({
      queryKey: [
        'table',
        'proposal-activity-p1-all',
        2,
        10,
        '',
        null,
        null,
        {},
      ],
    });
    expect(all.rows).toHaveLength(2);
    expect(all.resultCount).toBe(12);
    const team: any = await client.fetchQuery({
      queryKey: [
        'table',
        'proposal-activity-p1-team',
        1,
        10,
        '',
        null,
        null,
        { event_type: ['role_granted'] },
      ],
    });
    expect(team.resultCount).toBe(6);
  });
});
