import { Query } from '@tanstack/react-query';

const PREFIX = 'marketplace-offering-group-';
const SUFFIX = '-offerings';

export const offeringGroupOfferingsTableKey = (groupUuid: string) =>
  `${PREFIX}${groupUuid}${SUFFIX}`;

// Matches the offerings table of every expanded group. Moving an offering
// changes two groups: the one it joins and the one it leaves, which the
// dialog does not know.
export const isOfferingGroupOfferingsQuery = (query: Query) => {
  const [scope, table] = query.queryKey;
  return (
    scope === 'table' &&
    typeof table === 'string' &&
    table.startsWith(PREFIX) &&
    table.endsWith(SUFFIX)
  );
};
