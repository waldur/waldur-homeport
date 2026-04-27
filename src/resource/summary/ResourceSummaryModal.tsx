import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

import { get } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';

import { ResourceSummary } from './ResourceSummary';

export const ResourceSummaryModal: FC<{ resolve: { url } }> = ({
  resolve: { url },
}) => {
  const { isLoading, data } = useQuery({
    queryKey: ['ResourceSummaryModal', url],

    queryFn: () => get(url),
  });
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
