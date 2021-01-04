import { FunctionComponent } from 'react';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { withTranslation } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { formatLongText } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectCreateButton } from './ProjectCreateButton';
import { ProjectDeleteButton } from './ProjectDeleteButton';
import { ProjectDetailsButton } from './ProjectDetailsButton';
import { ProjectExpandableRowContainer } from './ProjectExpandableRowContainer';
import { ProjectTablePlaceholder } from './ProjectTablePlaceholder';

const ProjectLink = ({ row }) => (
  <Link state="project.details" params={{ uuid: row.uuid }} label={row.name} />
);

const ProjectCostField = ({ row }) =>
  defaultCurrency(
    (row.billing_price_estimate && row.billing_price_estimate.total) || 0,
  );

const ProjectActionsField = ({ row }) => (
  <div className="btn-group">
    <ProjectDetailsButton project={row} />
    <ProjectDeleteButton project={row} />
  </div>
);

export const TableComponent: FunctionComponent<any> = (props) => {
  const { translate, filterColumns } = props;
  useTitle(translate('Projects'));
  const columns = filterColumns([
    {
      title: translate('Name'),
      render: ProjectLink,
      orderField: 'name',
    },
    {
      title: translate('Description'),
      render: ({ row }) => formatLongText(row.description),
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('Estimated cost'),
      feature: 'projectCostDetails',
      render: ProjectCostField,
    },
    {
      title: translate('Actions'),
      render: ProjectActionsField,
    },
  ]);

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('projects')}
      hasQuery={true}
      showPageSizeSelector={true}
      placeholderComponent={<ProjectTablePlaceholder />}
      actions={<ProjectCreateButton />}
      expandableRow={ProjectExpandableRowContainer}
      enableExport={true}
    />
  );
};

const TableOptions = {
  table: 'ProjectsList',
  fetchData: createFetcher('projects'),
  queryField: 'query',
  getDefaultFilter: (state: RootState) => ({
    customer: getCustomer(state).uuid,
    o: 'name',
  }),
  exportRow: (row) => [row.name, row.description, formatDateTime(row.created)],
  exportFields: ['Name', 'Description', 'Created'],
};

const enhance = compose(connectTable(TableOptions), withTranslation);

export const ProjectsList = enhance(TableComponent);
