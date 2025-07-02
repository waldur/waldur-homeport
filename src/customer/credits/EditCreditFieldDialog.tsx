import { useQueryClient } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { customerCreditsPartialUpdate } from 'waldur-js-client';

import {
  getMinimalConsumptionFieldIndex,
  useCustomerAllocateCreditField,
  useCustomerCreditOfferingsField,
  useMinimalConsumptionFields,
} from '@waldur/customer/credits/constants';
import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { EditCustomerCreditProps } from '../details/types';

export const EditCreditFieldDialog = connect<
  {},
  {},
  { resolve: EditCustomerCreditProps }
>((_, ownProps: { resolve: EditCustomerCreditProps }) => ({
  initialValues: pick(ownProps.resolve.credit, ownProps.resolve.name),
}))(
  reduxForm<{}, { resolve: EditCustomerCreditProps }>({
    destroyOnUnmount: true,
    form: 'EditCustomerCredit',
  })(({ resolve, ...props }) => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const { showSuccess, showErrorResponse } = useNotify();

    const onSubmit = async (formData: FormData) => {
      try {
        const credit = await customerCreditsPartialUpdate({
          path: { uuid: resolve.credit.uuid },
          body: {
            [resolve.name]: formData[resolve.name],
          },
        });
        // Update cached data
        queryClient.setQueryData(
          ['CustomerCreditData', resolve.credit.customer_uuid],
          credit.data,
        );
        showSuccess(translate('Organization credit has been updated.'));
        dispatch(closeModalDialog());
      } catch (e) {
        showErrorResponse(
          e,
          translate('Organization credit could not be updated.'),
        );
      }
    };

    const fieldIndex = getMinimalConsumptionFieldIndex(resolve.name);

    const CONSUMPTION_FIELDS = useMinimalConsumptionFields(
      props.form,
      props.initialValues,
    );
    const OFFERING_FIELD = useCustomerCreditOfferingsField();
    const ALLOCATE_CREDIT_FIELD = useCustomerAllocateCreditField();

    return (
      <form onSubmit={props.handleSubmit(onSubmit)}>
        <ModalDialog
          headerLess
          bodyClassName="pb-2"
          footerClassName="border-0 pt-0 gap-2"
          footer={
            <>
              <CloseDialogButton className="flex-grow-1" />
              <SubmitButton
                disabled={props.invalid}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-grow-1"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting}>
            {resolve.name === 'offerings'
              ? OFFERING_FIELD
              : resolve.name === 'value'
                ? ALLOCATE_CREDIT_FIELD
                : fieldIndex >= 0
                  ? CONSUMPTION_FIELDS[fieldIndex]
                  : null}
          </FormContainer>
        </ModalDialog>
      </form>
    );
  }),
);
