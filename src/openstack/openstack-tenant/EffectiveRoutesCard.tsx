import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  EffectiveRoute,
  EffectiveRoutesResponse,
  openstackRoutersEffectiveRoutesRetrieve,
} from 'waldur-js-client';

import { BadgeVariant, Code } from 'waldur-ui';
import { Badge } from 'waldur-ui';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useRowsTable } from '@/table/useRowsTable';

interface Props {
  routerUuid: string;
}

const sourceVariant = (source: EffectiveRoute['source']): BadgeVariant => {
  switch (source) {
    case 'default':
      return 'success';
    case 'connected':
      return 'info';
    case 'static':
      return 'warning';
    default:
      return 'neutral';
  }
};

const sourceLabel = (source: EffectiveRoute['source']): string => {
  switch (source) {
    case 'default':
      return translate('Default');
    case 'connected':
      return translate('Connected');
    case 'static':
      return translate('Static');
    default:
      return source;
  }
};

const ViaCell: FC<{ row: EffectiveRoute }> = ({ row }) => {
  if (row.nexthop) return <Code>{row.nexthop}</Code>;
  if (row.source === 'connected') {
    return (
      <span className="text-quaternary">
        {translate('on-link')}
        {row.port_backend_id ? (
          <>
            {' ('}
            <span title={translate('Router port backend ID')}>
              {row.port_backend_id.slice(0, 8)}
            </span>
            )
          </>
        ) : null}
      </span>
    );
  }
  return <span className="text-quaternary">—</span>;
};

const SubnetCell: FC<{ row: EffectiveRoute }> = ({ row }) => {
  if (row.subnet_name) {
    return (
      <>
        <span>{row.subnet_name}</span>
        {row.subnet_cidr ? (
          <span className="text-quaternary ms-1.5">{row.subnet_cidr}</span>
        ) : null}
      </>
    );
  }
  if (row.external_network_name) {
    return <>{row.external_network_name}</>;
  }
  if (row.source === 'static') {
    return (
      <span className="text-quaternary italic">
        {translate('beyond connected and default routes')}
      </span>
    );
  }
  return <span className="text-quaternary">—</span>;
};

const DestinationCell: FC<{ row: EffectiveRoute }> = ({ row }) => (
  <Code>{row.destination}</Code>
);

const SourceCell: FC<{ row: EffectiveRoute }> = ({ row }) => (
  <Badge variant={sourceVariant(row.source)} tone="outline">
    {sourceLabel(row.source)}
  </Badge>
);

const SnatBadge: FC<{ snat: boolean | null; hasGateway: boolean }> = ({
  snat,
  hasGateway,
}) => {
  if (!hasGateway) {
    return (
      <Badge variant="neutral" tone="outline">
        {translate('No external gateway')}
      </Badge>
    );
  }
  if (snat === false) {
    return (
      <Badge variant="warning" tone="outline">
        {translate('SNAT disabled')}
      </Badge>
    );
  }
  if (snat === true) {
    return (
      <Badge variant="success" tone="outline">
        {translate('SNAT enabled')}
      </Badge>
    );
  }
  return (
    <Badge variant="neutral" tone="outline">
      {translate('SNAT default')}
    </Badge>
  );
};

const ROUTE_COLUMNS: Column<EffectiveRoute>[] = [
  { title: translate('Destination'), render: DestinationCell },
  { title: translate('Via'), render: ViaCell },
  { title: translate('Source'), render: SourceCell },
  { title: translate('On subnet / network'), render: SubnetCell },
];

export const EffectiveRoutesCard: FC<Props> = ({ routerUuid }) => {
  const { data, isLoading, isError, refetch } =
    useQuery<EffectiveRoutesResponse>({
      queryKey: ['openstack-router-effective-routes', routerUuid],
      queryFn: async () => {
        const response = await openstackRoutersEffectiveRoutesRetrieve({
          path: { uuid: routerUuid },
        });
        return response.data as EffectiveRoutesResponse;
      },
    });

  const routes = data?.routes ?? [];
  const tableProps = useRowsTable<EffectiveRoute>(
    `router-effective-routes-${routerUuid}`,
    routes,
    data,
  );

  if (isLoading) return <LoadingSpinner />;
  if (isError || !data) return <LoadingErred loadData={refetch} />;

  return (
    <Table<EffectiveRoute>
      {...tableProps}
      columns={ROUTE_COLUMNS}
      title={translate('Effective routes')}
      verboseName={translate('routes')}
      tableActions={
        <SnatBadge snat={data.snat} hasGateway={data.has_external_gateway} />
      }
      emptyMessage={translate(
        'No routes — attach an interface or set a gateway to populate this table.',
      )}
      hideRefresh
      className="mt-5.5"
      headerClassName="min-h-[40px] py-0"
      titleClassName="h4 font-medium text-secondary"
      minHeight="auto"
      placeholderHasRetry={false}
    />
  );
};
