import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { proposalProposalsResourcesDestroy } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Proposal, ProposalResource } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';
import { ActionsDropdown } from '@/table/ActionsDropdown';

const ResourceRequestFormDialog = lazyComponent(() =>
  import('./ResourceRequestFormDialog').then((module) => ({
    default: module.ResourceRequestFormDialog,
  })),
);

interface ResourceRequestItemActionsProps {
  row: ProposalResource;
  proposal: Proposal;
  refetch;
}

const EditResourceRequestAction = ({ row, proposal, refetch }) => {
  const { openDialog } = useModal();
  const openEditResourceDialog = useCallback(
    () =>
      openDialog(ResourceRequestFormDialog, {
        resolve: { resourceRequest: row, proposal, refetch },
        size: 'lg',
      }),
    [row, proposal, refetch],
  );
  return (
    <ActionItem
      action={openEditResourceDialog}
      title={translate('Edit')}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};

const RemoveResourceRequestAction = ({ row, proposal, refetch }) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      proposalProposalsResourcesDestroy({
        path: { uuid: proposal.uuid, obj_uuid: row.uuid },
      }),
    confirmation: {
      title: translate('Removing resource request'),
      body: translate(
        'Are you sure you want to remove the {name} resource request?',
        {
          name: <b>{row.requested_offering.offering_name}</b>,
        },
        formatJsxTemplate,
      ),
    },
    successMessage: translate('Resource request has been deleted.'),
    errorMessage: translate('Unable to delete resource request.'),
    refetch,
  });

  return (
    <RemovalActionItem
      action={mutate}
      title={translate('Remove')}
      disabled={isPending}
    />
  );
};

export const ResourceRequestItemActions = ({
  row,
  proposal,
  refetch,
}: ResourceRequestItemActionsProps) => {
  return (
    <ActionsDropdown row={row} refetch={refetch} data={{ proposal }}>
      <EditResourceRequestAction
        row={row}
        proposal={proposal}
        refetch={refetch}
      />
      <RemoveResourceRequestAction
        row={row}
        proposal={proposal}
        refetch={refetch}
      />
    </ActionsDropdown>
  );
};
