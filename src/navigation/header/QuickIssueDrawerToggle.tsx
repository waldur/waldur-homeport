import { ChatsCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';

const QuickIssueContainer = lazyComponent(() =>
  import('./quick-issue-drawer/QuickIssueContainer').then((module) => ({
    default: module.QuickIssueContainer,
  })),
);

export const QuickIssueDrawerToggle: React.FC = () => {
  const dispatch = useDispatch();

  const openDrawer = () => {
    dispatch(
      openDrawerDialog(QuickIssueContainer, {
        title: translate('Support requests'),
      }),
    );
  };

  return (
    <div className="d-flex align-items-center ms-1">
      <button
        id="quick-issue-toggle"
        type="button"
        className="btn-nav-item"
        onClick={openDrawer}
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
