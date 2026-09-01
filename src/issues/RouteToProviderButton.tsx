import { FC, useMemo } from 'react';
import {
  Issue,
  ProviderHelpdesk,
  providerHelpdesksList,
  supportIssuesRouteToProvider,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionButton } from '@/table/ActionButton';

const RouteToProviderDialog: FC<{
  resolve: { issue: Issue; refetch: () => void };
}> = ({ resolve: { issue, refetch } }) => {
  const mutation = useManagedMutation<
    unknown,
    unknown,
    { helpdesk: ProviderHelpdesk }
  >({
    mutationFn: (variables) =>
      supportIssuesRouteToProvider({
        path: { uuid: issue.uuid },
        body: { provider_helpdesk: variables.helpdesk.uuid },
      }),
    successMessage: translate('Ticket routed to the selected provider.'),
    errorMessage: translate('Unable to route ticket to the selected provider.'),
    refetch,
  });

  // Provider list is small, so load all active helpdesks and let the select
  // filter client-side; there is no server-side name search on this endpoint,
  // hence the 'none' search field.
  //
  // This must go through createLoadOptions: the select is backed by
  // react-select-async-paginate, which expects `{ options, hasMore }` rather
  // than a bare array. Returning the array left the dropdown permanently empty.
  const loadHelpdesks = useMemo(
    () => createLoadOptions(providerHelpdesksList, 'none', { is_active: true }),
    [],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Route to provider')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Ticket')}
          name={issue.key || issue.summary}
        />
      }
      formFields={[
        {
          name: 'helpdesk',
          label: translate('Provider'),
          type: 'async_select',
          loadOptions: loadHelpdesks,
          getOptionLabel: ({ service_provider_name }) => service_provider_name,
          getOptionValue: ({ uuid }) => uuid,
          required: true,
          validate: required,
          help_text: translate(
            'The selected provider will receive a new ticket and be notified.',
          ),
        },
      ]}
      submitForm={(formData) =>
        mutation.mutateAsync({ helpdesk: formData.helpdesk })
      }
    />
  );
};

/**
 * Manually route an unrouted ticket to a chosen provider helpdesk, without
 * having to attach a resource first. Staff-facing.
 */
export const RouteToProviderButton: FC<{
  issue: Issue;
  refetch: () => void;
}> = ({ issue, refetch }) => {
  const { openDialog } = useModal();
  if (issue.is_routed) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Route to provider')}
      variant="tertiary"
      action={() =>
        openDialog(RouteToProviderDialog, { resolve: { issue, refetch } })
      }
    />
  );
};
