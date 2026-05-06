import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { customersDestroy } from 'waldur-js-client';

import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { useNotify } from '@/store/notify';
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { setCurrentCustomer } from '@/workspace/actions';
import { getCustomer, isStaff } from '@/workspace/selectors';

export const CustomerRemovePanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const canDeleteCustomer = useSelector(isStaff);
  const { showError } = useNotify();
  const dispatch = useDispatch();
  const router = useRouter();

  const callbackMutation = useManagedMutation<any, any, void>({
    mutationFn: () => customersDestroy({ path: { uuid: customer.uuid } }),
    errorMessage: translate('Unable to delete organization.'),
    onSuccess: async () => {
      await router.stateService.go('organizations');
      dispatch(setCurrentCustomer(null));
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
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3 className="text-danger">{translate('Remove organization')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body className="d-flex justify-content-between">
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
      </Card.Body>
    </Card>
  ) : null;
};
