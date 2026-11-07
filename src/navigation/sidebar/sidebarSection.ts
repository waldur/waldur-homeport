import { StateDeclaration } from '@uirouter/core';

/** A top-level sidebar accordion that opens by itself on its own pages. */
export type SidebarSection = 'resources' | 'calls';

/** The entry of the Calls accordion that stands for a page. */
export type CallsSidebarItem =
  | 'manage-calls'
  | 'calls-for-proposals'
  | 'my-proposals'
  | 'my-reviews'
  | 'all-proposals'
  | 'all-reviews'
  | 'provider-calls';

/**
 * Route `data` that places a page in the sidebar.
 *
 * UI-Router builds a state's `data` on top of its parent's, so setting this on
 * the abstract root of an area covers every page under it, including pages
 * added later. A hard-coded list of page names did not: every tab or detail
 * page nobody remembered to add collapsed the section it belongs to.
 */
export const callsSection = (item: CallsSidebarItem) => ({
  sidebarSection: 'calls' as const,
  sidebarItem: item,
});

export const resourcesSection = {
  sidebarSection: 'resources' as const,
};

export const getSidebarSection = (
  state: StateDeclaration | undefined,
): SidebarSection | undefined => state?.data?.sidebarSection;

export const getCallsSidebarItem = (
  state: StateDeclaration | undefined,
): CallsSidebarItem | undefined =>
  getSidebarSection(state) === 'calls' ? state.data.sidebarItem : undefined;

/**
 * The entries of the Calls area that are operators' work, as opposed to
 * everyone's: browsing calls and one's own proposals and tasks. In calls-only
 * mode only these sit in an accordion; the rest are top-level entries.
 */
const CALL_MANAGEMENT_ITEMS: CallsSidebarItem[] = [
  'manage-calls',
  'provider-calls',
  'all-proposals',
  'all-reviews',
];

export const isCallManagementItem = (item: CallsSidebarItem | undefined) =>
  CALL_MANAGEMENT_ITEMS.includes(item);
