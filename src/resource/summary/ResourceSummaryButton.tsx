import React from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { RowActionButton } from '@waldur/table/ActionButton';

const ResourceSummaryModal = lazyComponent(
  () => import('./ResourceSummaryModal'),
  'ResourceSummaryModal',
);

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
      openModalDialog(ResourceSummaryModal, {
        resolve: { url },
      }),
    );
  };
  return (
    <RowActionButton
      title={translate('Details')}
      size="sm"
      action={showDetailsModal}
      disabled={disabled}
    />
  );
};
