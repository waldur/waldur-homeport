import { Issue } from 'waldur-js-client';

/**
 * `Issue.provider_ticket_info` is an untyped bag (backend `SerializerMethodField`).
 * Returns a string accessor over it, so call sites don't each repeat the
 * cast-and-stringify boilerplate.
 */
export const providerTicketInfo = (issue: Issue) => {
  const info = (issue.provider_ticket_info ?? {}) as Record<string, unknown>;
  return (key: string): string | null =>
    info[key] != null ? String(info[key]) : null;
};
