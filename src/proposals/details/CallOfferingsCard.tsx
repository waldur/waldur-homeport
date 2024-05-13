import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { Table } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { CallOffering, Call } from '../types';

import { CallOfferingStateField } from './CallOfferingStateField';

interface CallOfferingsCardProps {
  call: Call;
}

export const CallOfferingsCard: FC<CallOfferingsCardProps> = (props) => {
  const tableProps = useTable({
    table: 'CallOfferingsList',
    fetchData: () =>
      Promise.resolve({
        rows: props.call.offerings,
        resultCount: props.call.offerings.length,
      }),
  });

  return (
    <Table<CallOffering>
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
          title: translate('State'),
          render: CallOfferingStateField,
        },
      ]}
      title={translate('Offerings')}
      verboseName={translate('Offerings')}
    />
  );
};
