import { ChatsCircleIcon } from '@phosphor-icons/react';
import React from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { useDrawer } from '@/drawer/actions';
import { translate } from '@/i18n';

const QuickIssueContainer = lazyComponent(() =>
  import('./quick-issue-drawer/QuickIssueContainer').then((module) => ({
    default: module.QuickIssueContainer,
  })),
);

export const QuickIssueDrawerToggle: React.FC = () => {
  const { openDrawer } = useDrawer();

  const handleOpenDrawer = () => {
    openDrawer(QuickIssueContainer, {
      title: translate('Support requests'),
    });
  };

  return (
    <div className="d-flex align-items-center ms-1">
      <button
        id="quick-issue-toggle"
        type="button"
        className="btn-nav-item"
        onClick={handleOpenDrawer}
      >
        <span
          className="svg-icon svg-icon-2"
          title={translate('Support requests')}
        >
          <ChatsCircleIcon weight="bold" />
        </span>
      </button>
    </div>
  );
};
