/**
 * What the components need of a proposal: its uuid. The apps hold richer
 * proposal objects (the SDK's Proposal, the portal's own type); any of them
 * fits.
 */
export interface ProposalRef {
  uuid: string;
}
