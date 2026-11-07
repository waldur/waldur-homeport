import {
  CallPanel,
  proposalProtectedCallsPanelsDestroy,
} from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { Call } from '../../types';

const CallPanelFormDialog = lazyComponent(() =>
  import('./CallPanelFormDialog').then((module) => ({
    default: module.CallPanelFormDialog,
  })),
);

interface CallPanelActionProps {
  row: CallPanel;
  call: Call;
  refetch(): void;
}

export const CallPanelEditAction = ({
  row,
  call,
  refetch,
}: CallPanelActionProps) => (
  <EditModalButton
    dialog={CallPanelFormDialog}
    row={row}
    buildResolve={(panel) => ({ call, panel, refetch })}
    size="lg"
  />
);

export const CallPanelDeleteAction = ({
  row,
  call,
  refetch,
}: CallPanelActionProps) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProtectedCallsPanelsDestroy({
        path: { uuid: call.uuid, obj_uuid: row.uuid },
      }),
    refetch,
    confirmation: {
      title: translate('Delete panel'),
      body: translate(
        'Delete the panel {name}? A panel proposals are routed to cannot be deleted.',
        { name: row.name },
      ),
      options: { forDeletion: true },
    },
    successMessage: translate('The panel has been deleted.'),
    errorMessage: translate('Unable to delete the panel.'),
  });
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending || row.proposals_count > 0}
      tooltip={
        row.proposals_count > 0
          ? translate('Proposals are routed to this panel.')
          : undefined
      }
    />
  );
};
