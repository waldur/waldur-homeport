import * as React from 'react';

import { translate } from '@waldur/i18n';

interface ApproveButtonProps {
  onClick: () => void;
  submitting?: boolean;
}

export const ApproveButton: React.SFC<ApproveButtonProps> = ({onClick, submitting}: ApproveButtonProps) => (
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
);
