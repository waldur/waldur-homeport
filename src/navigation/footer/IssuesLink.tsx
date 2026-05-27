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
    <div className="menu-item">
      <span
        className="menu-link px-3"
        role="button"
        onKeyDown={handleOpenDrawer}
        onClick={handleOpenDrawer}
        tabIndex={-1}
      >
        <span className="menu-title">{translate('Issues')}</span>
      </span>
    </div>
  ) : null;
};
