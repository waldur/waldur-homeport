import { useQueryClient } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { projectCreditsPartialUpdate } from 'waldur-js-client';

import {
  getMinimalConsumptionFieldIndex,
  useMinimalConsumptionFields,
  useProjectAllocateCreditField,
} from '@/customer/credits/constants';
import { FormContainer, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { EditProjectCreditProps } from '../types';

export const EditCreditFieldDialog = connect<
  {},
  {},
  { resolve: EditProjectCreditProps }
>((_, ownProps: { resolve: EditProjectCreditProps }) => ({
  initialValues: pick(ownProps.resolve.credit, ownProps.resolve.name),
}))(
  reduxForm<{}, { resolve: EditProjectCreditProps }>({
    destroyOnUnmount: true,
    form: 'EditProjectCredit',
  })(({ resolve, ...props }) => {
    const queryClient = useQueryClient();

    const onSubmitMutation = useManagedMutation<any, any, any>({
      mutationFn: (formData) =>
        projectCreditsPartialUpdate({
          path: { uuid: resolve.credit.uuid },
          body: {
            [resolve.name]: formData[resolve.name],
          },
        }),
      successMessage: translate('Project credit has been updated.'),
      errorMessage: translate('Project credit could not be updated.'),
      onSuccess: (credit) => {
        queryClient.setQueryData(
          ['ProjectCreditData', resolve.credit.project_uuid],
          credit.data,
        );
      },
    });

    const fieldIndex = getMinimalConsumptionFieldIndex(resolve.name);

    const CONSUMPTION_FIELDS = useMinimalConsumptionFields(
      props.form,
      props.initialValues,
    );
    const ALLOCATE_CREDIT_FIELD = useProjectAllocateCreditField(
      resolve.credit.customer_credit,
      true,
    );

    return (
      <form
        onSubmit={props.handleSubmit((values) =>
          onSubmitMutation.mutateAsync(values),
        )}
      >
        <ModalDialog
          headerLess
          footer={
            <>
              <CloseDialogButton className="flex-equal" />
              <SubmitButton
                disabled={props.invalid}
                submitting={props.submitting}
                label={translate('Confirm')}
                className="btn btn-primary flex-equal"
              />
            </>
          }
        >
          <FormContainer submitting={props.submitting}>
            {resolve.name === 'value'
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
