import { FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { FC, useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  marketplaceOfferingEstimatedCostPoliciesCreate,
  marketplaceOfferingUsagePoliciesCreate,
  PolicyPeriodEnum,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { policyPeriodOptions } from '@/customer/cost-policies/utils';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

import { PolicyCreateForm } from './PolicyCreateForm';
import {
  OfferingCostPolicyFormData,
  OfferingPolicyType,
  OfferingUsagePolicyFormData,
} from './types';

interface PolicyCreateDialogProps {
  type: OfferingPolicyType;
  offering: Offering;
  refetch(): void;
  initialValues?: Partial<
    OfferingCostPolicyFormData | OfferingUsagePolicyFormData
  >;
}

export const PolicyCreateDialog: FC<PolicyCreateDialogProps> = ({
  type,
  offering,
  refetch,
  initialValues: initialValuesProp,
}) => {
  const { showErrorResponse } = useNotify();
  const { closeDialog } = useModal();

  const onSubmit = useCallback(
    async (
      formData: OfferingCostPolicyFormData | OfferingUsagePolicyFormData,
    ) => {
      try {
        if (type === 'cost') {
          await marketplaceOfferingEstimatedCostPoliciesCreate({
            body: formData as OfferingCostPolicyFormData,
          });
        } else {
          await marketplaceOfferingUsagePoliciesCreate({
            body: formData as OfferingUsagePolicyFormData,
          });
        }
        closeDialog();
        refetch();
      } catch (e) {
        showErrorResponse(e, translate('Unable to create policy.'));
        if (e.response && e.response.status === 400) {
          return {
            ...e.response.data,
            [FORM_ERROR]:
              e.response.data?.non_field_errors?.[0] || e.response.data?.detail,
          };
        }
        return { [FORM_ERROR]: translate('Unable to create policy.') };
      }
    },
    [type, refetch, closeDialog, showErrorResponse],
  );

  const initialValues = useMemo(
    () =>
      initialValuesProp || {
        scope: offering.url,
        period: policyPeriodOptions.oneMonth.value as PolicyPeriodEnum,
        ...(type === 'usage' ? { component_limits_set: [] } : {}),
      },
    [initialValuesProp, offering, type],
  );

  return (
    <Form
      onSubmit={onSubmit}
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
