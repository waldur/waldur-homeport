import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceCustomerEstimatedCostPoliciesCreate,
  marketplaceCustomerEstimatedCostPoliciesUpdate,
  marketplaceProjectEstimatedCostPoliciesCreate,
  marketplaceProjectEstimatedCostPoliciesUpdate,
} from 'waldur-js-client';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { CostPolicyForm } from './CostPolicyForm';
import { CostPolicyFormData, CostPolicyType } from './types';
import { getCostPolicyActionOptions } from './utils';

interface CostPolicyFormDialogProps {
  resolve: {
    type: CostPolicyType;
    refetch(): void;
    row?: any;
  };
}

export const CostPolicyFormDialog: FC<CostPolicyFormDialogProps> = (props) => {
  const { type, refetch, row } = props.resolve;
  const isEdit = Boolean(row);

  const initialValues = useMemo<Partial<CostPolicyFormData>>(() => {
    if (!row) return { scope: [] };
    return {
      scope: [
        {
          name: row.scope_name,
          uuid: row.scope_uuid,
          url: row.scope,
          ...(type === 'project'
            ? {
                billing_price_estimate: row.billing_price_estimate,
                project_credit: row.project_credit,
              }
            : {
                billing_price_estimate: row.billing_price_estimate,
                customer_credit: row.customer_credit,
              }),
        },
      ],
      actions: getCostPolicyActionOptions(type).find(
        (option) => option.value === row.actions,
      ) || { value: row.actions, label: row.actions },
      limit_cost: Number(row.limit_cost),
      period: row.period,
      options: row.options,
    };
  }, [row, type]);

  const submitMutation = useManagedMutation<any, any, CostPolicyFormData>({
    mutationFn: (formData) => {
      const promises = formData.scope.map((scope) => {
        const options =
          formData.actions.value === 'notify_external_user'
            ? {
                notify_external_user: formData.options?.notify_external_user,
              }
            : {};
        const data: any = {
          scope: scope.url,
          actions: formData.actions.value,
          limit_cost:
            typeof formData.limit_cost === 'string'
              ? parseFloat(formData.limit_cost)
              : formData.limit_cost,
          period: formData.period,
          options:
            isEdit && row
              ? options
              : Object.keys(options).length
                ? JSON.stringify(options)
                : undefined,
        };
        if (isEdit && row) {
          return type === 'project'
            ? marketplaceProjectEstimatedCostPoliciesUpdate({
                path: { uuid: row.uuid },
                body: data,
              })
            : marketplaceCustomerEstimatedCostPoliciesUpdate({
                path: { uuid: row.uuid },
                body: data,
              });
        } else {
          return type === 'project'
            ? marketplaceProjectEstimatedCostPoliciesCreate({ body: data })
            : marketplaceCustomerEstimatedCostPoliciesCreate({ body: data });
        }
      });
      return Promise.all(promises);
    },
    successMessage: isEdit
      ? translate('Policy has been updated.')
      : translate('Policy has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update policy.')
      : translate('Unable to create policy.'),
    refetch,
  });

  return (
    <Form
      onSubmit={(values: any) => submitMutation.mutateAsync(values)}
      initialValues={initialValues}
      enableReinitialize
      render={({ handleSubmit, submitting, invalid, dirty }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={isEdit ? translate('Edit policy') : translate('New policy')}
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
            <CostPolicyForm type={type} isEdit={isEdit} />
          </ModalDialog>
        </form>
      )}
    />
  );
};
