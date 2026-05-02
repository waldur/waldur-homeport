import { FC } from 'react';
import { openportalManagedProjectsDeleteDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

export const DeleteManagedProjectButton: FC<{ row; refetch }> = ({
  row,
  refetch,
}) => {
  const project = row; // Assuming row is the project object

  if (!project) {
    return null;
  }

  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openportalManagedProjectsDeleteDestroy({
        path: {
          identifier: project.identifier,
          destination: project.destination,
        },
      }),
    successMessage: translate('Managed project has been deleted.'),
    errorMessage: translate('Unable to delete this managed project.'),
    refetch,
    confirmation: {
      title: translate('Delete managed project'),
      body: translate(
        'Are you sure you would like to delete this managed project?',
      ),
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
