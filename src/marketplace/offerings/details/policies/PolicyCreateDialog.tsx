import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { Form } from 'react-final-form';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { PolicyCreateForm } from './PolicyCreateForm';
import {
  OfferingCostPolicyFormData,
  OfferingPolicyType,
  OfferingUsagePolicyFormData,
} from './types';

interface PolicyCreateDialogProps {
  submitFn(
    formData: OfferingCostPolicyFormData | OfferingUsagePolicyFormData,
  ): Promise<void>;
  type: OfferingPolicyType;
  offering?: Offering;
  initialValues?: Partial<
    OfferingCostPolicyFormData | OfferingUsagePolicyFormData
  >;
}

export const PolicyCreateDialog: FC<PolicyCreateDialogProps> = ({
  submitFn,
  type,
  offering,
  initialValues,
}) => {
  return (
    <Form
      onSubmit={(formData) => submitFn(formData)}
      initialValues={initialValues}
      mutators={{ ...arrayMutators }}
      render={({
        handleSubmit,
        submitting,
        invalid,
        submitError,
        pristine,
      }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              type === 'usage'
                ? translate('New usage policy')
                : translate('New cost policy')
            }
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid || pristine}
                  submitting={submitting}
                  label={translate('Create')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <PolicyCreateForm
              type={type}
              offering={offering}
              submitting={submitting}
              submitError={submitError}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
