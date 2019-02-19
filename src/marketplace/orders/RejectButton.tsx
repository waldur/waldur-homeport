import * as React from 'react';

import { translate } from '@waldur/i18n';
import { wrapTooltip } from '@waldur/table-react/ActionButton';

interface RejectButtonProps {
  onClick: () => void;
  submitting?: boolean;
  tooltip?: string;
}

export const RejectButton = ({onClick, submitting, tooltip}: RejectButtonProps) =>
  wrapTooltip(tooltip, (
    <button
      type="button"
      className="btn btn-danger btn-sm"
      onClick={onClick}
      disabled={submitting}>
        <i className="fa fa-ban"/>
        {' '}
        {translate('Reject')}
        {' '}
        {submitting && <i className="fa fa-spinner fa-spin m-r-xs"/>}
    </button>
  )
);
