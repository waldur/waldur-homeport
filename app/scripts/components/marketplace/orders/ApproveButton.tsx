import * as React from 'react';

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
    Approve
    {' '}
    {submitting && <i className="fa fa-spinner fa-spin m-r-xs"/>}
  </button>
);
