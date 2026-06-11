import { FC, useEffect, useMemo } from 'react';
import {
  MaintenanceAnnouncement,
  MaintenanceAnnouncementOffering,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
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
      {showInternalNotes && maintenance.internal_notes && (
        <Field
          label={
            <>
              {translate('Internal notes')}:
              <span className="text-quaternary d-block">
                {translate('Providers/staff visible only')}
              </span>
            </>
          }
          value={renderFieldOrDash(maintenance.internal_notes)}
          space={5}
        />
      )}
      {maintenance.message && (
        <Field
          label={translate('Message')}
          value={maintenance.message}
          space={5}
        />
      )}
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
