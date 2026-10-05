import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { AssignmentBatchList, assignmentBatchesSend } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { translate } from '@/i18n';
import { useBatchMutation } from '@/modal/useBatchMutation';

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
    <Menu>
      <Menu.TriggerButton>{translate('All actions')}</Menu.TriggerButton>
      <Menu.Content look="actions" side="bottom">
        <Menu.Item
          icon={<EnvelopeSimpleIcon weight="bold" />}
          onSelect={() => mutate()}
          disabled={draftRows.length === 0 || isPending}
          tooltip={
            draftRows.length === 0
              ? translate('Select one or more draft batches.')
              : undefined
          }
        >
          {`${translate('Send drafts')} (${draftRows.length})`}
        </Menu.Item>
      </Menu.Content>
    </Menu>
  );
};
