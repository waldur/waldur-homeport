import {
  CallProposalRole,
  proposalProtectedCallsProposalRolesDestroy,
} from 'waldur-js-client';

import { EditModalButton } from '@/core/buttons';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { Call } from '../../types';

const ProposalRoleFormDialog = lazyComponent(() =>
  import('./ProposalRoleFormDialog').then((module) => ({
    default: module.ProposalRoleFormDialog,
  })),
);

interface ProposalRoleActionProps {
  row: CallProposalRole;
  call: Call;
  refetch(): void;
}

export const ProposalRoleEditAction = ({
  row,
  call,
  refetch,
}: ProposalRoleActionProps) => (
  <EditModalButton
    dialog={ProposalRoleFormDialog}
    row={row}
    buildResolve={(role) => ({ call, role, refetch })}
    size="md"
  />
);

export const ProposalRoleDeleteAction = ({
  row,
  call,
  refetch,
}: ProposalRoleActionProps) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProtectedCallsProposalRolesDestroy({
        path: { uuid: call.uuid, obj_uuid: row.uuid },
      }),
    refetch,
    confirmation: {
      title: translate('Delete evaluator role'),
      body: translate(
        'Delete the role {name}? A role that has been assigned on a proposal, or that a workflow step uses, cannot be deleted.',
        { name: row.name },
      ),
      options: { forDeletion: true },
    },
    successMessage: translate('The evaluator role has been deleted.'),
    errorMessage: translate('Unable to delete the evaluator role.'),
  });
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
