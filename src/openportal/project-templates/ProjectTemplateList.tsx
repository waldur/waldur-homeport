import { FC, FunctionComponent } from 'react';
import { openportalProjectTemplateList } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ProjectTemplateCreateButton } from './ProjectTemplateCreateButton';
import { ProjectTemplateDeleteButton } from './ProjectTemplateDeleteButton';
import { ProjectTemplateEditButton } from './ProjectTemplateEditButton';
import { ProjectTemplateExpandableRow } from './ProjectTemplateExpandableRow';

const ProjectTemplateRowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[ProjectTemplateEditButton, ProjectTemplateDeleteButton].filter(
      Boolean,
    )}
  />
);

const CustomerLink: FC<{ customer?: any }> = ({ customer }) => {
  if (!customer) {
    return <>{translate('Not set')}</>;
  }
  return (
    <Link
      state="organization.dashboard"
      params={{ uuid: customer.uuid }}
      label={customer.display_name || customer.name || customer.uuid}
    />
  );
};

export const ProjectTemplateList: FunctionComponent<{}> = () => {
  const props = useTable({
    table: 'project-template',
    fetchData: createFetcher(openportalProjectTemplateList),
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => renderFieldOrDash(row.name),
        },
        {
          title: translate('Offering'),
          render: ({ row }) => renderFieldOrDash(row.offering),
        },
        {
          title: translate('Portal'),
          render: ({ row }) => renderFieldOrDash(row.portal),
        },
        {
          title: translate('Organization'),
          render: ({ row }) => <CustomerLink customer={row.customer_data} />,
        },
        {
          title: translate('Shortname'),
          render: ({ row }) => renderFieldOrDash(row.shortname),
        },
      ]}
      verboseName={translate('Project templates')}
      rowActions={ProjectTemplateRowActions}
      expandableRow={ProjectTemplateExpandableRow}
      tableActions={<ProjectTemplateCreateButton refetch={props.fetch} />}
    />
  );
};
