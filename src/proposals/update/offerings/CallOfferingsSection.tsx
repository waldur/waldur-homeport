import { FC } from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { OfferingNameColumn } from '@waldur/marketplace/offerings/list/OfferingNameColumn';
import { OfferingsListTablePlaceholder } from '@waldur/marketplace/offerings/list/OfferingsListTablePlaceholder';
import { OfferingStateCell } from '@waldur/marketplace/offerings/list/OfferingStateCell';
import { ProposalCall } from '@waldur/proposals/types';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

interface CallOfferingsSectionProps {
  call: ProposalCall;
}

export const CallOfferingsSection: FC<CallOfferingsSectionProps> = () => {
  const customer = useSelector(getCustomer);

  const tableProps = useTable({
    table: 'ProviderOfferingsList',
    fetchData: createFetcher(
      `marketplace-service-providers/${customer?.uuid}/offerings`,
    ),
    queryField: 'name',
  });

  return (
    <Table
      {...tableProps}
      id="offerings"
      placeholderComponent={<OfferingsListTablePlaceholder />}
      columns={[
        {
          title: translate('Offering name'),
          render: OfferingNameColumn,
        },
        {
          title: translate('Provider'),
          render: ({ row }) => <>{row.customer_name}</>,
        },
        {
          title: translate('Min allocation'),
          render: () => '500TB',
        },
        {
          title: translate('Max allocation'),
          render: () => '500TB',
        },
        {
          title: translate('State'),
          render: OfferingStateCell,
        },
      ]}
      title={translate('Offerings')}
      verboseName={translate('Offerings')}
      hasQuery={true}
    />
  );
};
