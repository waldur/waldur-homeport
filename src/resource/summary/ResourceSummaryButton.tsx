import React from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const ResourceSummaryModal = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "ResourceSummaryModal" */ './ResourceSummaryModal'
    ),
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
    <Button disabled={disabled} bsSize="small" onClick={showDetailsModal}>
      {translate('Details')}
    </Button>
  );
};
