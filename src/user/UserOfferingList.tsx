import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
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
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

interface OwnProps {
  user?: User;
  hasActionBar?: boolean;
}

const UserOfferingListTable: FunctionComponent<OwnProps> = ({
  hasActionBar = true,
  ...props
}) => {
  const currentUser = useUser();
  const user = props.user || currentUser;
  const { values } = useFormState();
  const filterValues = values;

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
      hasQuery={true}
      hasActionBar={hasActionBar}
      filters={<ProviderOfferingUsersFilter hasOrganizationColumn={true} />}
      expandableRow={OfferingUsersExpandableRow}
      formId={PROVIDER_OFFERING_USERS_FORM_ID}
    />
  );
};

export const UserOfferingList: FunctionComponent<OwnProps> = (props) => {
  const { params } = useCurrentStateAndParams();
  return (
    <Form
      id={PROVIDER_OFFERING_USERS_FORM_ID}
      onSubmit={() => {}}
      initialValues={{ state: params?.filterState }}
      subscription={{ values: true }}
    >
      {() => <UserOfferingListTable {...props} />}
    </Form>
  );
};
