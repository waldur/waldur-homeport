import { FC, useEffect, useMemo } from 'react';
import {
  MaintenanceAnnouncement,
  MaintenanceAnnouncementOffering,
} from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { IMPACT_LABELS } from './utils';

export const MaintenanceReportingExpandableRow: FC<{
  row: MaintenanceAnnouncement;
}> = ({ row: maintenance }) => {
  const user = useUser();
  const customer = useCustomer();
  const showInternalNotes = useMemo(
    () => checkIsOwnerOrStaff(customer, user),
    [customer, user],
  );

  const tableProps = useTable({
    table: 'MaintenanceReportingExpandableRow-' + maintenance.uuid,
    fetchData: createClientPaginatedFetcher(maintenance.affected_offerings),
  });

  useEffect(() => {
    tableProps.fetch();
  }, [maintenance.affected_offerings]);

  return (
    <ExpandableContainer>
      <PropertyList variant="summary" space={4}>
        {showInternalNotes && maintenance.internal_notes && (
          <PropertyItem
            label={
              <>
                {translate('Internal notes')}:
                <span className="text-quaternary block">
                  {translate('Providers/staff visible only')}
                </span>
              </>
            }
            value={maintenance.internal_notes}
            hideIfEmpty={false}
          />
        )}
        <PropertyItem
          label={translate('Message')}
          value={maintenance.message}
        />
      </PropertyList>
      <Table<MaintenanceAnnouncementOffering>
        {...tableProps}
        columns={[
          {
            title: translate('Offering name'),
            render: ({ row }) => row.offering_name,
          },
          {
            title: translate('Impact'),
            render: ({ row }) =>
              renderFieldOrDash(IMPACT_LABELS[row.impact_level || 1]),
          },
          {
            title: translate('Description'),
            render: ({ row }) => renderFieldOrDash(row.impact_description),
          },
        ]}
        verboseName={translate('Affected offerings')}
        hasActionBar={false}
        minHeight="auto"
        equalColWidth
      />
    </ExpandableContainer>
  );
};
