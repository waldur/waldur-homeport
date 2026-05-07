import { FunctionComponent, useMemo } from 'react';
import { AffiliatedOrganization, projectsList } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

interface AffiliatedOrganizationProjectsProps {
  row: AffiliatedOrganization;
}

export const AffiliatedOrganizationProjects: FunctionComponent<
  AffiliatedOrganizationProjectsProps
> = ({ row }) => {
  const filter = useMemo(() => ({ affiliation_uuid: [row.uuid] }), [row.uuid]);

  const tableProps = useTable({
    table: `AffiliatedOrganizationProjects-${row.uuid}`,
    fetchData: createFetcher(projectsList),
    filter,
  });

  const columns = useMemo(
    () => [
      {
        title: translate('Project'),
        render: ({ row: project }) => <>{project.name}</>,
        orderField: 'name',
      },
      {
        title: translate('Organization'),
        render: ({ row: project }) => renderFieldOrDash(project.customer_name),
      },
      {
        title: translate('Description'),
        render: ({ row: project }) => renderFieldOrDash(project.description),
      },
    ],
    [],
  );

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Projects')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      hasActionBar={false}
      hasHeaders
    />
  );
};
