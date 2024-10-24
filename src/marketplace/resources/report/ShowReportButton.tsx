import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { Report } from '@waldur/marketplace/resources/types';
import { openModalDialog } from '@waldur/modal/actions';

const ShowReportDialog = lazyComponent(
  () => import('./ShowReportDialog'),
  'ShowReportDialog',
);

interface ShowReportButtonProps {
  report: Report;
}

const openReport = (report) =>
  openModalDialog(ShowReportDialog, { resolve: { report }, size: 'lg' });

export const ShowReportButton: React.FC<ShowReportButtonProps> = ({
  report,
}) => {
  const dispatch = useDispatch();
  const callback = React.useCallback(
    () => dispatch(openReport(report)),
    [report, dispatch],
  );
  if (!report) {
    return null;
  }
  return (
    <button className="btn btn-info pull-right btn-sm ms-2" onClick={callback}>
      <i className="fa fa-book" />
      &nbsp;
      {translate('Show report')}
    </button>
  );
};
