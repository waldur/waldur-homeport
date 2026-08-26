import { FC } from 'react';

import { translate } from '@/i18n';
import { ScopeSubtitle } from '@/modal/ScopeSubtitle';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { Resource } from '../types';

import { ResourceActionDialog } from './ResourceActionDialog';
import { ActionValidator } from './types';

interface UpdateResourceDialogProps {
  fields?: any[];
  validators?: ActionValidator<Resource>[];
  updateResource(id: string, formData: any): Promise<any>;
  verboseName: string;
  resource: Resource;
  refetch?(): void;
  initialValues: any;
}

export const UpdateResourceDialog: FC<UpdateResourceDialogProps> = ({
  resource,
  refetch,
  updateResource,
  verboseName,
  fields,
  initialValues,
}) => {
  const mutation = useManagedMutation<
    any,
    any,
    Record<string, string | number | boolean>
  >({
    mutationFn: (formData) => updateResource(resource.uuid, formData),
    successMessage: translate('{verboseName} has been updated.', {
      verboseName,
    }),

    errorMessage: translate('Unable to update {verboseName}.', {
      verboseName,
    }),

    refetch: refetch,
  });

  return (
    <ResourceActionDialog
      submitForm={mutation.mutateAsync}
      dialogTitle={translate('Update {resourceType}', {
        resourceType: verboseName,
      })}
      dialogSubtitle={
        resource.name ? (
          <ScopeSubtitle label={translate('Name')} name={resource.name} />
        ) : undefined
      }
      formFields={fields}
      initialValues={initialValues}
    />
  );
};
