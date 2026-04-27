import { FC } from 'react';

import { AtLeast } from '@/core/types';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { MaintenanceForm, MAINTENANCE_IMPACT_LEVEL } from '../types';

interface AffectedOfferingsTableProps {
  values: AtLeast<
    MaintenanceForm,
    'offerings' | 'impact_level' | 'impact_description'
  >;
}

export const AffectedOfferingsTable: FC<AffectedOfferingsTableProps> = ({
  values,
}) => {
  const selectedOfferings = values.offerings;

  const tableProps = useTable({
    table: 'MaintenanceProviderOfferingsPreview',
    fetchData: () => Promise.resolve({ rows: selectedOfferings }),
  });

  if (!selectedOfferings?.length) {
    return (
      <p className="text-muted text-center">
        {translate('No offering is affected')}
      </p>
    );
  }

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Offering name'),
          render: ({ row }) => renderFieldOrDash(row.name),
        },
        {
          title: translate('Impact level'),
          render: ({ row }) =>
            renderFieldOrDash(
              MAINTENANCE_IMPACT_LEVEL[values.impact_level?.[row.uuid]],
            ),
        },
        {
          title: translate('Description'),
          render: ({ row }) =>
            renderFieldOrDash(values.impact_description?.[row.uuid]),
        },
      ]}
      verboseName={translate('Affected offerings')}
      cardBordered={false}
      hasActionBar={false}
      minHeight="auto"
      fullWidth
      equalColWidth
    />
  );
};
