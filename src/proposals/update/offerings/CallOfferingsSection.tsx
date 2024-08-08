import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { CallOfferingDeleteButton } from '@waldur/proposals/details/CallOfferingDeleteButton';
import { CallOfferingStateField } from '@waldur/proposals/details/CallOfferingStateField';
import { Call } from '@waldur/proposals/types';
import { createFetcher, Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { AddOfferingButton } from './AddOfferingButton';
import { CallOfferingExpandableRow } from './CallOfferingExpandableRow';

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
    <Table
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
        <CallOfferingDeleteButton row={row} refetch={tableProps.fetch} />
      )}
    />
  );
};
