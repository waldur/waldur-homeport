import { describe, expect, it } from 'vitest';

import { parseTicketDraft, parseTicketDraftOutcome } from './parseTicketDraft';

const BOT = '@waldur-bot:chat.example.com';

const parse = (sender: string, type: string, blocks: unknown) =>
  parseTicketDraft(sender, type, blocks, BOT);
const parseOutcome = (sender: string, type: string, blocks: unknown) =>
  parseTicketDraftOutcome(sender, type, blocks, BOT);
const DRAFT = 'a'.repeat(32);

const block = (overrides: Record<string, unknown> = {}) => ({
  id: `ticket-draft-${DRAFT}`,
  key: 'support_ticket_draft',
  status: 'complete',
  draft_uuid: DRAFT,
  requester: '@alice:chat.example.com',
  title: 'VM does not boot',
  description: 'Since the update the VM hangs at boot.',
  request_type: 'Incident',
  priority: '',
  project_name: 'Project',
  project_uuid: 'b'.repeat(32),
  resource_name: '',
  resource_uuid: '',
  helpdesk: 'Service desk',
  expires_at: '2026-10-11T12:15:00+00:00',
  generated_by: 'plain',
  ...overrides,
});

describe('parseTicketDraft', () => {
  it('reads a draft block from a bot notice', () => {
    const draft = parse(BOT, 'm.notice', [block()]);
    expect(draft).toEqual({
      draftUuid: DRAFT,
      requester: '@alice:chat.example.com',
      title: 'VM does not boot',
      description: 'Since the update the VM hangs at boot.',
      requestType: 'Incident',
      priority: undefined,
      helpdesk: 'Service desk',
      project: {
        uuid: 'b'.repeat(32),
        name: 'Project',
        customerUuid: undefined,
        customerName: undefined,
      },
      resource: undefined,
      expiresAt: '2026-10-11T12:15:00+00:00',
    });
  });

  it('reads the one resource the draft is about', () => {
    const draft = parse(BOT, 'm.notice', [
      block({
        resource_uuid: 'c'.repeat(32),
        resource_name: 'vm-1',
        resource_offering_name: 'VMs',
      }),
    ]);
    expect(draft?.resource).toEqual({
      uuid: 'c'.repeat(32),
      name: 'vm-1',
      offeringName: 'VMs',
    });
  });

  it('skips blocks of other kinds', () => {
    const draft = parse(BOT, 'm.notice', [
      { key: 'markdown', content: 'hi' },
      block(),
    ]);
    expect(draft?.draftUuid).toBe(DRAFT);
  });

  it('ignores a member whose name only looks like a bot’s', () => {
    expect(
      parse('@evil-bot:chat.example.com', 'm.notice', [block()]),
    ).toBeNull();
  });

  it('ignores every block while the room’s bot is unknown', () => {
    expect(parseTicketDraft(BOT, 'm.notice', [block()], null)).toBeNull();
  });

  it('ignores blocks sent by anyone but the bot', () => {
    expect(
      parse('@mallory:chat.example.com', 'm.notice', [block()]),
    ).toBeNull();
  });

  it('ignores blocks on anything but a notice', () => {
    expect(parse(BOT, 'm.text', [block()])).toBeNull();
  });

  it.each([
    ['not a list', block()],
    ['a malformed draft uuid', [block({ draft_uuid: '../../x' })]],
    ['no requester', [block({ requester: 42 })]],
    ['an empty title', [block({ title: '  ' })]],
    ['no description', [block({ description: null })]],
  ])('rejects a draft with %s', (_name, blocks) => {
    expect(parse(BOT, 'm.notice', blocks)).toBeNull();
  });

  it('drops an unparseable expiry', () => {
    const draft = parse(BOT, 'm.notice', [block({ expires_at: 'soon' })]);
    expect(draft?.expiresAt).toBeUndefined();
  });
});

describe('parseTicketDraftOutcome', () => {
  it('reads a created ticket', () => {
    expect(
      parseOutcome(BOT, 'm.notice', [
        {
          key: 'support_ticket_created',
          draft_uuid: DRAFT,
          issue_uuid: 'd'.repeat(32),
          issue_key: 'SD-42',
        },
      ]),
    ).toEqual([
      DRAFT,
      { state: 'created', issueUuid: 'd'.repeat(32), issueKey: 'SD-42' },
    ]);
  });

  it('reads what the requester changed before sending', () => {
    expect(
      parseOutcome(BOT, 'm.notice', [
        {
          key: 'support_ticket_created',
          draft_uuid: DRAFT,
          title: 'Edited title',
          description: 'Edited text',
          resource_uuid: '',
          resource_name: '',
        },
      ])?.[1],
    ).toEqual({
      state: 'created',
      edits: {
        title: 'Edited title',
        description: 'Edited text',
        // Dropped, as against not changed.
        resource: null,
      },
    });
  });

  it('reads a cancelled or expired draft', () => {
    expect(
      parseOutcome(BOT, 'm.notice', [
        { key: 'support_ticket_cancelled', draft_uuid: DRAFT },
      ]),
    ).toEqual([DRAFT, { state: 'cancelled' }]);
    expect(
      parseOutcome(BOT, 'm.notice', [
        {
          key: 'support_ticket_cancelled',
          draft_uuid: DRAFT,
          reason: 'expired',
        },
      ]),
    ).toEqual([DRAFT, { state: 'expired' }]);
  });

  it('reads a draft replaced by a newer one as cancelled', () => {
    expect(
      parseOutcome(BOT, 'm.notice', [
        {
          key: 'support_ticket_cancelled',
          draft_uuid: DRAFT,
          reason: 'replaced',
        },
      ]),
    ).toEqual([DRAFT, { state: 'cancelled' }]);
  });

  it('ignores outcomes claimed by anyone but the bot', () => {
    expect(
      parseOutcome('@mallory:chat.example.com', 'm.notice', [
        { key: 'support_ticket_cancelled', draft_uuid: DRAFT },
      ]),
    ).toBeNull();
  });
});
