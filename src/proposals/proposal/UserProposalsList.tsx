import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PROPOSALS_FILTER_FORM_ID } from '@waldur/proposals/constants';
import { getProposalStateOptions } from '@waldur/proposals/utils';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { EndingField } from '../EndingField';

import { ProposalBadge } from './ProposalBadge';
import { ProposalsTableFilter } from './ProposalsTableFilter';

const filtersSelector = createSelector(
  getFormValues(PROPOSALS_FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.call) {
      result.call_uuid = filters.call.uuid;
    }
    result.o = '-round__cutoff_time';
    return result;
  },
);

export const UserProposalsList: FC = () => {
  const filter = useSelector(filtersSelector);

  const tableProps = useTable({
    table: 'MyProposalsList',
    fetchData: createFetcher('proposal-proposals'),
    queryField: 'name',
    filter,
  });

  const initialValues = useMemo(
    () => ({
      state: getProposalStateOptions().filter(
        (option) => option.value !== 'canceled' && option.value !== 'rejected',
      ),
    }),
    [],
  );

  const columns = [
    {
      title: translate('Proposal'),
      render: ({ row }) => <>{row.name}</>,
      keys: ['name'],
    },
    {
      title: translate('Call'),
      render: ({ row }) => <>{renderFieldOrDash(row.call_name)}</>,
      keys: ['call_name'],
    },
    {
      title: translate('Ending'),
      render: ({ row }) => <EndingField endDate={row.round?.cutoff_time} />,
      keys: ['round'],
    },
    {
      title: translate('State'),
      render: ({ row }) => <ProposalBadge state={row.state} />,
      keys: ['state'],
      orderField: 'state',
    },
    {
      title: translate('UUID'),
      render: ({ row }) => <>{row.uuid}</>,
      keys: ['uuid'],
      optional: true,
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{row.created}</>,
      keys: ['created'],
      orderField: 'created',
      optional: true,
    },
    {
      title: translate('Duration in days'),
      render: ({ row }) => <>{row.duration_in_days || DASH_ESCAPE_CODE}</>,
      keys: ['duration_in_days'],
      optional: true,
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
    });
  }

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('My proposals')}
      verboseName={translate('My proposals')}
      hasQuery={true}
      hasOptionalColumns
      hoverableRow={({ row }) => (
        <Link
          state="proposals.manage-proposal"
          params={{
            proposal_uuid: row.uuid,
          }}
          className="btn btn-primary"
        >
          {translate('View')}
        </Link>
      )}
      filters={<ProposalsTableFilter initialValues={initialValues} />}
    />
  );
};
