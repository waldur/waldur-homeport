import React from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { TableOptionsType } from '@waldur/table/types';

import { Catalog } from '../types';

interface OwnProps {
  clusterUuid: string;
  projectUuid: string;
  catalogUuid: string;
}

const TableComponent = (props: TableProps<Catalog> & OwnProps) => {
  return (
    <Table<Catalog>
      {...props}
      columns={[
        {
          title: translate('Icon'),
          className: 'col-sm-1',
          render: ({ row }) => (
            <OfferingLogo src={row.icon} className="img-xs me-1" />
          ),
        },
        {
          title: translate('Name'),
          render: ({ row }) => (
            <Link
              state="rancher-template-details"
              params={{
                uuid: props.projectUuid,
                clusterUuid: props.clusterUuid,
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
          render: ({ row }) => <>{row.description}</>,
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
  mapPropsToFilter: (props: OwnProps) => ({
    catalog_uuid: props.catalogUuid,
  }),
  queryField: 'name',
  mapPropsToTableId: (props) => [props.catalogUuid],
};

export const CatalogTemplatesList = connectTable(TableOptions)(
  TableComponent,
) as React.ComponentType<OwnProps>;
