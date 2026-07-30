import { FC, useState } from 'react';
import { NestedQoS, Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingSectionProps } from '../types';

import { AddOfferingQoSButton } from './AddOfferingQoSButton';
import { DeleteOfferingQoS } from './DeleteOfferingQoS';
import { EditOfferingQoSButton } from './EditOfferingQoSButton';
import { OfferingQoSExpandableRow } from './OfferingQoSExpandableRow';

const RowActions = ({ row, refetch, offering }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      data={{ offering }}
      actions={[EditOfferingQoSButton, DeleteOfferingQoS]}
    />
  );
};

export const OfferingQoSSection: FC<OfferingSectionProps> = (props) => {
  const [firstFetch, setFirstFetch] = useState(true);

  const tableProps = useTable({
    table: 'OfferingQoSProfiles',
    fetchData: async (request) => {
      let freshData;
      if (!firstFetch) {
        const res = await props.refetch();
        freshData = (res.data?.offering as Offering)?.qos_profiles;
      } else {
        setFirstFetch(false);
      }

      return createClientPaginatedFetcher(
        freshData || props.offering.qos_profiles || [],
      )(request);
    },
  });

  return (
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
      tableActions={
        <AddOfferingQoSButton
          offering={props.offering}
          refetch={tableProps.fetch}
        />
      }
      rowActions={({ row, fetch }) => (
        <RowActions
          row={row}
          refetch={fetch || props.refetch}
          offering={props.offering}
        />
      )}
      expandableRow={OfferingQoSExpandableRow}
    />
  );
};
