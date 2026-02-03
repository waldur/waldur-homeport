import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { marketplaceOfferingUsersList } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { OfferingUserRowActions } from '@waldur/marketplace/offerings/actions/OfferingUserRowActions';
import { CreateOfferingUserButton } from '@waldur/marketplace/offerings/details/CreateOfferingUserButton';
import { UserImportButton } from '@waldur/marketplace/offerings/import-users/UserImportButton';
import { TosReportingButton } from '@waldur/marketplace/offerings/update/tos/TosReportingButton';
import { OfferingUserStateField } from '@waldur/marketplace/OfferingUserStateField';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { TableExportButton } from '@waldur/table/TableExportButton';
import { TableWithPortal } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { PROVIDER_OFFERING_USERS_FORM_ID } from '../constants';

import { CreateProviderOfferingUserButton } from './CreateProviderOfferingUserButton';
import { OfferingUsersExpandableRow } from './OfferingUsersExpandableRow';
import { ProviderOfferingUsersFilter } from './ProviderOfferingUsersFilter';

export const ProviderOfferingUsersListComponent: FunctionComponent<
  Partial<TableWithPortal> & {
    provider?;
    hasOrganizationColumn?: boolean;
    offering?: {
      uuid: string;
      customer_uuid?: string;
      plugin_options?: { service_provider_can_create_offering_user?: boolean };
      has_compliance_requirements?: boolean;
    };
    tableActions?: React.ReactNode | ((tableProps: any) => React.ReactNode);
  }
> = ({ provider, hasOrganizationColumn, portal, offering, tableActions }) => {
  const filterValues = useSelector(
    getFormValues(PROVIDER_OFFERING_USERS_FORM_ID),
  ) as { offering?; provider?; state?: Array<{ value: any }> };
  const filter = useMemo(
    () => ({
      provider_uuid: hasOrganizationColumn
        ? filterValues?.provider?.customer_uuid
        : provider?.customer_uuid,
      offering_uuid: offering?.uuid || filterValues?.offering?.uuid,
      state: filterValues?.state?.map((option) => option.value),
    }),
    [provider, filterValues, offering, hasOrganizationColumn],
  );
  const tableProps = useTable({
    table: 'marketplace-offering-users',
    fetchData: createFetcher(marketplaceOfferingUsersList),
    filter,
    queryField: 'query',
  });
  const offeringColumn = !offering
    ? [
        {
          title: translate('Offering'),
          render: ({ row }) => (
            <Link
              state="public-offering.marketplace-public-offering"
              params={{ uuid: row.offering_uuid }}
              label={row.offering_name}
            />
          ),
          filter: 'offering',
          inlineFilter: (row) => ({
            name: row.offering_name,
            uuid: row.offering_uuid,
          }),
        },
      ]
    : [];
  const organizationColumn =
    hasOrganizationColumn || offering
      ? [
          {
            title: translate('Organization'),
            render: ({ row }) => row.customer_name,
            filter: 'provider',
            inlineFilter: (row) => ({
              customer_name: row.customer_name,
              customer_uuid: row.customer_uuid,
            }),
          },
        ]
      : [];
  const stateColumn =
    provider || hasOrganizationColumn || offering
      ? [
          {
            title: translate('Account state'),
            render: OfferingUserStateField,
          },
        ]
      : [];
  const tosConsentColumn = isFeatureVisible(
    MarketplaceFeatures.display_user_tos,
  )
    ? [
        {
          title: translate('ToS consent status'),
          render: ({ row }) => {
            if (row.has_consent) {
              return (
                <Badge variant="success" pill outline>
                  {translate('Accepted')}
                </Badge>
              );
            }
            return (
              <Badge variant="warning" pill outline>
                {translate('Not accepted')}
              </Badge>
            );
          },
        },
      ]
    : [];
  const columns = [
    ...offeringColumn,
    ...organizationColumn,
    {
      title: translate('User'),
      render: ({ row }) => row.user_full_name,
    },
    {
      title: translate('External username'),
      render: ({ row }) => row.username || 'N/A',
      orderField: 'username',
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      orderField: 'created',
    },
    {
      title: translate('Modified'),
      render: ({ row }) => formatDateTime(row.modified),
      orderField: 'modified',
    },
    ...stateColumn,
    ...tosConsentColumn,
  ];

  const showExpandableRow = offering
    ? offering.has_compliance_requirements
    : Boolean(provider) ||
      (hasOrganizationColumn &&
        isFeatureVisible(MarketplaceFeatures.display_user_tos));

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Offering users')}
      showPageSizeSelector={true}
      filters={
        !offering ? (
          <ProviderOfferingUsersFilter
            hasOrganizationColumn={hasOrganizationColumn}
          />
        ) : undefined
      }
      portal={portal}
      hasActionBar={!portal || !!portal?.additionalActions}
      cardBordered={!portal}
      fullWidth={!!portal}
      tableActions={
        tableActions ? (
          typeof tableActions === 'function' ? (
            tableActions(tableProps)
          ) : (
            tableActions
          )
        ) : portal?.additionalActions ? (
          typeof portal.additionalActions === 'function' ? (
            portal.additionalActions(tableProps)
          ) : (
            portal.additionalActions
          )
        ) : offering ? (
          <CreateOfferingUserButton
            offering={offering}
            onSuccess={tableProps.fetch}
          />
        ) : (
          <>
            {provider && (
              <TosReportingButton providerUuid={provider.customer_uuid} />
            )}
            <UserImportButton refetch={tableProps.fetch} provider={provider} />
            <TableExportButton {...tableProps} />
            <CreateProviderOfferingUserButton
              refetch={tableProps.fetch}
              provider={provider}
            />
          </>
        )
      }
      rowActions={({ row }) => (
        <OfferingUserRowActions
          row={row}
          fetch={tableProps.fetch}
          provider={provider}
          offering={offering}
        />
      )}
      hasQuery={true}
      expandableRow={showExpandableRow ? OfferingUsersExpandableRow : undefined}
    />
  );
};
