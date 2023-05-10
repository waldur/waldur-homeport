import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import { getUser } from '@waldur/workspace/selectors';

const QuickIssueContainer = lazyComponent(
  () => import('../navigation/header/quick-issue-drawer/QuickIssueContainer'),
  'QuickIssueContainer',
);

export const IssuesLink: React.FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);

  const openDrawer = () => {
    dispatch(
      openDrawerDialog(QuickIssueContainer, {
        title: translate('Issues'),
      }),
    );
  };

  return hasSupport && user ? (
    <span className="menu-link px-2">
      <span className="menu-title" onClick={openDrawer}>
        {translate('Issues')}
      </span>
    </span>
  ) : null;
};
