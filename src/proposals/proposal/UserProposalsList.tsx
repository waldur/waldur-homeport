import { useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { Proposal, proposalProposalsList } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
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

import { EndingField } from '../EndingField';

import { ProposalBadge } from './ProposalBadge';

const mandatoryFields = ['uuid', 'proposal_name', 'state'];

export const UserProposalsList = () => {
  const {
    params: { call },
  } = useCurrentStateAndParams();
  const callObj = call ? JSON.parse(decodeURIComponent(call)) : undefined;

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
      my_proposals: true,
      o: ['-round__cutoff_time'],
      ...formFilters,
    }),
    [formFilters],
  );

  const tableProps = useTable({
    table: 'MyProposalsList',
    initialFilters,
    syncFiltersToURL: true,
    fetchData: createFetcher(proposalProposalsList),
    queryField: 'name',
    filter,
    mandatoryFields,
  });

  const columns: Column<Proposal>[] = [
    {
      title: translate('Proposal'),
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
    {
      title: translate('Call'),
      render: ({ row }) => <>{renderFieldOrDash(row.call_name)}</>,
      keys: ['call_name'],
      filter: 'call',
      inlineFilter: (row) => ({ name: row.call_name, uuid: row.call_uuid }),
      id: 'call',
    },
    {
      title: translate('Ending'),
      render: ({ row }) => (
        <EndingField
          endDate={row.round?.cutoff_time}
          hasFixedDuration={Boolean(row.duration_in_days)}
        />
      ),
      keys: ['round'],
      id: 'ending',
      className: 'text-nowrap',
    },
    {
      title: translate('State'),
      render: ({ row }) => <ProposalBadge state={row.state} />,
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
    {
      title: translate('Duration in days'),
      render: ({ row }) => <>{row.duration_in_days || DASH_ESCAPE_CODE}</>,
      keys: ['duration_in_days'],
      optional: true,
      id: 'duration_in_days',
    },
  ];

  if (isFeatureVisible(ProjectFeatures.oecd_fos_2007_code)) {
    columns.push({
      title: translate('OECD FoS code'),
      render: ({ row }) => (
        <>
          {row.oecd_fos_2007_code
            ? `${row.oecd_fos_2007_code}. ${row.oecd_fos_2007_label}`
            : DASH_ESCAPE_CODE}
        </>
      ),

      optional: true,
      keys: ['oecd_fos_2007_code', 'oecd_fos_2007_label'],
      id: 'oecd_fos_code',
    });
  }

  return (
    <Table
      {...tableProps}
      formId={ProposalsFilterFormId}
      columns={columns}
      title={translate('My proposals')}
      verboseName={translate('Proposals')}
      standalone
      hasQuery={true}
      hasOptionalColumns
      showPageSizeSelector={true}
      filters={<ProposalsFilter />}
    />
  );
};
