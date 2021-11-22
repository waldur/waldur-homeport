import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { compose } from 'redux';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { withTranslation } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectsListActions } from '@waldur/project/ProjectsListActions';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { formatLongText } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectCreateButton } from './ProjectCreateButton';
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
      title: translate('End date'),
      render: ({ row }) =>
        row.end_date ? formatDate(row.end_date) : DASH_ESCAPE_CODE,
      orderField: 'end_date',
    },
    {
      title: translate('Estimated cost'),
      feature: 'project.estimated_cost',
      render: ProjectCostField,
    },
    {
      title: translate('Actions'),
      render: ({ row }) => {
        return (
          <ButtonGroup>
            <ProjectsListActions project={row} />
            <ProjectDetailsButton project={row} />
          </ButtonGroup>
        );
      },
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
  table: PROJECTS_LIST,
  fetchData: createFetcher('projects'),
  queryField: 'query',
  getDefaultFilter: (state: RootState) => ({
    customer: getCustomer(state).uuid,
    o: 'name',
  }),
  mapPropsToFilter: () => {
    const filter: Record<string, string[]> = {};
    // select required fields
    filter.field = [
      'uuid',
      'name',
      'description',
      'created',
      'billing_price_estimate',
      'type_name',
      'end_date',
      'backend_id',
    ];

    return filter;
  },
  exportRow: (row) => [row.name, row.description, formatDateTime(row.created)],
  exportFields: ['Name', 'Description', 'Created'],
};

const enhance = compose(connectTable(TableOptions), withTranslation);

export const ProjectsList = enhance(TableComponent);
