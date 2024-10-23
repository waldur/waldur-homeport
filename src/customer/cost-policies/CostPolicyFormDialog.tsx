import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

import { CostPolicyForm } from './CostPolicyForm';
import { CostPolicyFormData, CostPolicyType } from './types';

interface CostPolicyFormDialogProps {
  onSubmit(formData: CostPolicyFormData): void;
  type: CostPolicyType;
  formId: string;
  initialValues?: any;
}

export const CostPolicyFormDialog = connect(
  (_, ownProps: CostPolicyFormDialogProps) => ({
    form: ownProps.formId,
    initialValues: ownProps.initialValues,
  }),
)(
  reduxForm<CostPolicyFormData, CostPolicyFormDialogProps>({
    destroyOnUnmount: true,
  })((props) => {
    const isEdit = Boolean(props.initialValues);

    return (
      <form onSubmit={props.handleSubmit(props.onSubmit)}>
        <MetronicModalDialog
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
        </MetronicModalDialog>
      </form>
    );
  }),
);
