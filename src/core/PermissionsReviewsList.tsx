import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { ReviewCloseAction } from '@waldur/customer/team/ReviewCloseButton';
import { useTeamTableTabs } from '@waldur/customer/team/tabs';
import { translate } from '@waldur/i18n';
import { useTeamTableTabs as useProjectTeamTableTabs } from '@waldur/project/team/tabs';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { getProject } from '@waldur/workspace/selectors';

interface PermissionsReviewsListProps {
  tableProps: ReturnType<typeof useTable>;
  scope: 'customer' | 'project';
}

export const PermissionsReviewsList: FunctionComponent<
  PermissionsReviewsListProps
> = ({ tableProps, scope }) => {
  const project = useSelector(getProject);
  const tableTabs =
    scope === 'project' ? useProjectTeamTableTabs(project) : useTeamTableTabs();
  return (
    <Table
      {...tableProps}
      tabs={tableTabs}
      columns={[
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
          export: (row) => formatDateTime(row.created),
        },
        {
          title: translate('Performed'),
          render: ({ row }) => (
            <>{row.closed ? formatDateTime(row.closed) : 'N/A'}</>
          ),
          export: (row) => (row.closed ? formatDateTime(row.closed) : 'N/A'),
        },
        {
          title: translate('Performed by'),
          render: ({ row }) => <>{row.reviewer_full_name || 'N/A'}</>,
          export: (row) => row.reviewer_full_name || 'N/A',
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <>
              {row.is_pending ? translate('Pending') : translate('Performed')}
            </>
          ),
          export: (row) =>
            row.is_pending ? translate('Pending') : translate('Performed'),
        },
      ]}
      verboseName={translate('permission reviews')}
      rowActions={({ row }) =>
        row.is_pending ? (
          <ActionsDropdown row={row}>
            <ReviewCloseAction row={row} scope={scope} />
          </ActionsDropdown>
        ) : null
      }
      enableExport
    />
  );
};
