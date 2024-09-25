import { reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { MetronicModalDialog } from '@waldur/modal/MetronicModalDialog';

import { PolicyCreateForm } from './PolicyCreateForm';
import {
  OfferingCostPolicyFormData,
  OfferingPolicyType,
  OfferingUsagePolicyFormData,
} from './types';

interface PolicyCreateDialogProps {
  onSubmit(
    formData: OfferingCostPolicyFormData | OfferingUsagePolicyFormData,
  ): void;
  type: OfferingPolicyType;
  offering?: Offering;
}

export const OFFERING_POLICY_FORM = 'offeringPolicyCreate';

export const PolicyCreateDialog = reduxForm<
  OfferingCostPolicyFormData | OfferingUsagePolicyFormData,
  PolicyCreateDialogProps
>({
  form: OFFERING_POLICY_FORM,
})((props) => {
  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <MetronicModalDialog
        title={
          props.type === 'usage'
            ? translate('New usage policy')
            : translate('New cost policy')
        }
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
        <PolicyCreateForm {...props} />
      </MetronicModalDialog>
    </form>
  );
});
