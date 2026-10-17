import { describe, expect, it } from 'vitest';

import { buildEditResolve } from './buildEditResolve';
import { TicketDraft } from './parseTicketDraft';

const draft: TicketDraft = {
  draftUuid: 'd1',
  requester: '@alice:chat.example.com',
  title: 'VM does not boot',
  description: 'It hangs.',
  requestType: 'Incident',
  project: {
    uuid: 'p1',
    name: 'Project',
    customerUuid: 'c1',
    customerName: 'Org',
  },
};

describe('buildEditResolve', () => {
  it('prefills text and request type, scoped to the project', () => {
    expect(buildEditResolve(draft)).toMatchObject({
      issue: {
        summary: 'VM does not boot',
        description: 'It hangs.',
        type: { id: 'Incident' },
      },
      scopeType: 'project',
      scope: { uuid: 'p1', name: 'Project', customer_uuid: 'c1' },
    });
  });

  it('preselects the draft’s resource but keeps the project scope', () => {
    expect(
      buildEditResolve({
        ...draft,
        resource: { uuid: 'r1', name: 'vm-1', offeringName: 'VMs' },
      }),
    ).toMatchObject({
      scopeType: 'project',
      scope: { uuid: 'p1', name: 'Project', customer_name: 'Org' },
      issue: {
        resource: {
          uuid: 'r1',
          name: 'vm-1',
          offering_name: 'VMs',
          project_uuid: 'p1',
        },
      },
    });
  });
});
