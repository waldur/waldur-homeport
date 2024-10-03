import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

import { CostPolicyCreateForm } from './CostPolicyCreateForm';
import { CostPolicyFormData, CostPolicyType } from './types';

interface CostPolicyCreateDialogProps {
  onSubmit(formData: CostPolicyFormData): void;
  type: CostPolicyType;
}

export const CostPolicyCreateDialog = reduxForm<
  CostPolicyFormData,
  CostPolicyCreateDialogProps
>({
  form: 'costPolicyCreate',
})((props) => {
  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <MetronicModalDialog
        title={translate('New policy')}
        footer={
          <>
            <CloseDialogButton className="min-w-125px" />
            <SubmitButton
              disabled={props.invalid || !props.dirty}
              submitting={props.submitting}
              label={translate('Create')}
              className="btn btn-primary min-w-125px"
            />
          </>
        }
      >
        <CostPolicyCreateForm {...props} />
      </MetronicModalDialog>
    </form>
  );
});
