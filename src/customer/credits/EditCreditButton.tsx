import { PencilSimpleIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { SubmissionError } from 'redux-form';
import { CustomerCredit, customerCreditsUpdate } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { useNotify } from '@waldur/store/hooks';

import { getCreditInitialValues, serializeCustomerCredit } from './utils';

const CreditFormDialog = lazyComponent(() =>
  import('./CreditFormDialog').then((module) => ({
    default: module.CreditFormDialog,
  })),
);

const FORM_ID = 'CustomerCreditEditForm';

export const EditCreditButton = ({
  row,
  refetch,
}: {
  row: CustomerCredit;
  refetch;
}) => {
  const { closeDialog, openDialog } = useModal();
  const { showErrorResponse, showSuccess } = useNotify();

  const callback = useCallback(
    async (formData) => {
      try {
        await customerCreditsUpdate({
          path: { uuid: row.uuid },
          body: serializeCustomerCredit(formData),
        });
        showSuccess(translate('Credit has been updated.'));
        closeDialog();
        refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to edit the credit'));
        if (e.response && e.response.status === 400) {
          throw new SubmissionError(e.response.data);
        }
      }
    },
    [row],
  );
  const openCreditFormDialog = () =>
    openDialog(CreditFormDialog, {
      size: 'lg',
      form: FORM_ID,
      formId: FORM_ID,
      initialValues: {
        customer: {
          uuid: row.customer_uuid,
          name: row.customer_name,
          url: row.customer,
        },
        offerings: row.offerings,
        ...getCreditInitialValues(row),
      },
      submitFn: callback,
    });

  return (
    <Dropdown.Item as="button" type="button" onClick={openCreditFormDialog}>
      <span className="svg-icon svg-icon-2">
        <PencilSimpleIcon weight="bold" />
      </span>
      {translate('Edit')}
    </Dropdown.Item>
  );
};
