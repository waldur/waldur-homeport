import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { SubmissionError } from 'redux-form';

import { AddButton } from '@waldur/core/AddButton';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';

import { createCustomerCredit } from './api';
import { CustomerCreditFormData } from './types';

const CreditFormDialog = lazyComponent(
  () => import('./CreditFormDialog'),
  'CreditFormDialog',
);

export const CreateCreditButton = ({ refetch }) => {
  const dispatch = useDispatch();
  const openFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CreditFormDialog, {
          size: 'lg',
          formId: 'CustomerCreditCreateForm',
          onSubmit: (formData) => {
            const payload: CustomerCreditFormData = {
              ...formData,
              customer: formData.customer.url,
              offerings: formData.offerings.map((offering) => offering.url),
            };
            return createCustomerCredit(payload)
              .then(() => {
                dispatch(closeModalDialog());
                refetch();
              })
              .catch((e) => {
                if (e.response && e.response.status === 400) {
                  throw new SubmissionError(e.response.data);
                }
              });
          },
        }),
      ),
    [dispatch, refetch],
  );
  return <AddButton action={openFormDialog} />;
};
