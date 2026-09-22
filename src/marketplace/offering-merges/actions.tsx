import {
  ArrowCounterClockwiseIcon,
  EyeIcon,
  PlayIcon,
} from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FC, useMemo } from 'react';
import {
  marketplaceOfferingMergesDestroy,
  marketplaceOfferingMergesExecute,
  marketplaceOfferingMergesUndo,
  OfferingMerge,
  OfferingMergeRefusal,
} from 'waldur-js-client';

import { BaseButton } from '@/core/buttons/BaseButton';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

import { DETAILS_STATE, MERGE_QUERY_KEY, MERGES_TABLE_ID } from './constants';
import { useCanManageMerges } from './hooks';
import { getMergeRefusal } from './MergeRefusal';
import { getExecuteBlockers, getMergeStateLabel, isEditable } from './utils';

const mergeInvalidations = (uuid: string) => [
  { queryKey: MERGE_QUERY_KEY(uuid) },
  { queryKey: ['table', MERGES_TABLE_ID] },
];

const UNDO_EXPLANATION = () =>
  translate(
    'Undo moves the resources, orders, usage and other rows back to the source offerings, restores their plans and components, unarchives the sources and puts the invoice items back as they were before the merge. Items on invoices closed since the merge stay as they are. Undo is refused if anything changed on the moved rows since the merge.',
  );

const getUndoDisabledReason = (merge: OfferingMerge) =>
  merge.state === 'done'
    ? undefined
    : translate('Only a done merge can be undone. This one is {state}.', {
        state: getMergeStateLabel(merge.state),
      });

const getDeleteDisabledReason = (merge: OfferingMerge) =>
  isEditable(merge.state)
    ? undefined
    : translate('Only a draft or previewed merge can be deleted.');

type RefusalHandler = (refusal: OfferingMergeRefusal | null) => void;

const useUndoMutation = (
  merge: OfferingMerge,
  refetch?: () => void,
  onRefused?: RefusalHandler,
) => {
  const confirmation = useMemo(
    () => ({
      title: translate('Undo merge'),
      body: UNDO_EXPLANATION(),
    }),
    [],
  );
  return useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      marketplaceOfferingMergesUndo({ path: { uuid: merge.uuid } }),
    confirmation,
    successMessage: translate('Undo has been queued.'),
    errorMessage: translate('Unable to undo the merge.'),
    invalidateQueries: mergeInvalidations(merge.uuid),
    refetch,
    closeModal: false,
    onSuccess: () => onRefused?.(null),
    onError: (error) => onRefused?.(getMergeRefusal(error)),
  });
};

export const UndoMergeButton: FC<{
  merge: OfferingMerge;
  /** Receives the refusal body of a refused undo, or null on success. */
  onRefused?: RefusalHandler;
}> = ({ merge, onRefused }) => {
  const canManage = useCanManageMerges();
  const { mutate, isPending } = useUndoMutation(merge, undefined, onRefused);
  if (!canManage) {
    return null;
  }
  const reason = getUndoDisabledReason(merge);
  return (
    <BaseButton
      label={translate('Undo merge')}
      variant="danger"
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
      onClick={() => mutate()}
      disabled={Boolean(reason) || isPending}
      disabledReason={reason}
      pending={isPending}
    />
  );
};

interface ExecuteMergeButtonProps {
  merge: OfferingMerge;
  acknowledged: string[];
  unsavedChanges?: boolean;
  /** Receives the refusal body of a refused execute, or null on success. */
  onRefused?: RefusalHandler;
}

export const ExecuteMergeButton: FC<ExecuteMergeButtonProps> = ({
  merge,
  acknowledged,
  unsavedChanges,
  onRefused,
}) => {
  const canManage = useCanManageMerges();
  const { mutate, isPending } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      marketplaceOfferingMergesExecute({
        path: { uuid: merge.uuid },
        body: { acknowledged_warnings: acknowledged },
      }),
    successMessage: translate('The merge has been queued.'),
    errorMessage: translate('Unable to run the merge.'),
    invalidateQueries: mergeInvalidations(merge.uuid),
    closeModal: false,
    onSuccess: () => onRefused?.(null),
    onError: (error) => onRefused?.(getMergeRefusal(error)),
  });
  if (!canManage) {
    return null;
  }
  const blockers = getExecuteBlockers(merge, acknowledged, unsavedChanges);
  return (
    <BaseButton
      label={translate('Run merge')}
      variant="primary"
      iconNode={<PlayIcon weight="bold" />}
      onClick={() => mutate()}
      disabled={blockers.length > 0 || isPending}
      disabledReason={blockers.join(' ')}
      pending={isPending}
    />
  );
};

interface RowActionProps {
  row: OfferingMerge;
  refetch?: () => void;
}

export const OpenMergeAction: FC<RowActionProps> = ({ row }) => {
  const router = useRouter();
  return (
    <ActionItem
      title={translate('Open')}
      iconNode={<EyeIcon weight="bold" />}
      action={() =>
        router.stateService.go(DETAILS_STATE, { merge_uuid: row.uuid })
      }
    />
  );
};

export const UndoMergeAction: FC<RowActionProps> = ({ row, refetch }) => {
  const canManage = useCanManageMerges();
  const { mutate, isPending } = useUndoMutation(row, refetch);
  if (!canManage) {
    return null;
  }
  const reason = getUndoDisabledReason(row);
  return (
    <ActionItem
      title={translate('Undo')}
      iconNode={<ArrowCounterClockwiseIcon weight="bold" />}
      action={() => mutate()}
      disabled={Boolean(reason) || isPending}
      tooltip={reason}
    />
  );
};

export const DeleteMergeAction: FC<RowActionProps> = ({ row, refetch }) => {
  const canManage = useCanManageMerges();
  const confirmation = useMemo(
    () => ({
      title: translate('Delete merge'),
      body: translate(
        'The merge record and its mappings are deleted. Nothing was merged yet, so no offering changes.',
      ),
    }),
    [],
  );
  const { mutate, isPending } = useManagedMutation<unknown, unknown, void>({
    mutationFn: () =>
      marketplaceOfferingMergesDestroy({ path: { uuid: row.uuid } }),
    confirmation,
    successMessage: translate('The merge has been deleted.'),
    errorMessage: translate('Unable to delete the merge.'),
    refetch,
    closeModal: false,
  });
  if (!canManage) {
    return null;
  }
  const reason = getDeleteDisabledReason(row);
  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={() => mutate()}
      disabled={Boolean(reason) || isPending}
      tooltip={reason}
    />
  );
};
