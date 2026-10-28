import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { customersDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { useCustomer, useUser, useSetCustomer } from '@/workspace/hooks';

export const CustomerRemovePanel: FunctionComponent = () => {
  const customer = useCustomer();
  const user = useUser();
  const canDeleteCustomer = user?.is_staff;
  const { showError } = useNotify();
  const setCurrentCustomer = useSetCustomer();
  const router = useRouter();

  const callbackMutation = useManagedMutation<any, any, void>({
    mutationFn: () => customersDestroy({ path: { uuid: customer.uuid } }),
    errorMessage: translate('Unable to delete organization.'),
    onSuccess: async () => {
      await router.stateService.go('organizations');
      setCurrentCustomer(null);
    },
    confirmation: {
      title: translate('Organization removal'),
      body: (
        <>
          {translate('Organization')}: <strong>{customer.name}</strong>
        </>
      ),
      options: {
        forDeletion: true,
      },
    },
  });

  const removeCustomer = () => {
    const hasProjects = customer.projects_count > 0;
    if (hasProjects) {
      const notification = translate(
        'Before removing organization, please make sure that all projects are removed.',
      );
      return showError(notification);
    }

    // Trigger the mutation which will handle the confirmation internally
    callbackMutation.mutate();
  };

  return canDeleteCustomer ? (
    <div className="card card-bordered">
      <div className="card-header">
        <div className="card-title">
          <h3 className="text-danger">{translate('Remove organization')}</h3>
        </div>
      </div>
      <div className="card-body flex justify-between">
        <ul>
          <li>
            {translate(
              'You can remove this organization by pressing the button',
            )}
          </li>
          <li>
            {translate(
              'Removing the organization will delete all related resources.',
            )}
          </li>
          <li>{translate('Removed organizations cannot be restored!')}</li>
        </ul>
        <div>
          <RemovalActionButton
            action={removeCustomer}
            title={translate('Remove organization')}
          />
        </div>
      </div>
    </div>
  ) : null;
};
