import { FC } from 'react';
import { openstackRoutersCreate, OpenStackTenant } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { createLatinNameField } from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const CreateRouterDialog: FC<ActionDialogProps<OpenStackTenant>> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, { name: string }>({
    mutationFn: (formData) =>
      openstackRoutersCreate({
        body: {
          name: formData.name,
          tenant: resource.url,
        },
      }),
    successMessage: translate('OpenStack router has been created.'),
    errorMessage: translate('Unable to create OpenStack router.'),
    refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create new router')}
      submitForm={mutation.mutateAsync}
      formFields={[createLatinNameField()]}
    />
  );
};
