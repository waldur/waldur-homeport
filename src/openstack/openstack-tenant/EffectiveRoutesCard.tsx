import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import {
  EffectiveRoute,
  EffectiveRoutesResponse,
  openstackRoutersEffectiveRoutesRetrieve,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

interface Props {
  routerUuid: string;
}

type BadgeVariant = 'success' | 'info' | 'warning' | 'default' | 'danger';

const sourceVariant = (source: EffectiveRoute['source']): BadgeVariant => {
  switch (source) {
    case 'default':
      return 'success';
    case 'connected':
      return 'info';
    case 'static':
      return 'warning';
    default:
      return 'default';
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
  if (row.nexthop) return <code>{row.nexthop}</code>;
  if (row.source === 'connected') {
    return (
      <span className="text-muted">
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
  return <span className="text-muted">—</span>;
};

const SubnetCell: FC<{ row: EffectiveRoute }> = ({ row }) => {
  if (row.subnet_name) {
    return (
      <>
        <span>{row.subnet_name}</span>
        {row.subnet_cidr ? (
          <span className="text-muted ms-2">{row.subnet_cidr}</span>
        ) : null}
      </>
    );
  }
  if (row.external_network_name) {
    return <>{row.external_network_name}</>;
  }
  if (row.source === 'static') {
    return (
      <span className="text-muted fst-italic">
        {translate('beyond connected and default routes')}
      </span>
    );
  }
  return <span className="text-muted">—</span>;
};

const DestinationCell: FC<{ row: EffectiveRoute }> = ({ row }) => (
  <code>{row.destination}</code>
);

const SourceCell: FC<{ row: EffectiveRoute }> = ({ row }) => (
  <Badge variant={sourceVariant(row.source)} outline>
    {sourceLabel(row.source)}
  </Badge>
);

const SnatBadge: FC<{ snat: boolean | null; hasGateway: boolean }> = ({
  snat,
  hasGateway,
}) => {
  if (!hasGateway) {
    return (
      <Badge variant="default" outline>
        {translate('No external gateway')}
      </Badge>
    );
  }
  if (snat === false) {
    return (
      <Badge variant="warning" outline>
        {translate('SNAT disabled')}
      </Badge>
    );
  }
  if (snat === true) {
    return (
      <Badge variant="success" outline>
        {translate('SNAT enabled')}
      </Badge>
    );
  }
  return (
    <Badge variant="default" outline>
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

const rowKey = (row: EffectiveRoute, idx: number): string =>
  `${row.source}-${row.destination}-${idx}`;

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

  if (isLoading) return <LoadingSpinner />;
  if (isError || !data) return <LoadingErred loadData={refetch} />;

  // Annotate rows with a synthetic uuid so SimpleTable's default key picks it
  // up; SimpleTable defaults to `rowKey="uuid"` but our routes have no UUID.
  const rows = data.routes.map((r, idx) => ({
    ...r,
    uuid: rowKey(r, idx),
  }));

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="mb-0">
          {translate('Effective routes')}
        </Card.Title>
        <SnatBadge snat={data.snat} hasGateway={data.has_external_gateway} />
      </Card.Header>
      <Card.Body>
        {rows.length === 0 ? (
          <div className="text-muted">
            {translate(
              'No routes — attach an interface or set a gateway to populate this table.',
            )}
          </div>
        ) : (
          <SimpleTable<EffectiveRoute> columns={ROUTE_COLUMNS} rows={rows} />
        )}
      </Card.Body>
    </Card>
  );
};
