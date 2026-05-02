import { useQueryClient } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { customerCreditsPartialUpdate } from 'waldur-js-client';

import {
  getMinimalConsumptionFieldIndex,
  useCustomerAllocateCreditField,
  useCustomerCreditOfferingsField,
  useMinimalConsumptionFields,
} from '@/customer/credits/constants';
import { FormContainer, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
    const queryClient = useQueryClient();

    const submitMutation = useManagedMutation<any, any, any>({
      mutationFn: (formData) =>
        customerCreditsPartialUpdate({
          path: { uuid: resolve.credit.uuid },
          body: {
            [resolve.name]: formData[resolve.name],
          },
        }),
      successMessage: translate('Organization credit has been updated.'),
      errorMessage: translate('Organization credit could not be updated.'),
      onSuccess: (credit) => {
        queryClient.setQueryData(
          ['CustomerCreditData', resolve.credit.customer_uuid],
          credit.data,
        );
      },
    });

    const fieldIndex = getMinimalConsumptionFieldIndex(resolve.name);

    const CONSUMPTION_FIELDS = useMinimalConsumptionFields(
      props.form,
      props.initialValues,
    );
    const OFFERING_FIELD = useCustomerCreditOfferingsField();
    const ALLOCATE_CREDIT_FIELD = useCustomerAllocateCreditField();

    return (
      <form
        onSubmit={props.handleSubmit((values) =>
          submitMutation.mutateAsync(values),
        )}
      >
        <ModalDialog
          headerLess
          footer={
            <>
              <CloseDialogButton className="flex-equal" />
              <SubmitButton
                disabled={props.invalid}
                submitting={submitMutation.isPending}
                label={translate('Confirm')}
                className="btn btn-primary flex-equal"
              />
            </>
          }
        >
          <FormContainer submitting={submitMutation.isPending}>
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
