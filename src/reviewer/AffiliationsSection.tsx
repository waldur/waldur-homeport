import { useMemo } from 'react';
import {
  ReviewerAffiliation,
  nestedReviewerProfileAffiliationsList,
  NestedReviewerProfileAffiliationsListData,
} from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { AffiliationDeleteAction } from './AffiliationDeleteAction';
import { AffiliationEditAction } from './AffiliationEditAction';
import { AffiliationsBulkRemoveButton } from './AffiliationsBulkRemoveButton';

const AFFILIATION_TYPE_LABELS = {
  employment: translate('Employment'),
  education: translate('Education'),
  visiting: translate('Visiting'),
  honorary: translate('Honorary'),
  consulting: translate('Consulting'),
};

const AffiliationRowActions = ({ row, refetch, profile }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        (props) => <AffiliationEditAction {...props} profile={profile} />,
        (props) => <AffiliationDeleteAction {...props} profile={profile} />,
      ]}
    />
  );
};

export const AffiliationsSection = ({
  profile,
}: {
  profile: any;
  refetch?: () => void;
}) => {
  const filter = useMemo(
    (): NestedReviewerProfileAffiliationsListData['query'] => ({}),
    [],
  );

  const tableProps = useTable({
    table: 'reviewerAffiliationsList',
    fetchData: createFetcher((...args) =>
      nestedReviewerProfileAffiliationsList({
        ...args[0],
        path: { reviewer_profile_uuid: profile.uuid },
      }),
    ),
    filter,
  });

  const columns: Column<ReviewerAffiliation>[] = [
    {
      title: translate('Organization'),
      render: ({ row }) => row.organization_name_display,
    },
    {
      title: translate('Department'),
      render: ({ row }) => renderFieldOrDash(row.department),
    },
    {
      title: translate('Position'),
      render: ({ row }) => row.position_title,
    },
    {
      title: translate('Type'),
      render: ({ row }) =>
        row.affiliation_type
          ? AFFILIATION_TYPE_LABELS[row.affiliation_type] ||
            row.affiliation_type
          : '-',
    },
    {
      title: translate('Period'),
      render: ({ row }) => {
        const start = formatDate(row.start_date);
        const end = row.end_date
          ? formatDate(row.end_date)
          : translate('Present');
        return `${start} - ${end}`;
      },
    },
    {
      title: translate('Primary'),
      render: ({ row }) => (row.is_primary ? translate('Yes') : '-'),
    },
  ];

  return (
    <Table<ReviewerAffiliation>
      {...tableProps}
      columns={columns}
      hasActionBar={false}
      cardBordered={false}
      rowActions={({ row }) => (
        <AffiliationRowActions
          row={row}
          refetch={tableProps.fetch}
          profile={profile}
        />
      )}
      enableMultiSelect
      multiSelectActions={({ rows, refetch }) => (
        <AffiliationsBulkRemoveButton
          rows={rows}
          refetch={refetch}
          profile={profile}
        />
      )}
    />
  );
};
