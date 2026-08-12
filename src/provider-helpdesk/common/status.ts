// Terminal ticket statuses — assignment and the resolve action are unavailable
// once a ticket reaches one of these.
const RESOLVED_STATUSES = ['resolved', 'closed', 'canceled', 'cancelled'];

export const isResolvedStatus = (status?: string | null): boolean =>
  RESOLVED_STATUSES.includes((status ?? '').toLowerCase());
