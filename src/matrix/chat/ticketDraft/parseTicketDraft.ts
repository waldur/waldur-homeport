import {
  TICKET_CANCELLED_BLOCK,
  TICKET_CREATED_BLOCK,
  TICKET_DRAFT_BLOCK,
} from './constants';

export interface TicketDraft {
  draftUuid: string;
  /** Matrix user id of the member who asked for the draft. */
  requester: string;
  title: string;
  /** Plain text: shown as written, never as markdown or HTML. */
  description: string;
  requestType?: string;
  priority?: string;
  helpdesk?: string;
  project?: {
    uuid: string;
    name: string;
    customerUuid?: string;
    customerName?: string;
  };
  /** The one resource the conversation is about, when exactly one was found. */
  resource?: { uuid: string; name: string; offeringName?: string };
  expiresAt?: string;
}

/**
 * What the requester changed before sending: a resource of null was
 * dropped, one left out was kept.
 */
type TicketDraftEdits = Partial<
  Pick<TicketDraft, 'title' | 'description' | 'requestType'>
> & { resource?: TicketDraft['resource'] | null };

export type TicketDraftOutcome =
  | {
      state: 'created';
      issueUuid?: string;
      issueKey?: string;
      edits?: TicketDraftEdits;
    }
  | { state: 'cancelled' }
  | { state: 'expired' };

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const str = (value: unknown, maxLength = 2000): string | undefined =>
  typeof value === 'string' && value.trim()
    ? value.slice(0, maxLength)
    : undefined;

const UUID_PATTERN = /^[0-9a-f-]{32,36}$/i;

const uuid = (value: unknown): string | undefined => {
  const s = str(value, 64);
  return s && UUID_PATTERN.test(s) ? s : undefined;
};

/**
 * Typed blocks are only taken from the room bot's notices: the sender must
 * be exactly the room's bot, as a member's name could look like a bot's.
 */
const botBlocks = (
  sender: string,
  type: string,
  blocks: unknown,
  roomBotUserId: string | null | undefined,
): Record<string, unknown>[] =>
  !!roomBotUserId &&
  sender === roomBotUserId &&
  type === 'm.notice' &&
  Array.isArray(blocks)
    ? blocks.filter(isObject)
    : [];

const parseDraftBlock = (
  block: Record<string, unknown>,
): TicketDraft | null => {
  if (block.key !== TICKET_DRAFT_BLOCK) return null;
  const draftUuid = uuid(block.draft_uuid);
  const requester = str(block.requester, 300);
  const title = str(block.title, 500);
  const description = str(block.description, 20000);
  if (!draftUuid || !requester || !title || !description) {
    return null;
  }

  const projectUuid = uuid(block.project_uuid);
  const projectName = str(block.project_name, 300);
  const resourceUuid = uuid(block.resource_uuid);
  const resourceName = str(block.resource_name, 300);
  const expiresAt = str(block.expires_at, 64);
  return {
    draftUuid,
    requester,
    title,
    description,
    requestType: str(block.request_type, 200),
    priority: str(block.priority, 200),
    helpdesk: str(block.helpdesk, 300),
    project:
      projectUuid && projectName
        ? {
            uuid: projectUuid,
            name: projectName,
            customerUuid: uuid(block.customer_uuid),
            customerName: str(block.customer_name, 300),
          }
        : undefined,
    resource:
      resourceUuid && resourceName
        ? {
            uuid: resourceUuid,
            name: resourceName,
            offeringName: str(block.resource_offering_name, 300),
          }
        : undefined,
    expiresAt:
      expiresAt && !Number.isNaN(Date.parse(expiresAt)) ? expiresAt : undefined,
  };
};

/**
 * The ticket draft carried by a bot notice, or null when the event has none
 * or its blocks don't have the expected shape. Event content is whatever the
 * sender wrote, so every field is checked; anything else is rendered as the
 * plain body.
 */
export function parseTicketDraft(
  sender: string,
  type: string,
  blocks: unknown,
  roomBotUserId: string | null | undefined,
): TicketDraft | null {
  for (const block of botBlocks(sender, type, blocks, roomBotUserId)) {
    const draft = parseDraftBlock(block);
    if (draft) return draft;
  }
  return null;
}

const TICKET_BLOCKS: unknown[] = [
  TICKET_DRAFT_BLOCK,
  TICKET_CREATED_BLOCK,
  TICKET_CANCELLED_BLOCK,
];

/** Whether a bot notice opens or closes a ticket draft. */
export function isTicketNotice(
  sender: string,
  type: string,
  blocks: unknown,
  roomBotUserId: string | null | undefined,
): boolean {
  return botBlocks(sender, type, blocks, roomBotUserId).some((block) =>
    TICKET_BLOCKS.includes(block.key),
  );
}

const parseEdits = (
  block: Record<string, unknown>,
): TicketDraftEdits | undefined => {
  const edits: TicketDraftEdits = {};
  const title = str(block.title, 500);
  const description = str(block.description, 20000);
  const requestType = str(block.request_type, 200);
  if (title) edits.title = title;
  if (description) edits.description = description;
  if (requestType) edits.requestType = requestType;
  if (typeof block.resource_uuid === 'string') {
    const resourceUuid = uuid(block.resource_uuid);
    const resourceName = str(block.resource_name, 300);
    edits.resource =
      resourceUuid && resourceName
        ? {
            uuid: resourceUuid,
            name: resourceName,
            offeringName: str(block.resource_offering_name, 300),
          }
        : null;
  }
  return Object.keys(edits).length ? edits : undefined;
};

/**
 * The draft as it went out. Waldur erases a draft's text once it is sent, so
 * the card has the bot's text and the edits its created notice reports.
 */
export function asSent(
  draft: TicketDraft,
  outcome: TicketDraftOutcome | undefined,
): TicketDraft {
  if (outcome?.state !== 'created' || !outcome.edits) return draft;
  const { resource, ...text } = outcome.edits;
  return {
    ...draft,
    ...text,
    resource: resource === undefined ? draft.resource : (resource ?? undefined),
  };
}

/**
 * The outcome a bot follow-up notice reports for a draft (ticket created, or
 * draft cancelled or expired), keyed by the draft's uuid.
 */
export function parseTicketDraftOutcome(
  sender: string,
  type: string,
  blocks: unknown,
  roomBotUserId: string | null | undefined,
): [string, TicketDraftOutcome] | null {
  for (const block of botBlocks(sender, type, blocks, roomBotUserId)) {
    const draftUuid = uuid(block.draft_uuid);
    if (!draftUuid) continue;
    if (block.key === TICKET_CREATED_BLOCK) {
      return [
        draftUuid,
        {
          state: 'created',
          issueUuid: uuid(block.issue_uuid),
          issueKey: str(block.issue_key, 100),
          edits: parseEdits(block),
        },
      ];
    }
    if (block.key === TICKET_CANCELLED_BLOCK) {
      return [
        draftUuid,
        { state: block.reason === 'expired' ? 'expired' : 'cancelled' },
      ];
    }
  }
  return null;
}
