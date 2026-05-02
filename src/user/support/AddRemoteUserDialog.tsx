import { remoteEduteams } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';

export const AddRemoteUserDialog = ({ resolve: { refetch } }) => {
  const mutation = useManagedMutation<any, any, { cuid: string }>({
    mutationFn: (formData) => remoteEduteams({ body: { cuid: formData.cuid } }),
    successMessage: translate('User has been successfully added.'),
    errorMessage: translate('Unable to add user.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Add user')}
      formFields={[
        {
          name: 'cuid',
          label: translate('Remote user ID'),
          required: true,
          type: 'string',
        },
      ]}
      submitForm={mutation.mutateAsync}
    />
  );
};
