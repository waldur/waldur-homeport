import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { REFERRALS_TABLE } from '@waldur/marketplace/referral/constants';
import { ReferralTypeIcon } from '@waldur/marketplace/referral/ReferralTypeIcon';
import { connectTable, createFetcher, Table } from '@waldur/table';
import { ANONYMOUS_CONFIG } from '@waldur/table/api';

const TableComponent = (props) => {
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
        <Tooltip label={row.relation_type} id="relation-type-label">
          {row.pid}
        </Tooltip>
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

const TableOptions = {
  table: REFERRALS_TABLE,
  fetchData: (request) =>
    createFetcher(
      'marketplace-offering-referrals',
      ENV.plugins.WALDUR_MARKETPLACE.ANONYMOUS_USER_CAN_VIEW_OFFERINGS
        ? ANONYMOUS_CONFIG
        : undefined,
    )(request),
  mapPropsToFilter: (props) => ({ scope: props.offering.url }),
};

const enhance = connectTable(TableOptions);

export const ReferralsList = enhance(TableComponent);
