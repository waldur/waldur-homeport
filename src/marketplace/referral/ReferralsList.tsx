import { FunctionComponent, useMemo } from 'react';

import { ENV } from '@waldur/configs/default';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { REFERRALS_TABLE } from '@waldur/marketplace/referral/constants';
import { ReferralTypeIcon } from '@waldur/marketplace/referral/ReferralTypeIcon';
import { createFetcher, Table } from '@waldur/table';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';
import { useTable } from '@waldur/table/utils';

export const ReferralsList: FunctionComponent<{ offering }> = ({
  offering,
}) => {
  const filter = useMemo(() => ({ scope: offering.url }), [offering]);
  const props = useTable({
    table: REFERRALS_TABLE,
    fetchData: (request) =>
      createFetcher(
        'marketplace-offering-referrals',
        ENV.plugins.WALDUR_MARKETPLACE.ANONYMOUS_USER_CAN_VIEW_OFFERINGS
          ? ANONYMOUS_CONFIG
          : undefined,
      )(request),
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
      render: ({ row }) => row.published || 'N/A',
      orderField: 'published',
    },
    {
      title: translate('Publisher'),
      render: ({ row }) => row.publisher || 'N/A',
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
