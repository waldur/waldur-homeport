import * as React from 'react';
import { compose } from 'redux';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { defaultCurrency } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { renderFieldOrDash } from '@waldur/table-react/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectCreateButton } from './ProjectCreateButton';
import { ProjectDeleteButton } from './ProjectDeleteButton';
import { ProjectDetailsButton } from './ProjectDetailsButton';

const ProjectLink = ({ row }) => (
  <Link
    state="project.details"
    params={{ uuid: row.uuid }}
    label={row.name}
  />
);

const DescriptionField = ({ row }) => <span>{renderFieldOrDash(row.description)}</span>;

const ProjectExpandableRow = () => (
  <dl className="dl-horizontal m-t-sm">
    <Field
      label="Virtual machines"
      value={1}
    />
    <Field
      label="Volumes"
      value={1}
    />
    <Field
      label="Snapshots"
      value={1}
    />
  </dl>
);

export const TableComponent = props => {
  const { translate, filterColumns } = props;
  const columns = filterColumns([
    {
      title: translate('Name'),
      render: ProjectLink,
      orderField: 'name',
    },
    {
      title: translate('Description'),
      render: DescriptionField,
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('Estimated cost'),
      feature: 'projectCostDetails',
      render: ({ row }) => defaultCurrency(row.billing_price_estimate && row.billing_price_estimate.total || 0),
    },
    {
      title: translate('Actions'),
      render: ({ row }) => (
        <>
          <ProjectDetailsButton project={row}/>
          <ProjectDeleteButton project={row}/>
        </>
      ),
    },
  ]);

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('projects')}
      hasQuery={true}
      showPageSizeSelector={true}
      actions={<ProjectCreateButton/>}
      expandableRow={ProjectExpandableRow}
    />
  );
};

const TableOptions = {
  table: 'ProjectsList',
  fetchData: createFetcher('projects'),
  getDefaultFilter: state => ({
    customer: getCustomer(state).uuid,
    o: 'name',
  }),
  exportRow: row => [
    row.name,
    row.description,
    formatDateTime(row.created),
  ],
  exportFields: [
    'Name',
    'Description',
    'Created',
  ],
};

const enhance = compose(
  connectTable(TableOptions),
  withTranslation,
);

export const ProjectsList = enhance(TableComponent);

export default connectAngularComponent(ProjectsList);
