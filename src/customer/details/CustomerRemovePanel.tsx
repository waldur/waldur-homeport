import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { PermissionEnum } from '@waldur/permissions/enums';
import { hasPermission } from '@waldur/permissions/hasPermission';
import { deleteCustomer } from '@waldur/project/api';
import { showError } from '@waldur/store/notify';
import store from '@waldur/store/store';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

const OrganizationRemovalErrorDialog = lazyComponent(
  () => import('@waldur/customer/details/OrganizationRemovalErrorDialog'),
  'OrganizationRemovalErrorDialog',
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
      if (!ENV.plugins.WALDUR_SUPPORT.ENABLED) {
        const notification = hasProjects
          ? translate(
              'Organization contains projects. Please remove them first.',
            )
          : '';
        return notification
          ? dispatch(showError(notification))
          : dispatch(openModalDialog(OrganizationRemovalErrorDialog));
      }
      return dispatch(
        openIssueCreateDialog({
          issue: {
            customer,
            type: ISSUE_IDS.CHANGE_REQUEST,
            summary: translate('Organization removal'),
          },
          hideProjectAndResourceFields: true,
          options: {
            title: translate('Organization removal'),
            hideTitle: true,
            descriptionLabel: translate('Reason'),
            descriptionPlaceholder: translate(
              'Why do you need to remove organization with existing projects?',
            ),
            submitTitle: translate('Request removal'),
          },
        }),
      );
    }

    const confirmDelete = confirm(translate('Confirm deletion?'));
    if (confirmDelete) {
      store.dispatch(setCurrentCustomer(null));
      deleteCustomer(customer.uuid).then(
        () => {
          router.stateService.go('profile.details');
        },
        () => store.dispatch(setCurrentCustomer(customer)),
      );
    }
  };

  return canDeleteCustomer ? (
    <Card className="mt-5">
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
            <i className="fa fa-trash" /> {translate('Remove organization')}
          </Button>
        </div>
      </Card.Body>
    </Card>
  ) : null;
};
