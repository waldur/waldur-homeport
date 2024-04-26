import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { fetchResource } from './api';
import { ResourceSummary } from './ResourceSummary';

export const ResourceSummaryModal: FC<{ resolve: { url } }> = ({
  resolve: { url },
}) => {
  const { isLoading, data } = useQuery(['ResourceSummaryModal', url], () =>
    fetchResource(url),
  );
  return (
    <ModalDialog
      title={translate('Details')}
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        data && <ResourceSummary resource={data} />
      )}
    </ModalDialog>
  );
};
