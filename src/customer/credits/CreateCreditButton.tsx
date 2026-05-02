import { SubmissionError } from 'redux-form';
import { customerCreditsCreate } from 'waldur-js-client';

import { AddButton } from '@/core/AddButton';
import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { serializeCustomerCredit } from './utils';

const CreditFormDialog = lazyComponent(() =>
  import('./CreditFormDialog').then((module) => ({
    default: module.CreditFormDialog,
  })),
);

const FORM_ID = 'CustomerCreditCreateForm';

export const CreateCreditButton = ({ refetch }) => {
  const { openDialog } = useModal();
  const { mutateAsync } = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      customerCreditsCreate({ body: serializeCustomerCredit(formData) }),
    successMessage: translate('Credit has been created.'),
    errorMessage: translate('Unable to create a credit'),
    refetch,
    onError: (e: any) => {
      if (e.response && e.response.status === 400) {
        throw new SubmissionError(e.response.data);
      }
    },
  });

  return (
    <AddButton
      action={() =>
        openDialog(CreditFormDialog, {
          size: 'lg',
          form: FORM_ID,
          formId: FORM_ID,
          submitFn: mutateAsync,
        })
      }
    />
  );
};
