import { PencilSimpleIcon } from '@phosphor-icons/react';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

import { RequestTypeAdmin } from './api';

const RequestTypeFormDialog = lazyComponent(() =>
  import('./RequestTypeForm').then((module) => ({
    default: module.RequestTypeForm,
  })),
);

export const RequestTypeEditAction = ({
  row,
  refetch,
}: {
  row: RequestTypeAdmin;
  refetch: () => void;
}) => {
  const { openDialog } = useModal();
  return (
    <ActionItem
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
      action={() =>
        openDialog(RequestTypeFormDialog, {
          size: 'lg',
          resolve: { requestType: row, refetch },
        })
      }
    />
  );
};
