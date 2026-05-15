import { FC } from 'react';
import { OpenStackPool, openstackPoolsPartialUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const EditPoolDialog: FC<ActionDialogProps<OpenStackPool>> = ({
  resolve: { resource, refetch },
}) => {
  const { mutateAsync } = useManagedMutation({
    mutationFn: (formData: any) =>
      openstackPoolsPartialUpdate({
        path: { uuid: resource.uuid },
        body: { name: formData.name },
      }),
    successMessage: translate('Pool has been updated.'),
    errorMessage: translate('Unable to update pool.'),
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Edit pool')}
      submitForm={mutateAsync}
      formFields={[createNameField()]}
      initialValues={{ name: resource.name }}
    />
  );
};
