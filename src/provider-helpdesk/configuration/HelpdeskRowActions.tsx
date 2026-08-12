import { ArrowsClockwiseIcon, TrashIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { ProviderHelpdesk } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

import { useDeleteHelpdesk, useValidateHelpdesk } from '../api';
import { useRefreshWorkspaceCustomer } from '../common/useRefreshWorkspaceCustomer';

const HelpdeskSettingsForm = lazyComponent(() =>
  import('./HelpdeskSettingsForm').then((module) => ({
    default: module.HelpdeskSettingsForm,
  })),
);

export const HelpdeskRowActions: FC<{
  row: ProviderHelpdesk;
  fetch: () => void;
}> = ({ row, fetch }) => {
  const { openDialog } = useModal();
  const refreshWorkspaceCustomer = useRefreshWorkspaceCustomer();
  const validateMutation = useValidateHelpdesk(fetch);
  // Hide the Helpdesk mode tab without a page reload once has_active_helpdesk
  // flips to false after deletion.
  const deleteMutation = useDeleteHelpdesk(async () => {
    fetch();
    await refreshWorkspaceCustomer();
  });
  return (
    <ActionsDropdown row={row} refetch={fetch}>
      <EditAction
        action={() =>
          openDialog(HelpdeskSettingsForm, {
            resolve: {
              serviceProviderUuid: row.service_provider,
              helpdesk: row,
              refetch: fetch,
            },
          })
        }
      />
      <ActionItem
        title={translate('Validate')}
        iconNode={<ArrowsClockwiseIcon weight="bold" />}
        action={() => validateMutation.mutate({ uuid: row.uuid })}
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
