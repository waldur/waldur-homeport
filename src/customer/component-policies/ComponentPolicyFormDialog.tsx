import arrayMutators from 'final-form-arrays';
import { lowerCase, upperFirst } from 'lodash-es';
import { FC, useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  CustomerComponentUsagePolicy,
  CustomerComponentUsagePolicyRequest,
  marketplaceCustomerComponentUsagePoliciesCreate,
  marketplaceCustomerComponentUsagePoliciesUpdate,
  NestedCustomerUsagePolicyComponentRequest,
} from 'waldur-js-client';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { getCustomer } from '@waldur/workspace/selectors';

import { ComponentPolicyForm } from './ComponentPolicyForm';

interface ComponentPolicyFormDialogProps {
  resolve: { policy?: CustomerComponentUsagePolicy; refetch };
}

interface ComponentPolicyFormData {
  actions: { value; label };
  component_limits_set: NestedCustomerUsagePolicyComponentRequest[];
  options?: {
    notify_external_user?: string;
  };
}

export const ComponentPolicyFormDialog: FC<ComponentPolicyFormDialogProps> = ({
  resolve,
}) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const customer = useSelector(getCustomer);

  const isEdit = Boolean(resolve.policy?.uuid);

  const submitFn = useCallback(
    async (formData: ComponentPolicyFormData) => {
      const body: CustomerComponentUsagePolicyRequest = {
        scope: isEdit ? resolve.policy.scope : customer.url,
        actions: formData.actions.value,
        component_limits_set: formData.component_limits_set,
        options: formData.options,
      };
      try {
        if (isEdit) {
          await marketplaceCustomerComponentUsagePoliciesUpdate({
            path: { uuid: resolve.policy.uuid },
            body,
          });
          showSuccess(translate('Policy has been updated.'));
        } else {
          await marketplaceCustomerComponentUsagePoliciesCreate({
            body,
          });
          showSuccess(translate('Policy has been created.'));
        }
        resolve.refetch();
        closeDialog();
      } catch (error) {
        showErrorResponse(
          error,
          isEdit
            ? translate('Unable to update policy.')
            : translate('Unable to create policy.'),
        );
      }
    },
    [
      resolve.policy,
      resolve.refetch,
      customer,
      showSuccess,
      showErrorResponse,
      closeDialog,
    ],
  );

  const initialValues = useMemo(() => {
    if (!isEdit) {
      return { component_limits_set: [{}] };
    }
    return {
      actions: {
        label: upperFirst(lowerCase(resolve.policy.actions)),
        value: resolve.policy.actions,
      },
      component_limits_set: resolve.policy.component_limits_set.map((set) => ({
        component: set.component,
        limit: set.limit,
        period: set.period,
      })),
      options: resolve.policy.options,
    } as ComponentPolicyFormData;
  }, []);

  return (
    <Form
      onSubmit={submitFn}
      mutators={{ ...arrayMutators }}
      initialValues={initialValues}
    >
      {({ handleSubmit, submitting, invalid, dirty, values, submitErrors }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit
                ? translate('Edit component usage policy')
                : translate('New component usage policy')
            }
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid || !dirty}
                  submitting={submitting}
                  label={isEdit ? translate('Edit') : translate('Create')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <ComponentPolicyForm
              actions={values.actions}
              errors={submitErrors}
              customer={customer}
            />
          </ModalDialog>
        </form>
      )}
    </Form>
  );
};
