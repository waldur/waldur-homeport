import {
  CheckCircleIcon,
  ProhibitIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { ProviderSupportUser } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { useDeleteSupportUser, useUpdateSupportUser } from '../api';

const SupportUserDialog = lazyComponent(() =>
  import('./SupportUserDialog').then((module) => ({
    default: module.SupportUserDialog,
  })),
);

export const ProviderTeamRowActions: FC<{
  row: ProviderSupportUser;
  fetch: () => void;
}> = ({ row, fetch }) => {
  const { openDialog } = useModal();
  const updateMutation = useUpdateSupportUser(fetch);
  const deleteMutation = useDeleteSupportUser(fetch);
  return (
    <ActionsDropdown row={row} refetch={fetch}>
      <EditAction
        action={() =>
          openDialog(SupportUserDialog, {
            resolve: {
              helpdeskUuid: row.provider_helpdesk,
              user: row,
              refetch: fetch,
            },
          })
        }
      />
      <ActionItem
        title={row.is_active ? translate('Deactivate') : translate('Activate')}
        iconNode={
          row.is_active ? (
            <ProhibitIcon weight="bold" />
          ) : (
            <CheckCircleIcon weight="bold" />
          )
        }
        action={() =>
          updateMutation.mutate({
            uuid: row.uuid,
            body: { is_active: !row.is_active },
          })
        }
      />
      <ActionItem
        title={translate('Remove')}
        iconNode={<TrashIcon weight="bold" />}
        iconColor="danger"
        className="text-danger"
        action={() => deleteMutation.mutate({ uuid: row.uuid })}
      />
    </ActionsDropdown>
  );
};
