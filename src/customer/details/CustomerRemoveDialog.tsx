import { WarningCircleIcon } from '@phosphor-icons/react';
import { useRouter } from '@uirouter/react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { customersDestroy } from 'waldur-js-client';

import { FormContainer, TextField } from '@waldur/form';
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
        headerLess
        footerClassName="border-0 pt-0 gap-2"
        footer={
          <>
            <CloseDialogButton className="flex-grow-1" />
            <Button
              variant="light-danger"
              className="flex-grow-1"
              type="submit"
            >
              {translate('Delete')}
            </Button>
          </>
        }
      >
        <div className="d-flex flex-center w-40px h-40px bg-light-danger rounded-circle mb-6">
          <WarningCircleIcon size={22} className="text-danger" />
        </div>
        <h3 className="fw-bold">{translate('Organization removal')}</h3>
        <p className="text-muted mb-8">
          {translate('Organization')}:{' '}
          <strong>{props.resolve.customer.name}</strong>
        </p>
        <FormContainer submitting={props.submitting}>
          <TextField
            name="reason"
            label={translate('Reason')}
            placeholder={translate('e.g. This organization is irrelevant')}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
});
