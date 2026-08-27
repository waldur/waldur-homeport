import { proposalProposalsList } from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { BreadcrumbDropdown } from '@/navigation/header/breadcrumb/BreadcrumbDropdown';
import { BreadcrumbSearchItem } from '@/navigation/header/breadcrumb/BreadcrumbSearchItem';
import { Proposal } from '@/proposals/types';

interface ProposalBreadcrumbPopoverProps {
  proposal: Proposal;
  /** Customer the call-management routes are scoped to. */
  customerUuid: string;
  close?: () => void;
}

/**
 * The other proposals a call manager could be looking at instead, hung off the
 * proposal crumb the way the resource crumb offers sibling resources.
 *
 * Scoped to the round rather than the call, because the round is the crumb
 * directly above: the list a manager works through is one round's intake, and
 * a call spanning several rounds would mix cohorts that are judged separately.
 *
 * Applicant-side has no equivalent — this hangs only off the call-managed
 * chain, where every proposal in the round is the viewer's to open.
 */
export const ProposalBreadcrumbPopover = ({
  proposal,
  customerUuid,
  close,
}: ProposalBreadcrumbPopoverProps) => (
  <BreadcrumbDropdown
    fetcher={proposalProposalsList}
    queryKey="proposalProposalsList"
    // The endpoint filters by name; there is no combined `query` field here.
    queryField="name"
    // No `field` trimming here: unlike the resources endpoint, this one takes
    // no field selector, so the full serializer comes back.
    params={{ round_uuid: proposal.round?.uuid }}
    RowComponent={({ row }) => (
      <BreadcrumbSearchItem
        to="call-management.proposal-details"
        params={{ uuid: customerUuid, proposal_uuid: row.uuid }}
        title={row.name}
        // Who submitted it and when: the two things that tell one proposal
        // from another in a list where every name is a research title.
        subtitle={[row.created_by_name, formatDate(row.created)]
          .filter(Boolean)
          .join(' · ')}
        isCurrent={row.uuid === proposal.uuid}
      />
    )}
    placeholder={translate('Type in name of proposal...')}
    emptyMessage={translate('There are no proposals in this round.')}
    close={close}
  />
);
