import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { getCustomer, isStaff } from '@/workspace/selectors';

const CustomerRemoveDialog = lazyComponent(() =>
  import('@/customer/details/CustomerRemoveDialog').then((module) => ({
    default: module.CustomerRemoveDialog,
  })),
);

export const CustomerRemovePanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const canDeleteCustomer = useSelector(isStaff);
  const { showError } = useNotify();

  const { openDialog } = useModal();

  const removeCustomer = () => {
    const hasProjects = customer.projects_count > 0;
    if (hasProjects) {
      const notification = translate(
        'Before removing organization, please make sure that all projects are removed.',
      );
      return showError(notification);
    }
    // Show confirmation dialog
    openDialog(CustomerRemoveDialog, {
      resolve: {
        customer,
      },
      size: 'sm',
    });
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
