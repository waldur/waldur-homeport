import { useRouter } from '@uirouter/react';
import { FunctionComponent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { deleteById, getAll } from '@waldur/core/api';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { openIssueCreateDialog } from '@waldur/issues/create/actions';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { showError } from '@waldur/store/notify';
import store from '@waldur/store/store';
import { StateUtilsService } from '@waldur/user/StateUtilsService';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import {
  getUser,
  isOwner as isOwnerSelector,
  getCustomer,
} from '@waldur/workspace/selectors';

const OrganizationRemovalErrorDialog = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "OrganizationRemovalErrorDialog" */ '@waldur/customer/details/OrganizationRemovalErrorDialog'
    ),
  'OrganizationRemovalErrorDialog',
);

const loadInvoices = (customer) =>
  getAll<{ state: string; price: string }>('/invoices/', {
    params: { field: ['state', 'price'], customer_uuid: customer.uuid },
  });

export const CustomerRemovePanel: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const user = useSelector(getUser);
  const isOwner = useSelector(isOwnerSelector);
  const canDeleteCustomer =
    user.is_staff ||
    (isOwner && ENV.plugins.WALDUR_CORE.OWNER_CAN_MANAGE_CUSTOMER);
  const { loading, value: invoices } = useAsync(() => loadInvoices(customer));
  const dispatch = useDispatch();
  const router = useRouter();

  const removeCustomer = () => {
    const hasActiveInvoices = invoices.some(
      (invoice) => invoice.state !== 'pending' || parseFloat(invoice.price) > 0,
    );
    const hasProjects = customer.projects.length > 0;
    const needsSupport = hasProjects || hasActiveInvoices;

    if (needsSupport) {
      if (!isFeatureVisible('support')) {
        const notification = hasProjects
          ? translate(
              'Organization contains projects. Please remove them first.',
            )
          : hasActiveInvoices
          ? translate(
              'Organization contains invoices. Please remove them first.',
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
      deleteById('/customers/', customer.uuid).then(
        () => {
          router.stateService.go('profile.details').then(() => {
            StateUtilsService.clear();
          });
        },
        () => store.dispatch(setCurrentCustomer(customer)),
      );
    }
  };

  return loading ? (
    <LoadingSpinner />
  ) : canDeleteCustomer ? (
    <div className="highlight">
      <h3 className="text-danger">{translate('Remove organization')}</h3>
      <ul>
        <li>
          {translate('You can remove this organization by pressing the button')}
        </li>
        <li>
          {translate(
            'Removing the organization will delete all related resources.',
          )}
        </li>
        <li>{translate('Removed organizations cannot be restored!')}</li>
      </ul>
      <a onClick={removeCustomer} className="btn btn-danger">
        <i className="fa fa-trash" /> {translate('Remove organization')}
      </a>
    </div>
  ) : (
    <div className="highlight">
      <h3>{translate('Only staff can remove organization.')}</h3>
    </div>
  );
};
