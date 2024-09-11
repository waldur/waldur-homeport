import { ChatsCircle } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';

const QuickIssueContainer = lazyComponent(
  () => import('./quick-issue-drawer/QuickIssueContainer'),
  'QuickIssueContainer',
);

export const QuickIssueDrawerToggle: React.FC = () => {
  const dispatch = useDispatch();

  const openDrawer = () => {
    dispatch(
      openDrawerDialog(QuickIssueContainer, {
        title: translate('Issues'),
      }),
    );
  };

  return (
    <div className="d-flex align-items-center ms-1 ms-lg-3">
      <button
        id="quick-issue-toggle"
        type="button"
        className="btn btn-icon btn-icon-grey-500 btn-active-secondary w-35px h-35px w-md-40px h-md-40px"
        onClick={openDrawer}
      >
        <span className="svg-icon" title={translate('Issues')}>
          <ChatsCircle className="w-20px h-20px" weight="bold" />
        </span>
      </button>
    </div>
  );
};
