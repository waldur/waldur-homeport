import { FC, useMemo } from 'react';
import {
  OfferingTermsOfService,
  marketplaceOfferingTermsOfServiceList,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { USER_TOS_MANAGEMENT_TABLE_ID } from '@waldur/user/constants';

import { OfferingSectionProps } from '../types';

import { AddTosButton } from './AddTosButton';
import { TosRowActions } from './TosRowActions';
export const TosManagementSection: FC<OfferingSectionProps> = ({
  offering,
}) => {
  const filter = useMemo(
    () => ({ offering_uuid: offering.uuid }),
    [offering.uuid],
  );
  const tableProps = useTable({
    table: USER_TOS_MANAGEMENT_TABLE_ID,
    filter,
    fetchData: createFetcher(marketplaceOfferingTermsOfServiceList),
  });

  return (
    <Table<OfferingTermsOfService>
      {...tableProps}
      title={translate('Terms of Service Management')}
      columns={[
        {
          title: translate('ToS version'),
          render: ({ row }) => <>{row.version}</>,
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <span
              className={`badge ${
                row.is_active
                  ? 'badge-success'
                  : row.is_active === false
                    ? 'badge-warning'
                    : 'badge-secondary'
              }`}
            >
              {row.is_active ? translate('Active') : translate('Inactive')}
            </span>
          ),
        },
      ]}
      verboseName={translate('Terms of Service')}
      rowActions={({ row }) => (
        <TosRowActions tos={row} refetch={tableProps.fetch} />
      )}
      tableActions={
        <AddTosButton offering={offering} refetch={tableProps.fetch} />
      }
      hasQuery
      placeholderComponent={
        <div className="text-center py-5">
          <p className="text-muted">
            {translate('No Terms of Service found.')}
          </p>
        </div>
      }
    />
  );
};
