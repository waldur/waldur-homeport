import { FC, useMemo } from 'react';
import { Alert } from 'react-bootstrap';
import {
  Issue,
  ProviderHelpdesk,
  providerHelpdesksList,
  supportIssuesReroute,
  supportIssuesRetrieve,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionButton } from '@/table/ActionButton';

import { providerTicketInfo } from './providerTicketInfo';

const RerouteImpactWarning: FC = () => (
  <Alert variant="warning" className="mb-4">
    <p className="mb-2 fw-bold">{translate('Rerouting this ticket will:')}</p>
    <ul className="mb-0 ps-4">
      <li>
        {translate(
          'Withdraw the ticket from the current provider (and remove it from their system where supported).',
        )}
      </li>
      <li>
        {translate(
          'Notify the current provider that the ticket has been withdrawn.',
        )}
      </li>
      <li>
        {translate(
          'Create a new ticket for the selected provider and notify them.',
        )}
      </li>
    </ul>
  </Alert>
);

const RerouteDialog: FC<{
  resolve: { issue: Issue; refetch: () => void };
}> = ({ resolve: { issue, refetch } }) => {
  const mutation = useManagedMutation<
    unknown,
    unknown,
    { helpdesk: ProviderHelpdesk }
  >({
    mutationFn: (variables) =>
      supportIssuesReroute({
        path: { uuid: issue.uuid },
        body: { provider_helpdesk: variables.helpdesk.uuid },
      }),
    successMessage: translate('Ticket rerouted to the selected provider.'),
    errorMessage: translate(
      'Unable to reroute ticket to the selected provider.',
    ),
    refetch,
  });

  const childIssueUuid = providerTicketInfo(issue)('child_issue_uuid');

  // Provider list is small, so load all active helpdesks and let the select
  // filter client-side; there is no server-side name search on this endpoint.
  // Exclude the provider the ticket is already routed to — the backend rejects
  // rerouting to the same helpdesk. That helpdesk isn't on provider_ticket_info,
  // so resolve it from the child issue, whose provider_helpdesk hyperlink
  // matches a list item's `url`. Fail open (show the full list) if it can't be
  // resolved.
  const loadHelpdesks = useMemo(
    () => async () => {
      const [helpdesks, currentHelpdeskUrl] = await Promise.all([
        providerHelpdesksList({ query: { is_active: true, page_size: 100 } }),
        childIssueUuid
          ? supportIssuesRetrieve({ path: { uuid: childIssueUuid } })
              .then((response) => response.data?.provider_helpdesk ?? null)
              .catch(() => null)
          : Promise.resolve(null),
      ]);
      const options = helpdesks.data ?? [];
      return currentHelpdeskUrl
        ? options.filter((helpdesk) => helpdesk.url !== currentHelpdeskUrl)
        : options;
    },
    [childIssueUuid],
  );

  return (
    <ResourceActionDialog
      dialogTitle={translate('Reroute to another provider')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Ticket')}
          name={issue.key || issue.summary}
        />
      }
      dialogSubmitLabel={translate('Reroute')}
      formFields={[
        {
          name: 'impact',
          component: RerouteImpactWarning,
        },
        {
          name: 'helpdesk',
          label: translate('New provider'),
          type: 'async_select',
          loadOptions: loadHelpdesks,
          getOptionLabel: ({ service_provider_name }) => service_provider_name,
          required: true,
        },
        {
          name: 'confirm',
          label: translate('I understand and want to reroute this ticket'),
          type: 'boolean',
          validate: (value) =>
            value ? undefined : translate('Please confirm to proceed.'),
        },
      ]}
      submitForm={(formData) =>
        mutation.mutateAsync({ helpdesk: formData.helpdesk })
      }
    />
  );
};

/**
 * Move an already-routed ticket to a different provider helpdesk — e.g. to
 * correct a mis-routing. The old provider's ticket is torn down and the old
 * provider is notified it was withdrawn. Staff-facing.
 */
export const RerouteButton: FC<{
  issue: Issue;
  refetch: () => void;
}> = ({ issue, refetch }) => {
  const { openDialog } = useModal();
  if (!issue.is_routed) {
    return null;
  }
  return (
    <ActionButton
      title={translate('Reroute')}
      variant="tertiary"
      action={() => openDialog(RerouteDialog, { resolve: { issue, refetch } })}
    />
  );
};
