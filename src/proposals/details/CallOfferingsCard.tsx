import { FC } from 'react';

import { translate } from '@/i18n';
import { OfferingDetailsLink } from '@/marketplace/links/OfferingDetailsLink';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { prepaidCapLabel } from '../CallDurationPolicy';
import { CallOffering, Call } from '../types';

interface CallOfferingsCardProps {
  call: Call;
}

export const CallOfferingsCard: FC<CallOfferingsCardProps> = (props) => {
  const tableProps = useTable({
    table: 'CallOfferingsList',
    fetchData: createClientPaginatedFetcher(props.call.offerings),
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
        {
          // Only offerings sold by the month have a length to state, and the
          // call's fixed duration is the ceiling on it.
          title: translate('Prepaid subscriptions'),
          render: ({ row }) => {
            const prepaid = Array.isArray(row.components)
              ? row.components.some((component) => component.is_prepaid)
              : false;
            if (!prepaid) {
              return <>{renderFieldOrDash(null)}</>;
            }
            const cap = prepaidCapLabel(props.call);
            return <>{cap ?? translate('any length the offering allows')}</>;
          },
        },
      ]}
      title={translate('Offerings')}
      verboseName={translate('offerings')}
    />
  );
};
