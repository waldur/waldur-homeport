import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, ReactNode, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Proposal, proposalProposalsList } from 'waldur-js-client';

import { AlertItem } from 'waldur-ui';

import { Link } from '@/core/Link';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { parseCallFilterParam } from '@/proposals/callFilterParam';
import {
  requestListTitle,
  requestNoun,
  requestNounPlural,
  showsCallColumns,
} from '@/proposals/presentation';
import { SubmissionDeadlineField } from '@/proposals/proposal/SubmissionDeadlineField';
import { getProposalStateOptions } from '@/proposals/utils';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import {
  ProposalsFilter,
  ProposalsFilterFormId,
  ProposalStatesOptions,
  selectProposalsFilter,
} from '@/table/generated/ProposalsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { isStaffOrSupport } from '@/workspace/selectors';

import { ProposalStateBadge } from './ProposalStateBadge';
import { UserProposalExpandableRow } from './UserProposalExpandableRow';

const mandatoryFields = ['uuid', 'proposal_name', 'state'];

interface UserProposalsListProps {
  /** Rendered in the card toolbar beside search. */
  actions?: ReactNode;
  /** Standalone puts the title above the panel, which suits a page of its own
   *  but not a tab inside one — see UserOfferingList for the in-tab shape. */
  standalone?: boolean;
}

export const UserProposalsList: FC<UserProposalsListProps> = ({
  actions,
  standalone = true,
}) => {
  const {
    params: { call },
  } = useCurrentStateAndParams();
  // Memoised so the object identity is stable; it seeds initialFilters below.
  const callObj = useMemo(() => parseCallFilterParam(call), [call]);

  const initialFilters = useMemo(
    () => ({
      state: getProposalStateOptions().filter(
        (option) => option.value !== 'canceled' && option.value !== 'rejected',
      ),
      call: callObj,
    }),
    [callObj],
  );

  const values = useFilterValues('MyProposalsList');
  const formFilters = useMemo(() => selectProposalsFilter(values), [values]);

  const filter = useMemo(
    () => ({
      // Deliberately no `my_proposals: true`. It means "created by the
      // current user" (proposal/filters.py: filter_my_proposals), while the
      // resource lens beside it scopes to proposals the user can *read* —
      // which includes ones they only hold a role on. The two would otherwise
      // list different sets: a PROPOSAL.MEMBER saw a team-mate's line items
      // in the resource lens and no sign of the request they belong to. Two
      // projections of one page cannot disagree about what is in it, so both
      // use the readable scope -- as anyone but staff and support reads it:
      // their reach over every proposal is the administration's list, not
      // their own (`involved`).
      involved: true,
      ...formFilters,
    }),
    [formFilters],
  );

  const staffReach = useSelector(isStaffOrSupport);

  const tableProps = useTable({
    table: 'MyProposalsList',
    initialFilters,
    syncFiltersToURL: true,
    fetchData: createFetcher(proposalProposalsList),
    queryField: 'name',
    filter,
    mandatoryFields,
  });

  const callColumn: Column<Proposal> = {
    title: translate('Call'),
    render: ({ row }) => (
      <span className="font-medium text-primary">
        {renderFieldOrDash(row.call_name)}
      </span>
    ),
    keys: ['call_name'],
    filter: 'call',
    inlineFilter: (row) => ({ name: row.call_name, uuid: row.call_uuid }),
    id: 'call',
  };

  const columns: Column<Proposal>[] = [
    {
      title: requestNoun(),
      render: ({ row }) => (
        <Link
          state="proposals.manage-proposal"
          params={{ proposal_uuid: row.uuid }}
          label={row.name}
        />
      ),

      keys: ['name'],
      id: 'proposal',
    },
    ...(showsCallColumns() ? [callColumn] : []),
    {
      title: translate('Submission deadline'),
      render: SubmissionDeadlineField,
      keys: ['round'],
      orderField: 'round__cutoff_time',
      id: 'ending',
      className: 'whitespace-nowrap',
    },
    {
      title: translate('State'),
      render: ({ row }) => <ProposalStateBadge row={row} />,
      keys: ['state'],
      orderField: 'state',
      filter: 'state',
      inlineFilter: (row) =>
        ProposalStatesOptions.filter((s) => s.value === row.state),
      id: 'state',
    },
    {
      title: translate('UUID'),
      render: ({ row }) => <>{row.uuid}</>,
      keys: ['uuid'],
      optional: true,
      id: 'uuid',
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{row.created}</>,
      keys: ['created'],
      orderField: 'created',
      optional: true,
      id: 'created',
    },
  ];

  if (isFeatureVisible(ProjectFeatures.science_domain)) {
    columns.push({
      title: translate('Science domain'),
      render: ({ row }) => (
        <>
          {row.science_sub_domain_name
            ? [row.science_domain_name, row.science_sub_domain_name]
                .filter(Boolean)
                .join(' > ')
            : DASH_ESCAPE_CODE}
        </>
      ),

      optional: true,
      keys: ['science_domain_name', 'science_sub_domain_name'],
      id: 'science_domain',
    });
  }

  return (
    <>
      {/* Staff and support read every proposal; their list is the user's
          own, and says where the rest are. */}
      {staffReach && standalone && (
        <AlertItem
          type="floating"
          variant="info"
          className="mb-4"
          data-testid="own-proposals-note"
          title={translate('Only the proposals you take part in')}
          body={
            <>
              {translate(
                'Every proposal of every call is listed in the administration:',
              )}{' '}
              <Link
                state="admin-proposals"
                label={translate('All proposals')}
              />
            </>
          }
        />
      )}
      <Table
        {...tableProps}
        formId={ProposalsFilterFormId}
        columns={columns}
        title={standalone ? requestListTitle() : undefined}
        verboseName={requestNounPlural()}
        standalone={standalone}
        tableActions={actions}
        // Newest first: the proposal just created or submitted is on top,
        // whichever round's deadline is furthest away.
        initialSorting={{ field: 'created', mode: 'desc' }}
        hasQuery={true}
        hasOptionalColumns
        showPageSizeSelector={true}
        expandableRow={UserProposalExpandableRow}
        // Same predicate as the Call column above: a deployment that hides
        // calls must not offer to filter by one.
        filters={<ProposalsFilter hideCall={!showsCallColumns()} />}
      />
    </>
  );
};
