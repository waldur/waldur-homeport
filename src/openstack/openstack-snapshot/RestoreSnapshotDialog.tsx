import { FC } from 'react';
import { openstackSnapshotsRestore } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import {
  createLatinNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ResourceActionDialog } from '@/resource/actions/ResourceActionDialog';
import { ActionDialogProps } from '@/resource/actions/types';

export const RestoreSnapshotDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  const mutation = useManagedMutation<
    any,
    any,
    { name: string; description?: string }
  >({
    mutationFn: (formData) =>
      openstackSnapshotsRestore({
        path: { uuid: resource.uuid },
        body: formData,
      }),

    successMessage: translate('Volume snapshot has been restored.'),
    errorMessage: translate('Unable to restore volume snapshot.'),
    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      dialogTitle={translate('Restore volume snapshot')}
      formFields={[createLatinNameField(), createDescriptionField()]}
      initialValues={{
        mtu: resource.mtu,
      }}
      submitForm={mutation.mutateAsync}
    />
  );
};
