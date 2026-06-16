import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { marketplaceOfferingUsersList, User } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { OfferingUserStateField } from '@/marketplace/OfferingUserStateField';
import { PROVIDER_OFFERING_USERS_FORM_ID } from '@/marketplace/service-providers/constants';
import { OfferingUsersExpandableRow } from '@/marketplace/service-providers/offering-users/OfferingUsersExpandableRow';
import { ProviderOfferingUsersFilter } from '@/marketplace/service-providers/offering-users/ProviderOfferingUsersFilter';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { createAttentionOfferingUsersFetcher } from '@/user/createAttentionOfferingUsersFetcher';
import { useUser } from '@/workspace/hooks';

interface OwnProps {
  user?: User;
  hasActionBar?: boolean;
}

export const UserOfferingList: FunctionComponent<OwnProps> = ({
  hasActionBar = true,
  ...props
}) => {
  const { params } = useCurrentStateAndParams();
  const filterAttention =
    params?.filterAttention === true || params?.filterAttention === 'true';

  const currentUser = useUser();
  const user = props.user || currentUser;
  const filterValues = useFilterValues('UserOfferingList');

  const initialFilters = useMemo(() => {
    if (filterAttention || !params?.filterState) {
      return undefined;
    }
    return { state: params.filterState };
  }, [filterAttention, params?.filterState]);

  const filter = useMemo(
    () => ({
      provider_uuid: filterValues?.provider?.customer_uuid,
      offering_uuid: filterValues?.offering?.uuid,
      state: filterValues?.state?.map((option) => option.value),
      user_uuid: user?.uuid,
    }),
    [filterValues, user],
  );

  const fetchData = useMemo(() => {
    if (filterAttention && user?.uuid) {
      return createAttentionOfferingUsersFetcher(user.uuid);
    }
    return createFetcher(marketplaceOfferingUsersList);
  }, [filterAttention, user?.uuid]);

  const tableProps = useTable({
    table: filterAttention ? 'UserOfferingList-attention' : 'UserOfferingList',
    syncFiltersToURL: !filterAttention,
    initialFilters,
    fetchData,
    filter: filterAttention ? { user_uuid: user?.uuid } : filter,
    queryField: filterAttention ? undefined : 'query',
  });

  const columns = [
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
    },
    {
      title: translate('Username'),
      render: ({ row }) => <>{renderFieldOrDash(row.username)}</>,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
    },
    {
      title: translate('State'),
      render: OfferingUserStateField,
    },
    isFeatureVisible(MarketplaceFeatures.display_user_tos) && {
      title: translate('Consent status'),
      render: ({ row }) => (
        <>
          {row.has_consent ? translate('Accepted') : translate('Not accepted')}
        </>
      ),
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('remote accounts')}
      showPageSizeSelector={true}
      hasQuery={!filterAttention}
      hasActionBar={hasActionBar}
      filters={
        filterAttention ? undefined : (
          <ProviderOfferingUsersFilter hasOrganizationColumn={true} />
        )
      }
      expandableRow={OfferingUsersExpandableRow}
      formId={PROVIDER_OFFERING_USERS_FORM_ID}
    />
  );
};
