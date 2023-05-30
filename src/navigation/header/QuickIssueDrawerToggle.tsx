import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { InlineSVG } from '@waldur/core/svg/InlineSVG';
import { openDrawerDialog } from '@waldur/drawer/actions';
import { translate } from '@waldur/i18n';

const QuickIssueContainer = lazyComponent(
  () => import('./quick-issue-drawer/QuickIssueContainer'),
  'QuickIssueContainer',
);

const icon = require('./issue.svg');

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
      <div
        id="quick-issue-toggle"
        className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary position-relative w-35px h-35px w-md-40px h-md-40px"
        onClick={openDrawer}
      >
        <InlineSVG
          path={icon}
          className="svg-icon-1"
          tooltipText={translate('Issues')}
        />
      </div>
    </div>
  );
};
