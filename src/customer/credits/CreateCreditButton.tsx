import { SubmissionError } from 'redux-form';
import { customerCreditsCreate } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';
import { useNotify } from '@/store/hooks';

import { serializeCustomerCredit } from './utils';

const CreditFormDialog = lazyComponent(() =>
  import('./CreditFormDialog').then((module) => ({
    default: module.CreditFormDialog,
  })),
);

const FORM_ID = 'CustomerCreditCreateForm';

export const CreateCreditButton = ({ refetch }) => {
  const { closeDialog, openDialog } = useModal();
  const { showErrorResponse, showSuccess } = useNotify();
  const callback = async (formData) => {
    try {
      await customerCreditsCreate({ body: serializeCustomerCredit(formData) });
      showSuccess(translate('Credit has been created.'));
      closeDialog();
      refetch();
    } catch (e) {
      showErrorResponse(e, translate('Unable to create a credit'));
      if (e.response && e.response.status === 400) {
        throw new SubmissionError(e.response.data);
      }
    }
  };

  return (
    <AddButton
      action={() =>
        openDialog(CreditFormDialog, {
          size: 'lg',
          form: FORM_ID,
          formId: FORM_ID,
          submitFn: callback,
        })
      }
    />
  );
};
