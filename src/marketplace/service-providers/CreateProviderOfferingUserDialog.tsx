import { useDispatch, useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { ResourceActionDialog } from '@waldur/resource/actions/ResourceActionDialog';
import {
  showError,
  showErrorResponse,
  showSuccess,
} from '@waldur/store/notify';
import { getUser } from '@waldur/workspace/selectors';

import { createOfferingUser } from '../common/api';
import {
  offeringsAutocomplete,
  userAutocomplete,
} from '../common/autocompletes';

const handleSubmit =
  ({ formData, dispatch, curretUser, refetch }) =>
  async () => {
    if (
      !formData.offering.secret_options
        .service_provider_can_create_offering_user
    ) {
      dispatch(
        showError(
          translate('It is not allowed to create users for current offering.'),
        ),
      );
      return;
    }
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
      await createOfferingUser({
        offering: formData.offering.url,
        user: formData.user.url,
        username: formData.username,
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

export const CreateProviderOfferingUserDialog = ({ resolve: { refetch } }) => {
  const dispatch = useDispatch();
  const curretUser = useSelector(getUser);

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
      loadOptions: offeringsAutocomplete,
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
