import { FC } from 'react';
import { openstackInstancesBackup } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  createLatinNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const CreateBackupDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<
    any,
    any,
    {
      name: string;
      description?: string;
      kept_until?: string;
    }
  >({
    mutationFn: (formData) =>
      openstackInstancesBackup({
        path: { uuid: resource.uuid },
        body: formData,
      }),

    successMessage: translate('VM snapshot has been created.'),
    errorMessage: translate('Unable to create VM snapshot.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create VM snapshot for OpenStack instance')}
      formFields={[
        createLatinNameField(),
        createDescriptionField(),
        {
          name: 'kept_until',
          type: 'datetime',
          required: false,
          label: translate('Kept until'),
          help_text: translate(
            'Guaranteed time of VM snapshot retention. If null - keep forever.',
          ),
        },
      ]}
      initialValues={{
        name: resource.name + '-snapshot',
      }}
      submitForm={mutation.mutateAsync}
    />
  );
};
