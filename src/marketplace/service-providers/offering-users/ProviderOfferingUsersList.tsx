import { FunctionComponent, useMemo } from 'react';
import { marketplaceOfferingUsersList } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { ENV } from '@/core/config';
import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { Tip } from '@/core/Tooltip';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { OfferingUserRowActions } from '@/marketplace/offerings/actions/OfferingUserRowActions';
import { CreateOfferingUserButton } from '@/marketplace/offerings/details/CreateOfferingUserButton';
import { FIELD_MAPPING } from '@/marketplace/offerings/details/OfferingUserDetailsDialog';
import { UserImportButton } from '@/marketplace/offerings/import-users/UserImportButton';
import { TosReportingButton } from '@/marketplace/offerings/update/tos/TosReportingButton';
import {
  OfferingUserRuntimeStateField,
  OfferingUserStateField,
} from '@/marketplace/OfferingUserStateField';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableExportButton } from '@/table/TableExportButton';
import { TableWithPortal } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { CreateProviderOfferingUserButton } from './CreateProviderOfferingUserButton';
import { OfferingUsersExpandableRow } from './OfferingUsersExpandableRow';
import {
  ProviderOfferingUsersFilter,
  PROVIDER_OFFERING_USERS_FORM_ID,
} from './ProviderOfferingUsersFilter';

const mandatoryFields = [
  'uuid',
  'customer_uuid',
  'is_restricted',
  'state',
  'user_uuid',
  'offering_uuid',
  'service_provider_comment',
  'service_provider_comment_url',
  'is_profile_complete',
  'missing_profile_attributes',
];

export const ProviderOfferingUsersList: FunctionComponent<
  Partial<TableWithPortal> & {
    provider?;
    hasOrganizationColumn?: boolean;
    offering?: {
      uuid: string;
      customer_uuid?: string;
      plugin_options?: {
        service_provider_can_create_offering_user?: boolean;
        enable_posix_account?: boolean;
      };
      has_compliance_requirements?: boolean;
    };
    tableActions?: React.ReactNode | ((tableProps: any) => React.ReactNode);
  }
