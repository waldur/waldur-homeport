import { WarningCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { customersDestroy } from 'waldur-js-client';

import { FormContainer, SubmitButton, TextField } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { setCurrentCustomer } from '@/workspace/actions';
import { Customer } from '@/workspace/types';

import { DELETE_CUSTOMER_FORM_ID } from './constants';

interface CustomerRemoveDialogProps {
  resolve: {
    customer: Customer;
  };
}

export const CustomerRemoveDialog = reduxForm<
  { reason },
  CustomerRemoveDialogProps
>({
  form: DELETE_CUSTOMER_FORM_ID,
})((props) => {
  const dispatch = useDispatch();

  const router = useRouter();

  const callbackMutation = useManagedMutation<any, any, void>({
    mutationFn: () =>
      customersDestroy({ path: { uuid: props.resolve.customer.uuid } }),
    errorMessage: translate('Unable to delete organization.'),
    onSuccess: async () => {
      await router.stateService.go('organizations');
      dispatch(setCurrentCustomer(null));
    },
  });

  return (
    <form onSubmit={props.handleSubmit(() => callbackMutation.mutateAsync())}>
      <ModalDialog
        title={translate('Organization removal')}
        subtitle={
          <>
            {translate('Organization')}:{' '}
            <strong>{props.resolve.customer.name}</strong>
          </>
        }
        iconNode={<WarningCircleIcon weight="bold" />}
        iconColor="danger"
        footer={
          <>
            <CloseDialogButton className="flex-equal" />
            <SubmitButton
              submitting={callbackMutation.isPending}
              variant="danger"
              className="flex-equal"
              label={translate('Delete')}
            />
          </>
        }
      >
        <FormContainer submitting={callbackMutation.isPending}>
          <TextField
            name="reason"
            label={translate('Reason')}
            placeholder={translate('e.g. This organization is irrelevant')}
            spaceless
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
