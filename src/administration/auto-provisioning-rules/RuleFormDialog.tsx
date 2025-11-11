import { FC, useCallback } from 'react';
import { Form } from 'react-final-form';
import {
  autoprovisioningRulesCreate,
  autoprovisioningRulesUpdate,
  Customer,
  Rule,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

import { RuleForm } from './RuleForm';

interface RuleFormDialogProps {
  resolve: { refetch; rule?: Rule };
}

interface AutoProvisioningRuleForm {
  name: string;
  customer: Customer;
  project_role: string;
  user_affiliations: string;
  user_email_patterns: string;
}

export const RuleFormDialog: FC<RuleFormDialogProps> = ({ resolve }) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const isEdit = resolve.rule;

  const initialValues = isEdit
    ? {
        name: resolve.rule.name,
        customer: {
          url: resolve.rule.customer,
          name: resolve.rule.customer_name,
        },
        project_role: resolve.rule.project_role_display_name,
        user_affiliations: resolve.rule.user_affiliations?.join(', ') || '',
        user_email_patterns: resolve.rule.user_email_patterns?.join(' ') || '',
      }
    : undefined;

  const onSubmit = useCallback(
    async (formData: AutoProvisioningRuleForm) => {
      const payload = {
        name: formData.name,
        customer: formData.customer.url,
        project_role_name: formData.project_role,
        creates_resource: false,
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

      try {
        if (isEdit) {
          await autoprovisioningRulesUpdate({
            path: { uuid: resolve.rule.uuid },
            body: payload,
          });
          showSuccess(translate('Rule edited successfully'));
        } else {
          await autoprovisioningRulesCreate({
            body: payload,
          });
          showSuccess(translate('Rule has been successfully created'));
        }
        if (resolve.refetch) await resolve.refetch();
        closeDialog();
      } catch (error) {
        showErrorResponse(error);
      }
    },
    [
      resolve.rule,
      resolve.refetch,
      showSuccess,
      showErrorResponse,
      closeDialog,
    ],
  );

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit auto-provisioning rule')
                : translate('Add auto-provisioning rule')
            }
            closeButton
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
            <RuleForm />
          </ModalDialog>
        </form>
      )}
    />
  );
};
