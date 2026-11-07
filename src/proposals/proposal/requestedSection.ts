// The section of the proposal page a link asked for, so the page opens it
// as well as scrolling to it: a task names where its work is, and a
// collapsed card there hides it. The call manager's route drops the URL
// hash, so a link hands it over here; a pasted link still has its hash.
// Kept per proposal rather than taken once: the page may mount its
// sections more than once while it loads.
let requested: { proposalUuid: string; sectionId: string } | undefined;

export const requestSection = (proposalUuid: string, sectionId: string) => {
  requested = { proposalUuid, sectionId };
};

/** The section asked for on this proposal's page, if any. */
export const requestedSectionOf = (proposalUuid: string): string | undefined =>
  requested?.proposalUuid === proposalUuid
    ? requested.sectionId
    : window.location.hash.slice(1) || undefined;
