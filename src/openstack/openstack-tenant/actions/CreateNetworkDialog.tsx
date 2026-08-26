import { FC } from 'react';
import { openstackTenantsCreateNetwork } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  createLatinNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const CreateNetworkDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<
    any,
    any,
    { name: string; description?: string }
  >({
    mutationFn: (formData) =>
      openstackTenantsCreateNetwork({
        path: { uuid: resource.uuid },
        body: formData,
      }),

    successMessage: translate('OpenStack networks has been created.'),
    errorMessage: translate('Unable to create OpenStack networks.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create network for OpenStack tenant')}
      dialogSubtitle={
        <ScopeSubtitle label={translate('Tenant name')} name={resource.name} />
      }
      formFields={[createLatinNameField(), createDescriptionField()]}
      submitForm={mutation.mutateAsync}
    />
  );
};
