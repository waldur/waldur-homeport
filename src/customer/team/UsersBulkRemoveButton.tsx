import { useSelector } from 'react-redux';
import { customersDeleteUser, projectsDeleteUser } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useNotify } from '@/store/notify';
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';
import { getCustomer } from '@/workspace/selectors';

export const UsersBulkRemoveButton = ({ rows, refetch }) => {
  const { showErrorResponse } = useNotify();

  const currentUser = useUser();
  const currentCustomer = useSelector(getCustomer);

  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: async () => {
      for (const user of rows) {
        try {
          await Promise.all(
            user.projects.map((project) =>
              projectsDeleteUser({
                path: { uuid: project.uuid },
                body: {
                  user: user.uuid,
                  role: project.role_name,
                },
              }),
            ),
          );

          if (user.role_name) {
            await customersDeleteUser({
              path: { uuid: currentCustomer.uuid },
              body: {
                user: user.uuid,
                role: user.role_name,
              },
            });
          }
        } catch (e) {
          showErrorResponse(
            e,
            translate('Unable to remove user {userName}.', {
              userName: user.full_name || user.username,
            }),
          );
        }
      }
    },
    confirmation: {
      title: translate(
        'Remove selected users from the organization: {customerName}',
        {
          customerName: <strong>{currentCustomer.name}</strong>,
        },
        formatJsxTemplate,
      ),
      body: (
        <div>
          <p>
            {translate(
              "You are about to remove these users from the organization. Once removed, they'll immediately lose access and all associated permissions.",
            )}
          </p>
          <ul>
            {rows.map((row) => (
              <li key={row.uuid}>
                {row.full_name || row.username} ({renderFieldOrDash(row.email)})
              </li>
            ))}
          </ul>
        </div>
      ),
      options: { forDeletion: true },
    },
    successMessage: translate('Selected users have been successfully removed.'),
    errorMessage: translate('Unable to remove users.'),
    refetch,
  });

  const canRemoveUsers = hasPermission(currentUser, {
    permission: PermissionEnum.DELETE_CUSTOMER_PERMISSION,
    customerId: currentCustomer.uuid,
  });
  if (!canRemoveUsers) {
    return null;
  }

  return (
    <RemovalActionButton
      title={translate('Remove')}
      action={mutate}
      tooltip={translate('Remove all selected users from organization.')}
      disabled={isPending}
    />
  );
};
