import { FC } from 'react';
import { openstackVolumesSnapshot } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  createLatinNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const CreateSnapshotDialog: FC<ActionDialogProps> = ({
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
      openstackVolumesSnapshot({
        path: { uuid: resource.uuid },
        body: formData,
      }),

    successMessage: translate('Volume snapshot has been created.'),
    errorMessage: translate('Unable to create volume snapshot.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Create snapshot for OpenStack volume')}
      dialogSubtitle={
        <ScopeSubtitle label={translate('Volume name')} name={resource.name} />
      }
      formFields={[
        createLatinNameField(),
        createDescriptionField(),
        {
          name: 'kept_until',
          type: 'datetime',
          required: false,
          label: translate('Kept until'),
          help_text: translate(
            'Guaranteed time of snapshot retention. If null - keep forever.',
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
