import * as React from 'react';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { Offering } from './types';

interface OfferingReportButtonProps {
  offering: Pick<Partial<Offering>, 'report'>;
}

export const openReport = report =>
  openModalDialog('offeringReportDialog', { resolve: { report }, size: 'lg' });

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
