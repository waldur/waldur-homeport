import { FC, useMemo } from 'react';
import { ProviderHelpdesk, providerHelpdesksList } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { getHealthMeta } from '../common/backend';

import { CreateHelpdeskButton } from './CreateHelpdeskButton';
import { HelpdeskRowActions } from './HelpdeskRowActions';

export const HelpdeskConfigPage: FC = () => {
  const customer = useCustomer();
  const serviceProviderUuid = customer?.service_provider_uuid;
  const filter = useMemo(
    () => ({ service_provider_uuid: serviceProviderUuid }),
    [serviceProviderUuid],
  );
  const tableProps = useTable({
    table: 'provider-helpdesks',
    fetchData: createFetcher(providerHelpdesksList),
    filter,
  });

  const columns = useMemo<Array<Column<ProviderHelpdesk>>>(
    () => [
      {
        title: translate('Backend type'),
        render: ({ row }) => renderFieldOrDash(row.backend_type),
      },
      {
        title: translate('Active'),
        render: ({ row }) => <BooleanField value={Boolean(row.is_active)} />,
      },
      {
        title: translate('Notification email'),
        copyField: (row) => row.notification_email ?? '',
        render: ({ row }) => renderFieldOrDash(row.notification_email),
      },
      {
        title: translate('Health'),
        render: ({ row }) => {
          const meta = getHealthMeta(row.health_status);
          return (
            <Badge variant={meta.variant} pill outline>
              {meta.label}
            </Badge>
          );
        },
      },
      {
        title: translate('Failed routings'),
        render: ({ row }) => <>{row.failed_routing_count}</>,
      },
      {
        title: translate('Created'),
        render: ({ row }) => renderFieldOrDash(formatDate(row.created)),
      },
    ],
    [],
  );

  // At most one helpdesk per provider — only offer "Add" when none exists.
  const hasHelpdesk = tableProps.rows.length > 0;

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Helpdesk')}
      showPageSizeSelector={true}
      tableActions={
        !hasHelpdesk && serviceProviderUuid ? (
          <CreateHelpdeskButton
            serviceProviderUuid={serviceProviderUuid}
            refetch={tableProps.fetch}
          />
        ) : undefined
      }
      rowActions={HelpdeskRowActions}
    />
  );
};
