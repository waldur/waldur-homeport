import { TrashIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { showError } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { getCustomer, isStaff } from '@waldur/workspace/selectors';

const CustomerRemoveDialog = lazyComponent(() =>
  import('@waldur/customer/details/CustomerRemoveDialog').then((module) => ({
    default: module.CustomerRemoveDialog,
  })),
);

export const CustomerRemovePanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const canDeleteCustomer = useSelector(isStaff);
  const dispatch = useDispatch();

  const removeCustomer = () => {
    const hasProjects = customer.projects_count > 0;
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
          customer,
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
          <ActionButton
            action={removeCustomer}
            variant="danger"
            title={translate('Remove organization')}
            iconNode={<TrashIcon weight="bold" />}
          />
        </div>
      </Card.Body>
    </Card>
  ) : null;
};
