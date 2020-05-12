import { useRouter } from '@uirouter/react';
import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { deleteById, getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV, ngInjector } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { ISSUE_IDS } from '@waldur/issues/types/constants';
import { openModalDialog } from '@waldur/modal/actions';
import { showError } from '@waldur/store/coreSaga';
import {
  getUser,
  isOwner as isOwnerSelector,
  getCustomer,
} from '@waldur/workspace/selectors';

const loadInvoices = customer =>
  getAll<{ state: string; price: string }>('/invoices/', {
    params: { field: ['state', 'price'], customer_uuid: customer.uuid },
  });

export const CustomerRemovePanel = () => {
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
      invoice => invoice.state !== 'pending' || parseFloat(invoice.price) > 0,
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
        return dispatch(showError(notification));
      }
      return dispatch(
        openModalDialog('issueCreateDialog', {
          resolve: {
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
          },
        }),
      );
    }

    const confirmDelete = confirm(translate('Confirm deletion?'));
    if (confirmDelete) {
      const currentStateService = ngInjector.get('currentStateService');
      const customersService = ngInjector.get('customersService');
      const stateUtilsService = ngInjector.get('stateUtilsService');
      currentStateService.setCustomer(null);
      deleteById('/customers/', customer.uuid).then(
        () => {
          customersService.clearAllCacheForCurrentEndpoint();
          router.stateService.go('profile.details').then(() => {
            stateUtilsService.clear();
            currentStateService.setHasCustomer(false);
          });
        },
        () => currentStateService.setCustomer(customer),
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
