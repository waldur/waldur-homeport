import { useMemo } from 'react';
import {
  marketplaceOfferingUsersList,
  OfferingUser,
  ServiceProviderAccount,
} from 'waldur-js-client';

import { Badge } from 'waldur-ui';

import { formatDateTime } from '@/core/dateUtils';
import { TruncatedDescription } from '@/core/TruncatedDescription';
import { translate } from '@/i18n';
import {
  OfferingUserRuntimeStateField,
  OfferingUserStateField,
} from '@/marketplace/OfferingUserStateField';
import { Field } from '@/resource/summary';
import { createFetcher } from '@/table/api';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

/**
 * Where a provider account comes from: the offerings whose accounts it backs.
 * Who the person is lives in the Details row action.
 */
export const ProviderAccountExpandableRow = ({
  row: account,
}: {
  row: ServiceProviderAccount;
}) => {
  const customer = useCustomer();
  // The person's accounts on this provider's offerings.
  const filter = useMemo(
    () => ({ provider_uuid: customer?.uuid, user_uuid: account.user_uuid }),
    [customer?.uuid, account.user_uuid],
  );
  const tableProps = useTable({
    table: 'providerAccountOfferingUsers-' + account.uuid,
    fetchData: createFetcher(marketplaceOfferingUsersList),
    filter,
  });

  return (
    <ExpandableContainer>
      <Field
        label={translate('Created')}
        value={formatDateTime(account.created)}
        labelClass="mw-175px"
      />
      <Field
        label={translate('Runtime state')}
        value={<OfferingUserRuntimeStateField row={account} />}
        labelClass="mw-175px"
      />
      <Field
        label={translate('Restricted')}
        value={account.is_restricted ? translate('Yes') : translate('No')}
        labelClass="mw-175px"
      />
      <Field
        label={translate('Comment')}
        value={
          account.service_provider_comment ? (
            <TruncatedDescription
              text={account.service_provider_comment}
              max={550}
            />
          ) : (
            renderFieldOrDash(null)
          )
        }
        labelClass="mw-175px"
        className="align-baseline"
      />
      <Field
        label={translate('Comment URL')}
        value={renderFieldOrDash(account.service_provider_comment_url)}
        labelClass="mw-175px"
      />
      <Table<OfferingUser>
        {...tableProps}
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => renderFieldOrDash(row.offering_name),
          },
          {
            // An offering account backed by this provider account carries its
            // username, so repeating it says nothing. Only an offering that
            // keeps its own account (or one not yet adopted) can differ.
            title: translate('Account'),
            render: ({ row }) =>
              row.username === account.username ? (
                <span className="text-muted">{translate('Shared')}</span>
              ) : (
                <>
                  {renderFieldOrDash(row.username)}{' '}
                  <Badge variant="warning" shape="pill" tone="outline">
                    {translate('Own account')}
                  </Badge>
                </>
              ),
          },
          {
            title: translate('Created'),
            render: ({ row }) => formatDateTime(row.created),
          },
          {
            title: translate('State'),
            render: OfferingUserStateField,
          },
        ]}
        title={translate('Offering accounts')}
        verboseName={translate('offering accounts')}
        hideRefresh
        className="mt-7"
        headerClassName="min-h-40px py-0"
        titleClassName="h4 fw-bold text-gray-700"
        minHeight="auto"
      />
    </ExpandableContainer>
  );
};
