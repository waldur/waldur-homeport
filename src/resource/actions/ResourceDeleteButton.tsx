import { FunctionComponent } from 'react';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { RemovalActionItem } from './RemovalActionItem';

export const ResourceDeleteButton: FunctionComponent<{
  apiFunction;
  resourceType;
  refetch?;
}> = ({ apiFunction, resourceType, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: apiFunction,
    successMessage: translate('{resourceType} has been deleted.', {
      resourceType,
    }),
    errorMessage: translate('Unable to delete {resourceType}.', {
      resourceType,
    }),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate('Are you sure you want to delete this {resourceType}?', {
        resourceType,
      }),
      options: { forDeletion: true },
    },
  });
  return (
    <RemovalActionItem
      title={translate('Delete')}
      disabled={deleteMutation.isPending}
      action={() => deleteMutation.mutate()}
      size="sm"
    />
  );
};
