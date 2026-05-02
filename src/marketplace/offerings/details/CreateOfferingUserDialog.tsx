import { marketplaceOfferingUsersCreate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { userAutocomplete } from '@/marketplace/common/autocompletes';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

export const CreateOfferingUserDialog = ({
  resolve: { offering, onSuccess },
}) => {
  const mutation = useManagedMutation<
    any,
    any,
    { user: { url: string }; username?: string }
  >({
    mutationFn: (formData) =>
      marketplaceOfferingUsersCreate({
        body: {
          offering: offering.url,
          user: formData.user.url,
          username: formData.username,
        },
      }),

    successMessage: translate('Offering user has been created.'),
    errorMessage: translate('Unable to create offering user.'),
    refetch: onSuccess,
  });

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
      submitForm={mutation.mutateAsync}
    />
  );
};
