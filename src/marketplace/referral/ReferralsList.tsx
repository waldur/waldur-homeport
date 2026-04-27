import { FunctionComponent, useMemo } from 'react';
import { marketplaceOfferingReferralsList } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { REFERRALS_TABLE } from '@/marketplace/referral/constants';
import { ReferralTypeIcon } from '@/marketplace/referral/ReferralTypeIcon';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

export const ReferralsList: FunctionComponent<{ offering }> = ({
  offering,
}) => {
  const filter = useMemo(() => ({ scope: offering.url }), [offering]);
  const props = useTable({
    table: REFERRALS_TABLE,
    fetchData: createFetcher(marketplaceOfferingReferralsList),
    filter,
  });
  const columns = [
    {
      title: translate('Title'),
      className: 'col-sm-6',
      render: ({ row }) => (
        <>
          <ReferralTypeIcon resourceType={row.resource_type} />
          {row.title}
        </>
      ),

      orderField: 'resource_type',
    },
    {
      title: translate('Published'),
      render: ({ row }) => renderFieldOrDash(row.published),
      orderField: 'published',
    },
    {
      title: translate('Publisher'),
      render: ({ row }) => renderFieldOrDash(row.publisher),
    },
    {
      title: translate('PID'),
      render: ({ row }) => (
        <Tip label={row.relation_type} id="relation-type-label">
          {row.pid}
        </Tip>
      ),
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('referrals')}
      showPageSizeSelector={true}
    />
  );
};
