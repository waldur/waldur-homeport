import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import type { Offering } from './types';

const OfferingReportDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OfferingReportDialog" */ './OfferingReportDialog'
    ),
  'OfferingReportDialog',
);

interface OfferingReportButtonProps {
  offering: Pick<Partial<Offering>, 'report'>;
}

export const openReport = (report) =>
  openModalDialog(OfferingReportDialog, { resolve: { report }, size: 'lg' });

export const OfferingReportButton: React.FC<OfferingReportButtonProps> = ({
  offering,
}) => {
  const dispatch = useDispatch();
  const callback = React.useCallback(
    () => dispatch(openReport(offering.report)),
    [offering.report, dispatch],
  );
  if (!offering.report) {
    return null;
  }
  return (
    <button
      className="btn btn-info pull-right btn-sm m-l-sm"
      onClick={callback}
    >
      <i className="fa fa-book" />
      &nbsp;
      {translate('Show report')}
    </button>
  );
};
