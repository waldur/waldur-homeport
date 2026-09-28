import { FC } from 'react';
import { Issue, supportIssuesEscalate } from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

const EscalateDialog: FC<{
  resolve: { issue: Issue; refetch: () => void };
}> = ({ resolve: { issue, refetch } }) => {
  const mutation = useManagedMutation<unknown, unknown, { reason: string }>({
    mutationFn: (variables) =>
      supportIssuesEscalate({
        path: { uuid: issue.uuid },
        body: { reason: variables.reason },
      }),
    successMessage: translate('Ticket escalated to the operator.'),
    errorMessage: translate('Unable to escalate ticket.'),
    refetch,
  });
  return (
    <ResourceActionDialog
      dialogTitle={translate('Escalate ticket')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Ticket')}
          name={issue.key || issue.summary}
        />
      }
      formFields={[
        {
          name: 'reason',
          label: translate('Reason'),
          type: 'text',
          required: true,
        },
      ]}
      submitForm={(formData) =>
        mutation.mutateAsync({ reason: formData.reason })
      }
    />
  );
};

/** Escalate a provider-routed ticket back to the operator. Staff-facing. */
export const EscalateButton: FC<{ issue: Issue; refetch: () => void }> = ({
  issue,
  refetch,
}) => {
  const { openDialog } = useModal();
  if (!issue.is_routed || issue.is_escalated) {
    return null;
  }
  return (
    <BaseButton
      label={translate('Escalate')}
      variant="tertiary"
      onClick={() =>
        openDialog(EscalateDialog, { resolve: { issue, refetch } })
      }
      size="lg"
    />
  );
};
