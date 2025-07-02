import { useCurrentStateAndParams } from '@uirouter/react';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { Proposal, ProposalProposalsListData } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PROPOSALS_FILTER_FORM_ID } from '@waldur/proposals/constants';
import { getProposalStateOptions } from '@waldur/proposals/utils';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { EndingField } from '../EndingField';

import { ProposalBadge } from './ProposalBadge';
import { ProposalsTableFilter } from './ProposalsTableFilter';

const filtersSelector = createSelector(
  getFormValues(PROPOSALS_FILTER_FORM_ID),
  (filters: any) => {
    const result: ProposalProposalsListData['query'] = {};
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.call) {
      result.call_uuid = filters.call.uuid;
    }
    result.o = ['-round__cutoff_time'];
    return result;
  },
);

const mandatoryFields = ['uuid', 'proposal_name', 'state'];

export const UserProposalsList: FC = () => {
  const {
    params: { call },
  } = useCurrentStateAndParams();
  const callObj = call ? JSON.parse(decodeURIComponent(call)) : undefined;
  const filter = useSelector(filtersSelector);

  const tableProps = useTable({
    table: 'MyProposalsList',
    fetchData: createFetcher('proposal-proposals'),
    queryField: 'name',
    filter,
    mandatoryFields,
  });

  const initialValues = useMemo(
    () => ({
      state: getProposalStateOptions().filter(
        (option) => option.value !== 'canceled' && option.value !== 'rejected',
      ),
      call: callObj,
    }),
    [callObj],
  );

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
      render: ({ row }) => <EndingField endDate={row.round?.cutoff_time} />,
      keys: ['round'],
      id: 'ending',
    },
    {
      title: translate('State'),
      render: ({ row }) => <ProposalBadge state={row.state} />,
      keys: ['state'],
      orderField: 'state',
      filter: 'state',
      inlineFilter: (row) =>
        getProposalStateOptions().filter((s) => s.value === row.state),
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
      columns={columns}
      title={translate('My proposals')}
      verboseName={translate('Proposals')}
      hasQuery={true}
      hasOptionalColumns
      filters={<ProposalsTableFilter initialValues={initialValues} />}
    />
  );
};
