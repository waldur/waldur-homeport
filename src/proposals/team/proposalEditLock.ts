import { createContext, useContext } from 'react';

/**
 * Whether the proposal page is locked for a viewer off its team who could
 * change it -- staff, say -- until they unlock editing on purpose
 * (ProposalEditLock). The team panels read it: locked, the team is
 * read-only too.
 */
export const ProposalEditLockContext = createContext<{ locked: boolean }>({
  locked: false,
});

export const useProposalEditLocked = () =>
  useContext(ProposalEditLockContext).locked;
