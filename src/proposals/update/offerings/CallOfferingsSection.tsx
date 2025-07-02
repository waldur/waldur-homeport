import { FC } from 'react';
import { RequestedOffering } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { CallOfferingStateField } from '@waldur/proposals/details/CallOfferingStateField';
import { Call } from '@waldur/proposals/types';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { AddOfferingButton } from './AddOfferingButton';
import { CallOfferingExpandableRow } from './CallOfferingExpandableRow';
import { CallOfferingRowActions } from './CallOfferingRowActions';

interface CallOfferingsSectionProps {
  call: Call;
}

export const CallOfferingsSection: FC<CallOfferingsSectionProps> = (props) => {
  const tableProps = useTable({
    table: 'CallOfferingsList',
    fetchData: createFetcher(
      `proposal-protected-calls/${props.call.uuid}/offerings`,
    ),
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
    />
  );
};
