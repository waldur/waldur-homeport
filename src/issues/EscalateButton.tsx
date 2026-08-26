import { FC } from 'react';
import { Issue, supportIssuesEscalate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionButton } from '@/table/ActionButton';

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
    <ActionButton
      title={translate('Escalate')}
      variant="tertiary"
      action={() => openDialog(EscalateDialog, { resolve: { issue, refetch } })}
    />
  );
};
