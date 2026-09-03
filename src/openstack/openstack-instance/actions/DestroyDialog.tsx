import { FC } from 'react';
import { Alert } from 'react-bootstrap';
import { marketplaceResourcesTerminate } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { DestroyInstanceParams } from '@/openstack/api';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

import { getDeleteField } from './utils';

const TerminationWarning = () => (
  <Alert variant="warning" className="mb-4">
    {translate(
      'The instance will be stopped if it is running. Existing backups and volume snapshots will be deleted.',
    )}
  </Alert>
);

export const DestroyDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<any, any, DestroyInstanceParams>({
    mutationFn: (formData) =>
      marketplaceResourcesTerminate({
        path: { uuid: resource.marketplace_resource_uuid },
        body: {
          attributes: {
            delete_volumes: formData.delete_volumes,
            release_floating_ips: formData.release_floating_ips,
          },
        },
      }),

    successMessage: translate('Instance deletion has been scheduled.'),
    errorMessage: translate('Unable to delete instance.'),
    refetch: refetch,
  });

  const { formFields, initialValues } = getDeleteField();

  return (
    <ResourceActionDialog
      dialogTitle={translate('Destroy instance')}
      dialogSubtitle={
        <ScopeSubtitle
          label={translate('Instance name')}
          name={resource.name}
        />
      }
      formFields={[
        { name: 'termination_warning', component: TerminationWarning },
        ...formFields,
      ]}
      initialValues={initialValues}
      submitForm={mutation.mutateAsync}
    />
  );
};
