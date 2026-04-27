import { useDispatch } from 'react-redux';
import { marketplaceOfferingUsersCreate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { userAutocomplete } from '@/marketplace/common/autocompletes';
import { closeModalDialog } from '@/modal/actions';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { showErrorResponse, showSuccess } from '@/store/notify';

export const CreateOfferingUserDialog = ({
  resolve: { offering, onSuccess },
}) => {
  const dispatch = useDispatch();
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
      name: 'username',
      label: translate('Username'),
      type: 'string',
    },
  ];

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create offering user')}
      formFields={fields}
      submitForm={async (formData) => {
        try {
          await marketplaceOfferingUsersCreate({
            body: {
              offering: offering.url,
              user: formData.user.url,
              username: formData.username,
            },
          });
          dispatch(showSuccess(translate('Offering user has been created.')));
          dispatch(closeModalDialog());
          onSuccess();
        } catch (e) {
          dispatch(
            showErrorResponse(e, translate('Unable to create offering user.')),
          );
        }
      }}
    />
  );
};
