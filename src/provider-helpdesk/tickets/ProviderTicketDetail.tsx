import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Issue, providerTicketsRetrieve } from 'waldur-js-client';

import { translate } from '@/i18n';
import { IssueDetails } from '@/issues/IssueDetails';
import { ActionButton } from '@/table/ActionButton';
import { useCustomer } from '@/workspace/hooks';

import { useClaimTicket, useResolveTicket } from '../api';
import { useProviderHelpdesk } from '../common/useProviderHelpdesk';

import { AssigneeSelect } from './AssigneeSelect';

const ProviderDetailActions: FC<{ issue: Issue; refetch: () => void }> = ({
  issue,
  refetch,
}) => {
  const customer = useCustomer();
  const { helpdesk } = useProviderHelpdesk(customer?.service_provider_uuid);

  const { data: ticket, refetch: refetchTicket } = useQuery({
    queryKey: ['ProviderTicket', issue.uuid],
    queryFn: async () =>
      (await providerTicketsRetrieve({ path: { uuid: issue.uuid } })).data,
    refetchOnWindowFocus: false,
  });

  const refetchAll = () => {
    refetch();
    refetchTicket();
  };

  const claim = useClaimTicket(refetchAll);
  const resolve = useResolveTicket(refetchAll);

  return (
    <>
      <div className="d-flex align-items-center gap-2">
        <span className="text-muted">{translate('Assignee')}:</span>
        <AssigneeSelect
          ticketUuid={issue.uuid}
          status={ticket?.status}
          assignee={ticket?.provider_assignee}
          assigneeName={ticket?.provider_assignee_name}
          helpdeskUuid={helpdesk?.uuid}
          refetch={refetchAll}
        />
      </div>
      <ActionButton
        title={translate('Claim')}
        variant="tertiary"
        action={() => claim.mutate({ uuid: issue.uuid })}
      />
      <ActionButton
        title={translate('Resolve')}
        variant="primary"
        action={() => resolve.mutate({ uuid: issue.uuid })}
      />
    </>
  );
};

/**
 * Provider view of a routed ticket: reuses the staff IssueDetails in
 * "provider" context (staff-only actions hidden) with provider actions
 * injected into the header.
 */
export const ProviderTicketDetail: FC = () => (
  <IssueDetails
    context="provider"
    renderActions={(issue, refetch) => (
      <ProviderDetailActions issue={issue} refetch={refetch} />
    )}
  />
);
