import { FunctionComponent } from 'react';
import { NestedQoS, Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingQoSExpandableRow } from '../update/qos/OfferingQoSExpandableRow';

interface PublicOfferingQoSProps {
  offering: Offering;
}

export const PublicOfferingQoS: FunctionComponent<PublicOfferingQoSProps> = ({
  offering,
}) => {
  const tableProps = useTable({
    table: 'PublicOfferingQoS',
    fetchData: createClientPaginatedFetcher(offering?.qos_profiles || []),
  });

  return (
    <div className="mb-8" id="qos-profiles">
      <div>
        <Table<NestedQoS>
          {...tableProps}
          columns={[
            {
              title: translate('Name'),
              render: ({ row }) => renderFieldOrDash(row.name),
            },
            {
              title: translate('Max nodes'),
              render: ({ row }) => renderFieldOrDash(row.max_nodes),
            },
            {
              title: translate('Max time limit'),
              render: ({ row }) =>
                row.max_time
                  ? translate('{count} minutes', { count: row.max_time })
                  : 'N/A',
            },
          ]}
          verboseName={translate('QoS profiles')}
          title={translate('QoS profiles')}
          hasQuery={false}
          enableExport={false}
          expandableRow={OfferingQoSExpandableRow}
        />
      </div>
    </div>
  );
};
