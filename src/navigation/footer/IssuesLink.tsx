import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import { useUser } from '@waldur/workspace/hooks';

const QuickIssueContainer = lazyComponent(() =>
  import('../../navigation/header/quick-issue-drawer/QuickIssueContainer').then(
    (module) => ({ default: module.QuickIssueContainer }),
  ),
);

export const IssuesLink: React.FC = () => {
  const dispatch = useDispatch();
  const user = useUser();
  const showIssues = useSelector(hasSupport);

  const openDrawer = () => {
    dispatch(
      openDrawerDialog(QuickIssueContainer, {
        title: translate('Issues'),
      }),
    );
  };

  return showIssues && user ? (
    <div className="menu-item">
      <span
        className="menu-link px-3"
        role="button"
        onKeyDown={openDrawer}
        onClick={openDrawer}
        tabIndex={-1}
      >
        <span className="menu-title">{translate('Issues')}</span>
      </span>
    </div>
  ) : null;
};
