import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

interface ResourceSummaryButtonProps {
  url: string;
  disabled?: boolean;
}

export const ResourceSummaryButton: React.FC<ResourceSummaryButtonProps> = ({
  disabled,
  url,
}) => {
  const dispatch = useDispatch();
  const showDetailsModal = () => {
    dispatch(
      openModalDialog('resource-summary-modal', {
        resolve: { url },
      }),
    );
  };
  return (
    <Button disabled={disabled} bsSize="small" onClick={showDetailsModal}>
      {translate('Details')}
    </Button>
  );
};
