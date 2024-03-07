import { useRouter } from '@uirouter/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reset, SubmissionError } from 'redux-form';

import { ENV } from '@waldur/configs/default';
import { sendForm } from '@waldur/core/api';
import { translate } from '@waldur/i18n';
import { addCustomerUser } from '@waldur/permissions/api';
import { RoleEnum } from '@waldur/permissions/enums';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { getCurrentUser } from '@waldur/user/UsersService';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import * as constants from './constants';
import { CustomerCreateForm } from './CustomerCreateForm';

const CUSTOMER_FIELDS = [
  'name',
  'native_name',
  'domain',
  'organization_group',
  'email',
  'phone_number',
  'registration_code',
  'country',
  'address',
  'vat_code',
  'postal',
  'bank_name',
  'bank_account',
  'image',
];

interface OwnProps {
  resolve: { role: string };
}

export const CustomerCreateDialog: React.FC<OwnProps> = ({ resolve }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const router = useRouter();

  const createOrganization = React.useCallback(
    async (formData) => {
      const payload: Record<string, string | boolean> = {};
      CUSTOMER_FIELDS.forEach((field) => {
        if (formData[field]) {
          payload[field] = formData[field];
        }
      });
      if (formData.vat_code) {
        payload.is_company = true;
      }
      if (formData.country) {
        payload.country = formData.country.value;
      }
      if (formData.organization_group) {
        payload.organization_group = formData.organization_group.value;
      }

      try {
        const response = await sendForm<Customer>(
          'POST',
          `${ENV.apiEndpoint}api/customers/`,
          payload,
        );
        const customer = response.data;
        if (resolve.role === constants.ROLES.provider) {
          await addCustomerUser({
            customer: customer.uuid,
            role: RoleEnum.CUSTOMER_OWNER,
            user: user.uuid,
          });
        }
        dispatch(showSuccess(translate('Organization has been created.')));
        const newUser = await getCurrentUser();
        dispatch(setCurrentUser(newUser));
        router.stateService.go('organization.dashboard', {
          uuid: customer.uuid,
        });
        dispatch(reset('CustomerCreateDialog'));
      } catch (e) {
        dispatch(
          showErrorResponse(e, translate('Could not create organization')),
        );
        if (e.status === 400) {
          throw new SubmissionError(e.data);
        }
      }
    },
    [dispatch, router, user, resolve.role],
  );
  return <CustomerCreateForm onSubmit={createOrganization} />;
};
