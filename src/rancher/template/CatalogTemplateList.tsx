import { FC, useMemo } from 'react';
import { RancherTemplate } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

interface OwnProps {
  clusterUuid: string;
  projectUuid: string;
  catalogUuid: string;
}

export const CatalogTemplatesList: FC<OwnProps> = (props) => {
  const filter = useMemo(
    () => ({
      catalog_uuid: props.catalogUuid,
    }),
    [props.catalogUuid],
  );
  const tableProps = useTable({
    table: `rancher-catalog-templates-${props.catalogUuid}`,
    fetchData: createFetcher('rancher-templates'),
    filter,
    queryField: 'name',
  });
  return (
    <Table<RancherTemplate>
      {...tableProps}
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

          copyField: (row) => row.name,
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
