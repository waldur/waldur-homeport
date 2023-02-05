import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';

import { EmptyResourcesListPlaceholder } from '../resources/list/EmptyResourcesListPlaceholder';
import { ResourceNameField } from '../resources/list/ResourceNameField';
import { ResourceStateField } from '../resources/list/ResourceStateField';

export const TableComponent: FunctionComponent<any> = (props) => {
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
        },
        {
          title: translate('Category'),
          render: ({ row }) => row.category_title,
        },
        {
          title: translate('Offering'),
          render: ({ row }) => row.offering_name,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => formatDateTime(row.created),
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ResourceStateField,
        },
      ]}
      verboseName={translate('Resources')}
      placeholderComponent={<EmptyResourcesListPlaceholder />}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      hasActionBar={false}
    />
  );
};

const mapPropsToFilter = (props) => {
  const filter: Record<string, any> = {};
  filter.project_uuid = props.project_uuid;
  filter.provider_uuid = props.provider_uuid;
  filter.state = ['OK', 'Erred', 'Creating', 'Updating', 'Terminating'];
  return filter;
};

const TableOptions = {
  table: 'ProviderProjectResourcesList',
  fetchData: createFetcher('marketplace-resources'),
  mapPropsToFilter,
  queryField: 'query',
};

const enhance = connectTable(TableOptions);

export const ProviderProjectResourcesList = enhance(
  TableComponent,
) as React.ComponentType<any>;
