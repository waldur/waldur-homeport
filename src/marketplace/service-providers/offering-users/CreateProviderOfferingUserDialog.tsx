import { FC } from 'react';
import { useDispatch } from 'react-redux';
import {
  marketplaceOfferingUsersCreate,
  ServiceProvider,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import {
  providerOfferingsAutocomplete,
  userAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { closeModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import {
  showError,
  showErrorResponse,
  showSuccess,
} from '@waldur/store/notify';
import { useUser } from '@waldur/workspace/hooks';

interface OwnProps {
  resolve: {
    provider: ServiceProvider;
    refetch(): void;
  };
}

const handleSubmit =
  ({ formData, dispatch, curretUser, refetch }) =>
  async () => {
    const canCreateOfferingUser = hasPermission(curretUser, {
      permission: PermissionEnum.CREATE_OFFERING_USER,
      customerId: formData.offering.customer_uuid,
    });

    if (!canCreateOfferingUser) {
      dispatch(
        showError(
          translate('You do not have permission to perform this action.'),
        ),
      );
      return;
    }

    try {
      await marketplaceOfferingUsersCreate({
        body: {
          offering: formData.offering.url,
          user: formData.user.url,
          username: formData.username,
        },
      });
      dispatch(showSuccess(translate('Offering user has been created.')));
      dispatch(closeModalDialog());
      refetch();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to create offering user.')),
      );
    }
  };

export const CreateProviderOfferingUserDialog: FC<OwnProps> = ({
  resolve: { provider, refetch },
}) => {
  const dispatch = useDispatch();
  const curretUser = useUser();

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
      loadOptions: (query, prevOptions, page) =>
        providerOfferingsAutocomplete(
          {
            name: query,
            customer: provider.customer,
            can_create_offering_user: true,
          },
          prevOptions,
          page,
        ),
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
      submitForm={(formData) =>
        handleSubmit({ formData, dispatch, curretUser, refetch })()
      }
    />
  );
};
