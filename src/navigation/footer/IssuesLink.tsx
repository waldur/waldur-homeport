import React from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { useUser } from '@/workspace/hooks';

import { FooterDropdownItem } from './FooterDropdownItems';

const QuickIssueContainer = lazyComponent(() =>
  import('../../navigation/header/quick-issue-drawer/QuickIssueContainer').then(
    (module) => ({ default: module.QuickIssueContainer }),
  ),
);

/**
 * Selecting it (opens a drawer) closes the footer dropdown, which is fine:
 * the drawer covers the same screen area regardless.
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
    <FooterDropdownItem onSelect={handleOpenDrawer}>
      {translate('Issues')}
    </FooterDropdownItem>
  ) : null;
};
