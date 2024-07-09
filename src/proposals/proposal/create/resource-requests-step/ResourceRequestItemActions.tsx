import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { removeProposalResource } from '@waldur/proposals/api';
import { Proposal, ProposalResource } from '@waldur/proposals/types';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RowActionButton } from '@waldur/table/ActionButton';

const ResourceRequestFormDialog = lazyComponent(
  () => import('./ResourceRequestFormDialog'),
  'ResourceRequestFormDialog',
);

interface ResourceRequestItemActionsProps {
  row: ProposalResource;
  proposal: Proposal;
  refetch;
}

export const ResourceRequestItemActions = ({
  row,
  proposal,
  refetch,
}: ResourceRequestItemActionsProps) => {
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

  const { mutate: remove, isLoading: isRemoving } = useMutation(async () => {
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
      await removeProposalResource(proposal.uuid, row.uuid);
      refetch && refetch();
      dispatch(showSuccess(translate('Resource request has been deleted.')));
    } catch (response) {
      dispatch(
        showErrorResponse(
          response,
          translate('Unable to delete resource request.'),
        ),
      );
    }
  });

  return (
    <>
      <RowActionButton
        action={openEditResourceDialog}
        title={translate('Edit')}
        size="sm"
      />
      <RowActionButton
        action={remove}
        title={translate('Remove')}
        pending={isRemoving}
        size="sm"
      />
    </>
  );
};
