import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { formatDateTime } from '@/core/dateUtils';
import { ReviewCloseAction } from '@/customer/team/ReviewCloseButton';
import { useTeamTableTabs } from '@/customer/team/tabs';
import { translate } from '@/i18n';
import { useTeamTableTabs as useProjectTeamTableTabs } from '@/project/team/tabs';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { getProject } from '@/workspace/selectors';

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
          render: ({ row }) => <>{renderFieldOrDash(row.reviewer_full_name)}</>,
          export: (row) => renderFieldOrDash(row.reviewer_full_name),
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
