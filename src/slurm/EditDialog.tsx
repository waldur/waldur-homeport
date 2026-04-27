import { FC } from 'react';
import { slurmAllocationsUpdate } from 'waldur-js-client';

import { translate } from '@/i18n';
import {
  createNameField,
  createDescriptionField,
} from '@/resource/actions/base';
import { ActionDialogProps } from '@/resource/actions/types';
import { UpdateResourceDialog } from '@/resource/actions/UpdateResourceDialog';

const getFields = () => [createNameField(), createDescriptionField()];

export const EditDialog: FC<ActionDialogProps> = ({
  resolve: { resource, refetch },
}) => {
  return (
    <UpdateResourceDialog
      fields={getFields()}
      resource={resource}
      initialValues={{
        name: resource.name,
        description: resource.description,
      }}
      updateResource={(id, formData) =>
        slurmAllocationsUpdate({ path: { uuid: id }, body: formData })
      }
      verboseName={translate('SLURM allocation')}
      refetch={refetch}
    />
  );
};
