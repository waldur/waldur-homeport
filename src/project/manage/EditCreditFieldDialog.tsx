import { useQueryClient } from '@tanstack/react-query';
import { pick } from 'lodash-es';
import { connect, useDispatch } from 'react-redux';
import { reduxForm } from 'redux-form';
import { projectCreditsPartialUpdate } from 'waldur-js-client';

import {
  getMinimalConsumptionFieldIndex,
  useMinimalConsumptionFields,
  useProjectAllocateCreditField,
} from '@waldur/customer/credits/constants';
import { FormContainer, SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

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
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const { showSuccess, showErrorResponse } = useNotify();

    const onSubmit = async (formData: FormData) => {
      try {
        const credit = await projectCreditsPartialUpdate({
          path: { uuid: resolve.credit.uuid },
          body: {
            [resolve.name]: formData[resolve.name],
          },
        });
        // Update cached data
        queryClient.setQueryData(
          ['ProjectCreditData', resolve.credit.project_uuid],
          credit.data,
        );
        showSuccess(translate('Project credit has been updated.'));
        dispatch(closeModalDialog());
      } catch (e) {
        showErrorResponse(e, translate('Project credit could not be updated.'));
      }
    };

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
