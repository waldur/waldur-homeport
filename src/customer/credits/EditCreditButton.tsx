import { PencilSimple } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { SubmissionError } from 'redux-form';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';

import { updateCustomerCredit } from './api';
import { CustomerCreditFormData } from './types';

const CreditFormDialog = lazyComponent(
  () => import('./CreditFormDialog'),
  'CreditFormDialog',
);

export const EditCreditButton = ({ row, refetch }) => {
  const dispatch = useDispatch();
  const openCreditFormDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CreditFormDialog, {
          size: 'lg',
          formId: 'CustomerCreditEditForm',
          initialValues: {
            value: row.value,
            customer: {
              uuid: row.customer_uuid,
              name: row.customer_name,
              url: row.customer,
            },
            offerings: row.offerings,
            end_date: row.end_date,
            minimal_consumption: row.minimal_consumption,
          },
          onSubmit: (formData) => {
            const payload: CustomerCreditFormData = {
              ...formData,
              customer: formData.customer.url,
              offerings: formData.offerings.map((offering) => offering.url),
            };
            return updateCustomerCredit(row.uuid, payload)
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
    [dispatch, row, refetch],
  );

  return (
    <Dropdown.Item as="button" onClick={openCreditFormDialog}>
      <span className="svg-icon svg-icon-2">
        <PencilSimple weight="bold" />
      </span>
      {translate('Edit')}
    </Dropdown.Item>
  );
};
