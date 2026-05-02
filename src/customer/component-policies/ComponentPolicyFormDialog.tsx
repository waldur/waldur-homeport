import arrayMutators from 'final-form-arrays';
import { lowerCase, upperFirst } from 'lodash-es';
import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { useSelector } from 'react-redux';
import {
  type CustomerComponentUsagePolicy,
  type CustomerComponentUsagePolicyRequest,
  marketplaceCustomerComponentUsagePoliciesCreate,
  marketplaceCustomerComponentUsagePoliciesUpdate,
  type NestedCustomerUsagePolicyComponentRequest,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { getCustomer } from '@/workspace/selectors';

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
  const customer = useSelector(getCustomer);

  const isEdit = Boolean(resolve.policy?.uuid);

  const submitMutation = useManagedMutation<any, any, ComponentPolicyFormData>({
    mutationFn: (formData) => {
      const body: CustomerComponentUsagePolicyRequest = {
        scope: isEdit ? resolve.policy.scope : customer.url,
        actions: formData.actions.value,
        component_limits_set: formData.component_limits_set,
        options: formData.options,
      };
      return isEdit
        ? marketplaceCustomerComponentUsagePoliciesUpdate({
            path: { uuid: resolve.policy.uuid },
            body,
          })
        : marketplaceCustomerComponentUsagePoliciesCreate({
            body,
          });
    },
    successMessage: isEdit
      ? translate('Policy has been updated.')
      : translate('Policy has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update policy.')
      : translate('Unable to create policy.'),
    refetch: resolve.refetch,
  });

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
      onSubmit={(values) => submitMutation.mutateAsync(values)}
      mutators={{ ...arrayMutators }}
      initialValues={initialValues}
    >
      {({ handleSubmit, invalid, dirty, values, submitErrors }) => (
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
                  submitting={submitMutation.isPending}
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
