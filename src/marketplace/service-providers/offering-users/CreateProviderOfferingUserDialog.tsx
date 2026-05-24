import { FC, useMemo } from 'react';
import {
  marketplaceOfferingUsersCreate,
  ServiceProvider,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  providerOfferingsAutocomplete,
  userAutocomplete,
} from '@/marketplace/common/autocompletes';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { useNotify } from '@/store/notify';
import { useUser } from '@/workspace/hooks';

interface OwnProps {
  resolve: {
    provider: ServiceProvider;
    refetch(): void;
  };
}

export const CreateProviderOfferingUserDialog: FC<OwnProps> = ({
  resolve: { provider, refetch },
}) => {
  const curretUser = useUser();
  const { showError } = useNotify();

  const mutation = useManagedMutation<
    any,
    any,
    {
      offering: { url: string; customer_uuid: string };
      user: { url: string };
      username?: string;
    }
  >({
    mutationFn: (formData) =>
      marketplaceOfferingUsersCreate({
        body: {
          offering: formData.offering.url,
          user: formData.user.url,
          username: formData.username,
        },
      }),
    successMessage: translate('Offering user has been created.'),
    errorMessage: translate('Unable to create offering user.'),
    refetch,
  });

  const handleSubmit = async (formData) => {
    const canCreateOfferingUser = hasPermission(curretUser, {
      permission: PermissionEnum.CREATE_OFFERING_USER,
      customerId: formData.offering.customer_uuid,
    });

    if (!canCreateOfferingUser) {
      showError(
        translate('You do not have permission to perform this action.'),
      );
      return;
    }

    await mutation.mutateAsync(formData);
  };

  const loadOfferings = useMemo(
    () =>
      providerOfferingsAutocomplete({
        customer: provider.customer,
        can_create_offering_user: true,
      }),
    [provider.customer],
  );

  const fields = [
    {
      name: 'user',
      label: translate('User'),
      type: 'async_select',
      loadOptions: userAutocomplete,
      getOptionLabel: ({ full_name, email, username }) =>
        full_name || email || username,
    },
    {
      name: 'offering',
      label: translate('Offering'),
      type: 'async_select',
      loadOptions: loadOfferings,
      getOptionLabel: ({ name, customer_name }) => (
        <>
          {name} | {customer_name}
        </>
      ),
    },
    {
      name: 'username',
      label: translate('Username'),
      type: 'string',
    },
  ];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create offering user')}
      formFields={fields}
      submitForm={handleSubmit}
    />
  );
};
