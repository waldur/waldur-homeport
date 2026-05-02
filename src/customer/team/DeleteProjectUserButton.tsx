import { TrashIcon } from '@phosphor-icons/react';
import React from 'react';
import {
  CustomerUser,
  NestedProjectPermission,
  projectsDeleteUser,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { ActionItem } from '@/resource/actions/ActionItem';

interface DeleteProjectUserButtonProps {
  customer: CustomerUser;
  project: NestedProjectPermission;
  refetch(): void;
}

export const DeleteProjectUserButton: React.FC<
  DeleteProjectUserButtonProps
> = ({ project, customer, refetch }) => {
  const deleteMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      projectsDeleteUser({
        path: { uuid: project.uuid },
        body: {
          user: customer.uuid,
          role: project.role_name,
        },
      }),
    successMessage: translate('Team member has been removed.'),
    errorMessage: translate('Unable to delete team member.'),
    refetch,
    confirmation: {
      title: translate('Confirmation'),
      body: translate(
        'Are you sure you want to remove {user} from {project}?',
        {
          user: customer.full_name || customer.username,
          project: project.name,
        },
      ),
    },
  });
  return (
    <ActionItem
      className="text-danger border-top"
      iconColor="danger"
      title={translate('Remove')}
      action={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      iconNode={<TrashIcon weight="bold" />}
    />
  );
};
