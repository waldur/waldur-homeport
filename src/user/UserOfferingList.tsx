import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { marketplaceOfferingUsersList, User } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { OfferingUserStateField } from '@waldur/marketplace/OfferingUserStateField';
import { PROVIDER_OFFERING_USERS_FORM_ID } from '@waldur/marketplace/service-providers/constants';
import { OfferingUsersExpandableRow } from '@waldur/marketplace/service-providers/offering-users/OfferingUsersExpandableRow';
import { ProviderOfferingUsersFilter } from '@waldur/marketplace/service-providers/offering-users/ProviderOfferingUsersFilter';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { useUser } from '@waldur/workspace/hooks';

interface OwnProps {
  user?: User;
  hasActionBar?: boolean;
}

export const UserOfferingList: FunctionComponent<OwnProps> = ({
  hasActionBar = true,
  ...props
}) => {
  const currentUser = useUser();
  const user = props.user || currentUser;
  const filterValues = useSelector(
    getFormValues(PROVIDER_OFFERING_USERS_FORM_ID),
  ) as { offering?; provider?; state?: Array<{ value: any }> };
  const filter = useMemo(
    () => ({
      provider_uuid: filterValues?.provider?.customer_uuid,
      offering_uuid: filterValues?.offering?.uuid,
      state: filterValues?.state?.map((option) => option.value),
      user_uuid: user?.uuid,
    }),
    [filterValues, user],
  );
  const tableProps = useTable({
    table: 'UserOfferingList',
    fetchData: createFetcher(marketplaceOfferingUsersList),
    filter,
    queryField: 'query',
  });
  const columns = [
    {
      title: translate('Offering'),
      render: ({ row }) => <>{row.offering_name}</>,
    },
    {
      title: translate('Username'),
      render: ({ row }) => <>{row.username || 'N/A'}</>,
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
      hasQuery={true}
      hasActionBar={hasActionBar}
      filters={<ProviderOfferingUsersFilter hasOrganizationColumn={true} />}
      expandableRow={OfferingUsersExpandableRow}
    />
  );
};
