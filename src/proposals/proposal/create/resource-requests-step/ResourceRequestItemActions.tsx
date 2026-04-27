import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { proposalProposalsResourcesDestroy } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { formatJsxTemplate, translate } from '@/i18n';
import { openModalDialog, waitForConfirmation } from '@/modal/actions';
import { Proposal, ProposalResource } from '@/proposals/types';
import { ActionItem } from '@/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@/store/notify';
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
  const dispatch = useDispatch();
  const openEditResourceDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(ResourceRequestFormDialog, {
          resolve: { resourceRequest: row, proposal, refetch },
          size: 'lg',
        }),
      ),
    [dispatch, row, proposal, refetch],
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
  const dispatch = useDispatch();
  const { mutate: remove, isPending: isRemoving } = useMutation({
    mutationFn: async () => {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Removing resource request'),
          translate(
            'Are you sure you want to remove the {name} resource request?',
            {
              name: <b>{row.requested_offering.offering_name}</b>,
            },
            formatJsxTemplate,
          ),
        );
      } catch {
        return;
      }
      try {
        await proposalProposalsResourcesDestroy({
          path: { uuid: proposal.uuid, obj_uuid: row.uuid },
        });
        if (refetch) refetch();
        dispatch(showSuccess(translate('Resource request has been deleted.')));
      } catch (response) {
        dispatch(
          showErrorResponse(
            response,
            translate('Unable to delete resource request.'),
          ),
        );
      }
    },
  });

  return (
    <ActionItem
      action={remove}
      title={translate('Remove')}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      disabled={isRemoving}
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
