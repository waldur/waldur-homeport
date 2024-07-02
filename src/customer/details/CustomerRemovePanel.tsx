import { Trash } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { deleteCustomer } from '@waldur/project/api';
import { showError } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

const CustomerRemoveDialog = lazyComponent(
  () => import('@waldur/customer/details/CustomerRemoveDialog'),
  'CustomerRemoveDialog',
);

export const CustomerRemovePanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const canDeleteCustomer = hasPermission(user, {
    permission: PermissionEnum.DELETE_CUSTOMER,
    customerId: customer.uuid,
  });
  const dispatch = useDispatch();
  const router = useRouter();

  const removeCustomer = () => {
    const hasProjects = customer.projects.length > 0;
    if (hasProjects) {
      const notification = translate(
        'Before removing organization, please make sure that all projects are removed.',
      );
      return dispatch(showError(notification));
    }
    // Show confirmation dialog
    dispatch(
      openModalDialog(CustomerRemoveDialog, {
        resolve: {
          action: () => {
            return deleteCustomer(customer.uuid)
              .then(() => {
                router.stateService.go('organizations').then(() => {
                  dispatch(setCurrentCustomer(null));
                });
              })
              .catch((error) => {
                const msg = error.response.data?.detail || error.message;
                dispatch(showError(msg));
              });
          },
          customerName: customer.name,
        },
        size: 'sm',
      }),
    );
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
          <Button onClick={removeCustomer} variant="danger">
            <span className="svg-icon svg-icon-2">
              <Trash />
            </span>{' '}
            {translate('Remove organization')}
          </Button>
        </div>
      </Card.Body>
    </Card>
  ) : null;
};
