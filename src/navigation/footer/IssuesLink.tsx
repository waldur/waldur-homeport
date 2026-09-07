import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import React from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { useUser } from '@/workspace/hooks';

const QuickIssueContainer = lazyComponent(() =>
  import('../../navigation/header/quick-issue-drawer/QuickIssueContainer').then(
    (module) => ({ default: module.QuickIssueContainer }),
  ),
);

/**
 * Uses RadixDropdownMenu.Item directly rather than NavMenuItem: the `<li
 * className="menu-item">` here already matches footer/MenuItem.tsx's own
 * sibling `<li>`s in the same list, and NavMenuItem (NavMenu.tsx) wraps
 * its own `<div className="menu-item">` around Item — stacking the two
 * would double up `.menu-item`. Selecting it (opens a drawer) closes the
 * footer dropdown, which is fine: the drawer covers the same screen area
 * regardless.
 */
export const IssuesLink: React.FC = () => {
  const { openDrawer } = useDrawer();
  const user = useUser();
  const showIssues = hasSupport();

  const handleOpenDrawer = () => {
    openDrawer(QuickIssueContainer, {
      title: translate('Issues'),
    });
  };

  return showIssues && user ? (
    <li className="menu-item">
      <RadixDropdownMenu.Item
        className="menu-link px-3"
        onSelect={handleOpenDrawer}
      >
        <span className="menu-title">{translate('Issues')}</span>
      </RadixDropdownMenu.Item>
    </li>
  ) : null;
};