> = ({ provider, hasOrganizationColumn, portal, offering, tableActions }) => {
  const values = useFilterValues('marketplace-offering-users');
  const filterValues = values;

  // POSIX columns are hidden when the (single) offering manages no POSIX
  // account; in the provider-wide list, offerings are mixed so they stay.
  const showPosixColumns =
    isFeatureVisible(MarketplaceFeatures.show_posix_id_pools) &&
    (!offering || offering.plugin_options?.enable_posix_account !== false);

  const filter = useMemo(
    () => ({
      provider_uuid: hasOrganizationColumn
        ? filterValues?.provider?.customer_uuid
        : provider?.customer_uuid,
      offering_uuid: offering?.uuid || filterValues?.offering?.uuid,
      state: filterValues?.state?.map((option) => option.value),
      has_complete_profile: filterValues?.has_complete_profile,
    }),
    [provider, filterValues, offering, hasOrganizationColumn],
  );
  const tableProps = useTable({
    table: 'marketplace-offering-users',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceOfferingUsersList),
    filter,
    queryField: 'query',
    mandatoryFields,
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
          export: 'offering_name',
          filter: 'offering',
          inlineFilter: (row) => ({
            name: row.offering_name,
            uuid: row.offering_uuid,
          }),
          id: 'offering',
          keys: ['offering_uuid', 'offering_name'],
        },
      ]
    : [];
  const organizationColumn =
    hasOrganizationColumn || offering
      ? [
          {
            title: translate('Organization'),
            render: ({ row }) => row.customer_name,
            export: 'customer_name',
            filter: 'provider',
            inlineFilter: (row) => ({
              customer_name: row.customer_name,
              customer_uuid: row.customer_uuid,
            }),
            id: 'organization',
            keys: ['customer_name', 'customer_uuid'],
          },
        ]
      : [];
  const stateColumn =
    provider || hasOrganizationColumn || offering
      ? [
          {
            title: translate('Account state'),
            render: OfferingUserStateField,
            export: 'state',
            id: 'state',
            keys: ['state'],
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
          export: (row) =>
            row.has_consent ? translate('Accepted') : translate('Not accepted'),
          id: 'has_consent',
          keys: ['has_consent'],
        },
      ]
    : [];
  const profileCompleteColumn = ENV.plugins.WALDUR_CORE
    .ENFORCE_OFFERING_USER_PROFILE_COMPLETENESS
    ? [
        {
          title: translate('Profile complete'),
          render: ({ row }) => {
            if (row.is_profile_complete) {
              return (
                <Badge variant="success" pill outline>
                  {translate('Complete')}
                </Badge>
              );
            }
            const missingLabels = (row.missing_profile_attributes || [])
              .map((key) => {
                const mapping = FIELD_MAPPING[key];
                return mapping
                  ? mapping.label()
                  : key
                      .replace(/_/g, ' ')
                      .replace(/^\w/, (c) => c.toUpperCase());
              })
              .join(', ');
            const badge = (
              <Badge variant="warning" pill outline>
                {translate('Incomplete')}
              </Badge>
            );
            return missingLabels ? (
              <Tip
                label={translate('Missing: {attributes}', {
                  attributes: missingLabels,
                })}
                id={`profile-incomplete-${row.uuid}`}
              >
                {badge}
              </Tip>
            ) : (
              badge
            );
          },
          export: (row) =>
            row.is_profile_complete
              ? translate('Complete')
              : translate('Incomplete'),
          id: 'is_profile_complete',
          keys: ['is_profile_complete', 'missing_profile_attributes'],
        },
      ]
    : [];
  const columns = [
    ...offeringColumn,
    ...organizationColumn,
    {
      title: translate('First name'),
      render: ({ row }) => renderFieldOrDash(row.user_first_name),
      export: 'user_first_name',
      orderField: 'user_first_name',
      id: 'user_first_name',
      keys: ['user_first_name'],
    },
    {
      title: translate('Last name'),
      render: ({ row }) => renderFieldOrDash(row.user_last_name),
      export: 'user_last_name',
      orderField: 'user_last_name',
      id: 'user_last_name',
      keys: ['user_last_name'],
    },
    {
      title: translate('Username'),
      render: ({ row }) => renderFieldOrDash(row.user_username),
      export: 'user_username',
      copyField: (row) => row.user_username,
      ellipsis: false,
      id: 'user_username',
      keys: ['user_username'],
    },
    {
      title: translate('External username'),
      render: ({ row }) => renderFieldOrDash(row.username),
      export: 'username',
      orderField: 'username',
      id: 'username',
      keys: ['username'],
    },
    ...(showPosixColumns
      ? [
          {
            title: translate('UID'),
            render: ({ row }) => renderFieldOrDash(row.uidnumber),
            export: 'uidnumber',
            copyField: (row) =>
              row.uidnumber != null ? String(row.uidnumber) : undefined,
            id: 'uidnumber',
            keys: ['uidnumber'],
          },
          {
            title: translate('GID'),
            render: ({ row }) => renderFieldOrDash(row.primarygroup),
            export: 'primarygroup',
            copyField: (row) =>
              row.primarygroup != null ? String(row.primarygroup) : undefined,
            id: 'primarygroup',
            keys: ['primarygroup'],
          },
        ]
      : []),
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
      export: (row) => formatDateTime(row.created),
      orderField: 'created',
      id: 'created',
      keys: ['created'],
    },
    {
      title: translate('Modified'),
      render: ({ row }) => formatDateTime(row.modified),
      export: (row) => formatDateTime(row.modified),
      orderField: 'modified',
      id: 'modified',
      keys: ['modified'],
    },
    ...stateColumn,
    {
      title: translate('Runtime state'),
      render: OfferingUserRuntimeStateField,
      export: 'runtime_state',
      id: 'runtime_state',
      keys: ['runtime_state'],
      optional: true,
    },
    ...tosConsentColumn,
    ...profileCompleteColumn,
  ];

  const showExpandableRow = offering
    ? offering.has_compliance_requirements || showPosixColumns
    : Boolean(provider) ||
      (hasOrganizationColumn &&
        isFeatureVisible(MarketplaceFeatures.display_user_tos));

  return (
    <Table
      {...tableProps}
      columns={columns}
      title={translate('Offering users')}
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
            tableActions({ ...tableProps, columns })
          ) : (
            tableActions
          )
        ) : portal?.additionalActions ? (
          typeof portal.additionalActions === 'function' ? (
            portal.additionalActions({ ...tableProps, columns })
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
            <TableExportButton {...tableProps} columns={columns} />
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
      hasOptionalColumns
      expandableRow={showExpandableRow ? OfferingUsersExpandableRow : undefined}
      formId={PROVIDER_OFFERING_USERS_FORM_ID}
    />
  );
};
