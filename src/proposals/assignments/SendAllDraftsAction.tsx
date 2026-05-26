import { EnvelopeSimpleIcon } from '@phosphor-icons/react';
import { useMutation } from '@tanstack/react-query';
import { proposalProtectedCallsSendAllAssignments } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { useNotify } from '@/store/notify';
import { ActionButton } from '@/table/ActionButton';

interface SendAllDraftsActionProps {
  call: Call;
  refetch: () => void;
  draftCount: number;
}

export const SendAllDraftsAction = ({
  call,
  refetch,
  draftCount,
}: SendAllDraftsActionProps) => {
  const { showSuccess, showErrorResponse } = useNotify();

  const sendAllMutation = useMutation({
    mutationFn: () =>
      proposalProtectedCallsSendAllAssignments({
        path: { uuid: call.uuid },
      }),
    onSuccess: (response) => {
      const data = response.data;
      showSuccess(
        translate('Sent {count} assignment batches.', {
          count: data.batches_sent,
        }),
      );
      refetch();
    },
    onError: (error) => {
      showErrorResponse(error, translate('Failed to send assignments.'));
    },
  });

  if (!draftCount || draftCount <= 0) {
    return null;
  }

  return (
    <ActionButton
      action={() => sendAllMutation.mutate()}
      title={`${translate('Send all drafts')} (${draftCount})`}
      iconNode={<EnvelopeSimpleIcon weight="bold" />}
      variant="success"
      pending={sendAllMutation.isPending}
    />
  );
};
