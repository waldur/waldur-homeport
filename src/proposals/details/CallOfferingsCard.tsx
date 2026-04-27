import { FC } from 'react';

import { translate } from '@/i18n';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CallOffering, Call } from '../types';

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
          render: ({ row }) => (
            <OfferingDetailsLink offering_uuid={row.offering_uuid}>
              {row.offering_name}
            </OfferingDetailsLink>
          ),
        },
        {
          title: translate('Provider'),
          render: ({ row }) => <>{renderFieldOrDash(row.provider_name)}</>,
        },
        {
          title: translate('Category'),
          render: ({ row }) => <>{row.category_name}</>,
        },
      ]}
      title={translate('Offerings')}
      verboseName={translate('offerings')}
    />
  );
};
