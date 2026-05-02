import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { openportalManagedProjectsDetach } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

export const DetachManagedProjectButton: FC<{ row; refetch }> = ({
  row: project,
  refetch,
}) => {
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      openportalManagedProjectsDetach({
        path: {
          identifier: project.identifier,
          destination: project.destination,
        },
      }),
    successMessage: translate('Project has been detached.'),
    errorMessage: translate('Unable to detach this project.'),
    refetch,
    confirmation: {
      title: translate('Detach the existing project from this managed project'),
      body: translate('Are you sure you would like to detach this project?'),
    },
  });

  if (!project) {
    return null;
  }

  return (
    <ActionItem
      title={translate('Detach Project')}
      disabled={isPending}
      action={mutate}
      size="sm"
      className="text-danger"
      iconColor="danger"
      iconNode={<WarningCircleIcon weight="bold" />}
    />
  );
};
