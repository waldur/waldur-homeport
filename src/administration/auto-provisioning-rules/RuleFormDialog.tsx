import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  autoprovisioningRulesCreate,
  autoprovisioningRulesUpdate,
  Customer,
  Rule,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { RuleForm } from './RuleForm';

interface RuleFormDialogProps {
  resolve: { refetch; rule?: Rule };
}

interface AutoProvisioningRuleForm {
  name: string;
  customer?: Customer;
  project_role: string;
  user_affiliations: string;
  user_email_patterns: string;
  use_user_organization_as_customer_name: boolean;
}

export const RuleFormDialog: FC<RuleFormDialogProps> = ({ resolve }) => {
  const isEdit = resolve.rule;

  const initialValues = isEdit
    ? {
        name: resolve.rule.name,
        customer: resolve.rule.customer
          ? { url: resolve.rule.customer, name: resolve.rule.customer_name }
          : null,
        project_role: resolve.rule.project_role_display_name,
        use_user_organization_as_customer_name:
          resolve.rule.use_user_organization_as_customer_name,
        user_affiliations: resolve.rule.user_affiliations?.join(', ') || '',
        user_email_patterns: resolve.rule.user_email_patterns?.join(' ') || '',
      }
    : undefined;

  const onSubmitMutation = useManagedMutation<
    any,
    any,
    AutoProvisioningRuleForm
  >({
    mutationFn: (formData) => {
      const payload = {
        name: formData.name,
        customer: formData.customer?.url ?? null,
        project_role_name: formData.project_role,
        creates_resource: false,
        use_user_organization_as_customer_name:
          formData.use_user_organization_as_customer_name,
        user_affiliations: formData.user_affiliations
          ? Array.isArray(formData.user_affiliations)
            ? formData.user_affiliations.filter(Boolean)
            : formData.user_affiliations
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean)
          : [],
        user_email_patterns: formData.user_email_patterns
          ? Array.isArray(formData.user_email_patterns)
            ? formData.user_email_patterns.filter(Boolean)
            : formData.user_email_patterns
                .split(' ')
                .map((item) => item.trim())
                .filter(Boolean)
          : [],
      };

      if (isEdit) {
        return autoprovisioningRulesUpdate({
          path: { uuid: resolve.rule.uuid },
          body: payload,
        });
      } else {
        return autoprovisioningRulesCreate({
          body: payload,
        });
      }
    },
    successMessage: isEdit
      ? translate('Rule edited successfully')
      : translate('Rule has been successfully created'),
    refetch: resolve.refetch,
  });

  return (
    <Form<AutoProvisioningRuleForm>
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      initialValues={initialValues}
      validate={(values) => {
        const errors: any = {};
        if (!values.use_user_organization_as_customer_name && !values.customer)
          errors.customer = translate('This field is required.');
        return errors;
      }}
      render={({ handleSubmit, submitting, invalid, values, form }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit auto-provisioning rule')
                : translate('Add auto-provisioning rule')
            }
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={isEdit ? translate('Edit') : translate('Confirm')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <RuleForm values={values} change={form.change} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
