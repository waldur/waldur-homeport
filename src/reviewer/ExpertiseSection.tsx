import { useMemo } from 'react';
import {
  ReviewerExpertise,
  nestedReviewerProfileExpertiseList,
  NestedReviewerProfileExpertiseListData,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { ExpertiseBulkRemoveButton } from './ExpertiseBulkRemoveButton';
import { ExpertiseDeleteAction } from './ExpertiseDeleteAction';

const PROFICIENCY_LEVEL_LABELS = {
  expert: translate('Expert'),
  familiar: translate('Familiar'),
  basic: translate('Basic'),
};

const ExpertiseRowActions = ({ row, refetch, profile }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      actions={[
        (props) => <ExpertiseDeleteAction {...props} profile={profile} />,
      ]}
    />
  );
};

export const ExpertiseSection = ({
  profile,
}: {
  profile: any;
  refetch?: () => void;
}) => {
  const filter = useMemo(
    (): NestedReviewerProfileExpertiseListData['query'] => ({}),
    [],
  );

  const tableProps = useTable({
    table: 'reviewerExpertiseList',
    fetchData: createFetcher((...args) =>
      nestedReviewerProfileExpertiseList({
        ...args[0],
        path: { reviewer_profile_uuid: profile.uuid },
      }),
    ),
    filter,
  });

  const columns: Column<ReviewerExpertise>[] = [
    {
      title: translate('Keyword'),
      render: ({ row }) => row.expertise_keyword,
    },
    {
      title: translate('Category'),
      render: ({ row }) => row.expertise_category_name || '-',
    },
    {
      title: translate('Proficiency'),
      render: ({ row }) =>
        row.proficiency_level
          ? PROFICIENCY_LEVEL_LABELS[row.proficiency_level] ||
            row.proficiency_level
          : '-',
    },
    {
      title: translate('Years experience'),
      render: ({ row }) =>
        row.years_experience !== null ? row.years_experience : '-',
    },
  ];

  return (
    <Table<ReviewerExpertise>
      {...tableProps}
      columns={columns}
      hasActionBar={false}
      cardBordered={false}
      rowActions={({ row }) => (
        <ExpertiseRowActions
          row={row}
          refetch={tableProps.fetch}
          profile={profile}
        />
      )}
      enableMultiSelect
      multiSelectActions={({ rows, refetch }) => (
        <ExpertiseBulkRemoveButton
          rows={rows}
          refetch={refetch}
          profile={profile}
        />
      )}
    />
  );
};
