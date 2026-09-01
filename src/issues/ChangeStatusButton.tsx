import { FC } from 'react';
import { Issue, supportIssuesSetStatus } from 'waldur-js-client';

import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionButton } from '@/table/ActionButton';

const ChangeStatusDialog: FC<{
  resolve: { issue: Issue; refetch: () => void };
}> = ({ resolve: { issue, refetch } }) => {
  const mutation = useManagedMutation<unknown, unknown, { status: string }>({
    mutationFn: (variables) =>
      supportIssuesSetStatus({
        path: { uuid: issue.uuid },
        body: { status: variables.status },
      }),
    successMessage: translate('Request status has been updated.'),
    errorMessage: translate('Unable to update request status.'),
    refetch,
  });
  return (
    <ResourceActionDialog
      dialogTitle={translate('Change status')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Ticket')}
          name={issue.key || issue.summary}
        />
      }
      formFields={[
        {
          name: 'status',
          label: translate('New status'),
          type: 'select',
          required: true,
          validate: required,
          options: issue.available_statuses.map((status) => ({
            label: status,
            value: status,
          })),
        },
      ]}
      submitForm={(formData) =>
        mutation.mutateAsync({ status: formData.status })
      }
    />
  );
};

/**
 * Move a request to another status. Rendered only where Waldur owns the ticket
 * lifecycle: the backend reports no available statuses when a remote service
 * desk (Jira, Zammad, SMAX) is the source of truth, so this hides itself there
 * without needing to know which backend is active.
 */
export const ChangeStatusButton: FC<{ issue: Issue; refetch: () => void }> = ({
  issue,
  refetch,
}) => {
  const { openDialog } = useModal();
  if (!issue.available_statuses?.length) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Change status')}
      variant="tertiary"
      disabled={!issue.update_is_available}
      disabledReason={translate(
        'This request cannot be updated in its current state.',
      )}
      action={() =>
        openDialog(ChangeStatusDialog, { resolve: { issue, refetch } })
      }
    />
  );
};
