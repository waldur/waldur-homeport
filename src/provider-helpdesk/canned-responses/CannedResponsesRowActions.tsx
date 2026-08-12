import { TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ProviderCannedResponse } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { useDeleteCannedResponse } from '../api';

const CannedResponseDialog = lazyComponent(() =>
  import('./CannedResponseDialog').then((module) => ({
    default: module.CannedResponseDialog,
  })),
);

export const CannedResponsesRowActions: FC<{
  row: ProviderCannedResponse;
  fetch: () => void;
}> = ({ row, fetch }) => {
  const { openDialog } = useModal();
  const deleteMutation = useDeleteCannedResponse(fetch);
  return (
    <ActionsDropdown row={row} refetch={fetch}>
      <EditAction
        action={() =>
          openDialog(CannedResponseDialog, {
            resolve: {
              helpdeskUuid: row.provider_helpdesk,
              response: row,
              refetch: fetch,
            },
          })
        }
      />
      <ActionItem
        title={translate('Delete')}
        iconNode={<TrashIcon weight="bold" />}
        iconColor="danger"
        className="text-danger"
        action={() => deleteMutation.mutate({ uuid: row.uuid })}
      />
    </ActionsDropdown>
  );
};
