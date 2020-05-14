import * as React from 'react';

import { Link } from '@waldur/core/Link';
import { $state } from '@waldur/core/services';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { TableOptionsType } from '@waldur/table-react/types';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Icon'),
          className: 'col-sm-1',
          render: ({ row }) => (
            <OfferingLogo src={row.icon} className="img-xs m-r-xs" />
          ),
        },
        {
          title: translate('Name'),
          render: ({ row }) => (
            <Link
              state="rancher-template-details"
              params={{
                uuid: $state.params.uuid,
                clusterUuid: $state.params.clusterUuid,
                templateUuid: row.uuid,
              }}
            >
              {row.name}
            </Link>
          ),
          orderField: 'name',
        },
        {
          title: translate('Description'),
          render: ({ row }) => <span>{row.description}</span>,
        },
      ]}
      verboseName={translate('application templates')}
      hasQuery={true}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'rancher-catalog-templates',
  fetchData: createFetcher('rancher-templates'),
  getDefaultFilter: () => ({
    catalog_uuid: $state.params.catalogUuid,
  }),
  queryField: 'name',
};

export const CatalogTemplatesList = connectTable(TableOptions)(TableComponent);
