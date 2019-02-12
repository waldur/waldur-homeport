import * as React from 'react';

import { translate } from '@waldur/i18n';
import { wrapTooltip } from '@waldur/table-react/ActionButton';

interface ApproveButtonProps {
  onClick: () => void;
  submitting?: boolean;
  tooltip?: string;
}

export const ApproveButton: React.SFC<ApproveButtonProps> = ({onClick, submitting, tooltip}: ApproveButtonProps) =>
  wrapTooltip(tooltip, (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={onClick}
      disabled={submitting}>
        <i className="fa fa-check"/>
        {' '}
        {translate('Approve')}
        {' '}
        {submitting && <i className="fa fa-spinner fa-spin m-r-xs"/>}
    </button>
  )
);
