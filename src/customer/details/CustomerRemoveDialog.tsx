import { WarningCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { customersDestroy } from 'waldur-js-client';

import { FormContainer, SubmitButton, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse } from '@waldur/store/notify';
import { setCurrentCustomer } from '@waldur/workspace/actions';
import { Customer } from '@waldur/workspace/types';

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

  const callback = async () => {
    try {
      await customersDestroy({ path: { uuid: props.resolve.customer.uuid } });
      await router.stateService.go('organizations');
      dispatch(setCurrentCustomer(null));
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(error, translate('Unable to delete organization.')),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(callback)}>
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
              submitting={props.submitting}
              variant="danger"
              className="flex-equal"
              label={translate('Delete')}
            />
          </>
        }
      >
        <FormContainer submitting={props.submitting}>
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
