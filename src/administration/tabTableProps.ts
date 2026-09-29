import { TableWithPortal } from '@/table/types';

/**
 * Table props for a list rendered as a tab of a TableWithTabs page: its
 * toolbar goes to the page's toolbar and its card chrome is dropped, since the
 * page supplies both. Without a portal the list is a page of its own and keeps
 * the defaults.
 */
export const tabTableProps = (portal?: TableWithPortal['portal']) =>
  portal
    ? { portal, hasActionBar: false, cardBordered: false, fullWidth: true }
    : {};
