import { FC, useMemo } from 'react';
import { Issue, supportIssuesAttachResource } from 'waldur-js-client';

import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { resourceAutocomplete } from '@/marketplace/common/autocompletes';
import { useModal } from '@/modal/actions';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionButton } from '@/table/ActionButton';

const AttachResourceDialog: FC<{
  resolve: { issue: Issue; refetch: () => void };
}> = ({ resolve: { issue, refetch } }) => {
  const mutation = useManagedMutation<
    unknown,
    unknown,
    { resource: { url: string } }
  >({
    mutationFn: (variables) =>
      supportIssuesAttachResource({
        path: { uuid: issue.uuid },
        body: { resource: variables.resource.url },
      }),
    successMessage: translate(
      'Resource attached. The ticket will be routed to its provider.',
    ),
    errorMessage: translate('Unable to attach resource.'),
    refetch,
  });

  const loadResources = useMemo(
    () =>
      resourceAutocomplete(
        issue.customer_uuid ? { customer_uuid: issue.customer_uuid } : {},
      ),
    [issue.customer_uuid],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Attach resource')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Ticket')}
          name={issue.key || issue.summary}
        />
      }
      formFields={[
        {
          name: 'resource',
          label: translate('Resource'),
          type: 'async_select',
          loadOptions: loadResources,
          getOptionLabel: ({ name }) => name,
          required: true,
          validate: required,
        },
      ]}
      submitForm={(formData) =>
        mutation.mutateAsync({ resource: formData.resource })
      }
    />
  );
};

/**
 * Attach a marketplace resource to an unlinked ticket, which enables routing to
 * the resource's service provider. Staff-facing.
 */
export const AttachResourceButton: FC<{
  issue: Issue;
  refetch: () => void;
}> = ({ issue, refetch }) => {
  const { openDialog } = useModal();
  if (issue.resource) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Attach resource')}
      variant="tertiary"
      action={() =>
        openDialog(AttachResourceDialog, { resolve: { issue, refetch } })
      }
    />
  );
};
