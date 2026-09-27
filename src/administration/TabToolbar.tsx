import { FC, PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';

import { TableWithPortal } from '@/table/types';

/**
 * Renders a tab's actions into the toolbar of the TableWithTabs page that
 * hosts it, where a Table tab puts its own toolbar. Without a portal target
 * (the page is not mounted as a tab yet) nothing is rendered.
 */
export const TabToolbar: FC<
  PropsWithChildren<{ portal?: TableWithPortal['portal'] }>
> = ({ portal, children }) =>
  portal?.toolbar ? createPortal(children, portal.toolbar) : null;
