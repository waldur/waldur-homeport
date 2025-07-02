import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { CostPolicyForm } from './CostPolicyForm';
import { CostPolicyFormData, CostPolicyType } from './types';

interface CostPolicyFormDialogProps {
  submitFn(formData: CostPolicyFormData): void;
  type: CostPolicyType;
  formId: string;
}

export const CostPolicyFormDialog = connect<{}, {}, CostPolicyFormDialogProps>(
  (_, ownProps: CostPolicyFormDialogProps) => ({
    form: ownProps.formId,
  }),
)(
  reduxForm<CostPolicyFormData, CostPolicyFormDialogProps>({
    destroyOnUnmount: true,
  })((props) => {
    const isEdit = Boolean(props.initialValues);

    return (
      <form onSubmit={props.handleSubmit(props.submitFn)}>
        <ModalDialog
          title={isEdit ? translate('Edit policy') : translate('New policy')}
          footer={
            <>
              <CloseDialogButton className="min-w-125px" />
              <SubmitButton
                disabled={props.invalid || !props.dirty}
                submitting={props.submitting}
                label={isEdit ? translate('Edit') : translate('Create')}
                className="btn btn-primary min-w-125px"
              />
            </>
          }
        >
          <CostPolicyForm {...props} isEdit={isEdit} />
        </ModalDialog>
      </form>
    );
  }),
);
