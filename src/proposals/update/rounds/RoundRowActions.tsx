import {
  CalendarIcon,
  CheckSquareIcon,
  ListChecksIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  proposalProtectedCallsRoundsDestroy,
  ProtectedRound,
} from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { openModalDialog } from '@waldur/modal/actions';
import { Call } from '@waldur/proposals/types';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';

const EditRoundSubmissionDialog = lazyComponent(() =>
  import('@waldur/proposals/round/submission/EditRoundSubmissionDialog').then(
    (m) => ({
      default: m.EditRoundSubmissionDialog,
    }),
  ),
);

const EditRoundReviewDialog = lazyComponent(() =>
  import('@waldur/proposals/round/review/EditRoundReviewDialog').then((m) => ({
    default: m.EditRoundReviewDialog,
  })),
);

const EditRoundAllocationDialog = lazyComponent(() =>
  import('@waldur/proposals/round/allocation/EditRoundAllocationDialog').then(
    (m) => ({
      default: m.EditRoundAllocationDialog,
    }),
  ),
);

interface RoundRowActionsProps {
  row: ProtectedRound;
  refetch: () => void;
  call: Call;
}

export const RoundRowActions: FC<RoundRowActionsProps> = ({
  row,
  refetch,
  call,
}) => {
  const dispatch = useDispatch();

  const openEditSubmissionDialog = useCallback(() => {
    dispatch(
      openModalDialog(EditRoundSubmissionDialog, {
        resolve: { round: row, call, refetch },
        size: 'lg',
      }),
    );
  }, [dispatch, row, call, refetch]);

  const openEditReviewDialog = useCallback(() => {
    dispatch(
      openModalDialog(EditRoundReviewDialog, {
        resolve: { round: row, call, refetch },
        size: 'lg',
      }),
    );
  }, [dispatch, row, call, refetch]);

  const openEditAllocationDialog = useCallback(() => {
    dispatch(
      openModalDialog(EditRoundAllocationDialog, {
        resolve: { round: row, call, refetch },
        size: 'lg',
      }),
    );
  }, [dispatch, row, call, refetch]);

  const handleDelete = useCallback(async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Confirm deletion'),
        translate(
          'Are you sure you want to delete round "{name}"? This action cannot be undone.',
          { name: row.name },
        ),
      );
      await proposalProtectedCallsRoundsDestroy({
        path: {
          uuid: call.uuid,
          obj_uuid: row.uuid,
        },
      });
      dispatch(showSuccess(translate('Round has been deleted.')));
      refetch();
    } catch (error) {
      if (error) {
        dispatch(
          showErrorResponse(error, translate('Unable to delete round.')),
        );
      }
    }
  }, [dispatch, row, call, refetch]);

  const hasProposals = row.proposals?.length > 0;

  return (
    <ActionsDropdownComponent>
      <ActionItem
        title={translate('Edit submission settings')}
        action={openEditSubmissionDialog}
        iconNode={<CalendarIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Edit review settings')}
        action={openEditReviewDialog}
        iconNode={<CheckSquareIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Edit allocation settings')}
        action={openEditAllocationDialog}
        iconNode={<ListChecksIcon weight="bold" />}
      />
      <ActionItem
        title={translate('Delete')}
        action={handleDelete}
        iconNode={<TrashIcon weight="bold" />}
        className="text-danger"
        iconColor="danger"
        disabled={hasProposals}
        tooltip={
          hasProposals
            ? translate('Cannot delete a round that has proposals')
            : undefined
        }
      />
    </ActionsDropdownComponent>
  );
};
