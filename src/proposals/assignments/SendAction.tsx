import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { AssignmentBatchList, assignmentBatchesSend } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface SendActionProps {
  row: AssignmentBatchList;
  refetch: () => void;
}

export const SendAction: FC<SendActionProps> = ({ row, refetch }) => {
  const { mutate: handleSend, isPending: isSending } = useManagedMutation<
    any,
    any,
    void
  >({
    mutationFn: () => assignmentBatchesSend({ path: { uuid: row.uuid } }),
    successMessage: translate('Assignment batch sent successfully.'),
    errorMessage: translate('Failed to send assignment batch.'),
    refetch,
  });

  return (
    <ActionItem
      title={translate('Send')}
      action={() => handleSend()}
      iconNode={<EnvelopeSimpleIcon weight="bold" />}
      disabled={isSending}
    />
  );
};
