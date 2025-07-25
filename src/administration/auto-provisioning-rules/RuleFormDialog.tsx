import { useCallback } from 'react';
import { reduxForm } from 'redux-form';
import {
  autoprovisioningRulesCreate,
  autoprovisioningRulesUpdate,
  Customer,
  Rule,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

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

export const RuleFormDialog = reduxForm<
  AutoProvisioningRuleForm,
  RuleFormDialogProps
>({
  form: 'RuleForm',
})((props) => {
  const isEdit = props.resolve.rule;

  const submitFn = useCallback(
    async (formData: AutoProvisioningRuleForm, dispatch) => {
      const payload = {
        name: formData.name,
        customer: formData.customer.url,
        project_role_name: formData.project_role,
        creates_resource: false,
        user_affiliations: formData.user_affiliations
          ? formData.user_affiliations
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        user_email_patterns: formData.user_email_patterns
          ? formData.user_email_patterns
              .split(' ')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      };

      try {
        if (isEdit) {
          await autoprovisioningRulesUpdate({
            path: { uuid: props.resolve.rule.uuid },
            body: payload,
          });
          dispatch(showSuccess(translate('Rule edited successfully')));
        } else {
          await autoprovisioningRulesCreate({
            body: payload,
          });
          dispatch(
            showSuccess(translate('Rule has been successfully created')),
          );
        }
        if (props.resolve.refetch) await props.resolve.refetch();
        dispatch(closeModalDialog());
      } catch (error) {
        dispatch(showErrorResponse(error));
      }
    },
    [props.resolve.rule, props.resolve.refetch],
  );

  return (
    <form onSubmit={props.handleSubmit(submitFn)}>
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
              disabled={props.invalid}
              submitting={props.submitting}
              label={isEdit ? translate('Edit') : translate('Confirm')}
              className="btn btn-primary min-w-125px"
            />
          </>
        }
      >
        <RuleForm submitting={props.submitting} />
      </ModalDialog>
    </form>
  );
});
