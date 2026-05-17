import { FC } from 'react';
import {
  RequestedOffering,
  proposalProtectedCallsOfferingsList,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { CallOfferingStateField } from '@/proposals/details/CallOfferingStateField';
import { Call } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { AddOfferingButton } from './AddOfferingButton';
import { CallOfferingExpandableRow } from './CallOfferingExpandableRow';
import { CallOfferingRowActions } from './CallOfferingRowActions';

interface CallOfferingsSectionProps {
  call: Call;
}

export const CallOfferingsSection: FC<CallOfferingsSectionProps> = (props) => {
  const tableProps = useTable({
    table: 'CallOfferingsList',
    fetchData: createFetcher(proposalProtectedCallsOfferingsList, {
      path: { uuid: props.call.uuid },
    }),
  });

  return (
    <Table<RequestedOffering>
      {...tableProps}
      id="offerings"
      columns={[
        {
          title: translate('Offering name'),
          render: ({ row }) => <>{row.offering_name}</>,
        },
        {
          title: translate('Provider'),
          render: ({ row }) => <>{renderFieldOrDash(row.provider_name)}</>,
        },
        {
          title: translate('Requested by'),
          render: ({ row }) => <>{renderFieldOrDash(row.created_by_name)}</>,
        },
        {
          title: translate('Approved by'),
          render: ({ row }) => <>{renderFieldOrDash(row.approved_by_name)}</>,
        },
        {
          title: translate('State'),
          render: CallOfferingStateField,
        },
      ]}
      title={translate('Offerings')}
      verboseName={translate('Offerings')}
      tableActions={
        <AddOfferingButton call={props.call} refetch={tableProps.fetch} />
      }
      expandableRow={CallOfferingExpandableRow}
      rowActions={({ row }) => (
        <CallOfferingRowActions row={row} refetch={tableProps.fetch} />
      )}
      showPageSizeSelector
    />
  );
};
