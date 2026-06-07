import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { AssignmentBatchList, assignmentBatchesSend } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { ActionItem } from '@/resource/actions/ActionItem';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';

interface SendDraftsBulkActionProps {
  rows: AssignmentBatchList[];
  refetch: () => void;
}

export const SendDraftsBulkAction: FC<SendDraftsBulkActionProps> = ({
  rows,
  refetch,
}) => {
  const draftRows = rows.filter((row) => row.status === 'draft');

  const { mutate, isPending } = useBatchMutation<AssignmentBatchList, void>({
    rows: draftRows,
    refetch,
    mutationFn: (row) => assignmentBatchesSend({ path: { uuid: row.uuid } }),
    successMessage: translate('Sent {count} assignment batches.', {
      count: draftRows.length,
    }),
    renderPartialSuccessMessage: (n) =>
      translate('Sent {n} assignment batches.', { n }),
    errorMessage: translate('Unable to send assignment batches.'),
    renderErrorMessage: (n) =>
      translate('{n} assignment batches could not be sent.', { n }),
  });

  return (
    <ActionDropdownButton title={translate('All actions')}>
      <ActionItem
        title={`${translate('Send drafts')} (${draftRows.length})`}
        action={mutate}
        iconNode={<EnvelopeSimpleIcon weight="bold" />}
        disabled={draftRows.length === 0 || isPending}
        tooltip={
          draftRows.length === 0
            ? translate('Select one or more draft batches.')
            : undefined
        }
      />
    </ActionDropdownButton>
  );
};
