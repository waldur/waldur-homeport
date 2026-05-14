import { FC, useMemo } from 'react';
import {
  LevelEnum,
  Offering,
  SiteAgentLog,
  marketplaceSiteAgentLogsList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

interface OwnProps {
  offering: Offering;
}

const levelVariant: Record<LevelEnum, string> = {
  DEBUG: 'secondary',
  INFO: 'primary',
  WARNING: 'warning',
  ERROR: 'orange',
  CRITICAL: 'danger',
};

const mandatoryFields: Array<keyof SiteAgentLog> = [
  'uuid',
  'timestamp',
  'level',
  'message',
  'module',
];

const ExpandableRow: FC<{ row: SiteAgentLog }> = ({ row }) => (
  <ExpandableContainer>
    <p>
      <b className="me-2">{translate('Message')}:</b>
      {row.message}
    </p>
  </ExpandableContainer>
);

export const OfferingAlerts: FC<OwnProps> = ({ offering }) => {
  const filter = useMemo(
    () => ({ offering_uuid: offering.uuid }),
    [offering.uuid],
  );

  const tableProps = useTable({
    table: 'OfferingAlerts',
    fetchData: createFetcher(marketplaceSiteAgentLogsList),
    mandatoryFields,
    filter,
  });

  return (
    <Table
      {...tableProps}
      showPageSizeSelector
      title={translate('Agent logs')}
      verboseName={translate('Agent log')}
      className="mb-5"
      headerClassName="min-h-60px"
      fullWidth
      expandableRow={ExpandableRow}
      columns={[
        {
          title: translate('Timestamp'),
          // API returns Unix timestamp in seconds
          render: ({ row }) => <>{formatDateTime(row.timestamp * 1000)}</>,
          width: '1%',
        },
        {
          title: translate('Level'),
          render: ({ row }) => (
            <Badge variant={levelVariant[row.level]} pill outline>
              {row.level}
            </Badge>
          ),
          width: '1%',
        },
        {
          title: translate('Module'),
          render: ({ row }) => <>{row.module}</>,
          width: '1%',
        },
        {
          title: translate('Message'),
          render: ({ row }) => <>{row.message}</>,
        },
      ]}
    />
  );
};
