import { useQuery } from '@tanstack/react-query';
import { FC, useState, useEffect, useMemo } from 'react';
import { FormCheck } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  marketplaceSlurmPeriodicUsagePoliciesCreate,
  marketplaceSlurmPeriodicUsagePoliciesList,
  marketplaceSlurmPeriodicUsagePoliciesDestroy,
  LimitTypeEnum,
  QosStrategyEnum,
} from 'waldur-js-client';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { NumberField, SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { useOrganizationGroups } from '@waldur/marketplace/common/utils';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { showSuccess, showErrorResponse } from '@waldur/store/notify';

import { OfferingSectionProps } from '../types';

interface SlurmPolicyFormData {
  limit_type: LimitTypeEnum;
  tres_billing_enabled: boolean;
  tres_billing_weights: Record<string, number>;
  fairshare_decay_half_life: number;
  grace_ratio: number;
  carryover_enabled: boolean;
  raw_usage_reset: boolean;
  qos_strategy: QosStrategyEnum;
  apply_to_all: boolean;
  organization_groups: string[];
}

const limitTypeOptions = [
  { value: 'GrpTRESMins', label: translate('Group TRES Minutes') },
  { value: 'MaxTRESMins', label: translate('Max TRES Minutes') },
  { value: 'GrpTRES', label: translate('Group TRES (concurrent)') },
];

const qosStrategyOptions = [
  {
    value: 'threshold',
    label: translate('Threshold-based (single threshold)'),
  },
  {
    value: 'progressive',
    label: translate('Progressive (multiple thresholds)'),
  },
];

const initialValues: SlurmPolicyFormData = {
  limit_type: 'GrpTRESMins' as LimitTypeEnum,
  tres_billing_enabled: true,
  tres_billing_weights: {
    CPU: 0.015625,
    Mem: 0.001953125,
    'GRES/gpu': 0.25,
  },
  fairshare_decay_half_life: 15,
  grace_ratio: 0.2,
  carryover_enabled: true,
  raw_usage_reset: true,
  qos_strategy: 'threshold' as QosStrategyEnum,
  apply_to_all: true,
  organization_groups: [],
};

export const SlurmPolicySection: FC<OfferingSectionProps> = ({
  offering,
  refetch,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolicyEnabled, setIsPolicyEnabled] = useState(false);
  const dispatch = useDispatch();

  const { isLoading: groupsLoading, data: organizationGroups } =
    useOrganizationGroups();

  // Fetch existing SLURM policies for this offering
  const {
    data: existingPolicies,
    isLoading: policiesLoading,
    refetch: refetchPolicies,
  } = useQuery({
    queryKey: ['slurm-policies', offering?.uuid],
    queryFn: async () => {
      if (!offering) return null;
      const response = await marketplaceSlurmPeriodicUsagePoliciesList({
        query: { scope_uuid: offering.uuid },
      });
      return response.data;
    },
    enabled: !!offering,
  });

  // Update policy enabled state based on existing policies
  useEffect(() => {
    if (existingPolicies) {
      setIsPolicyEnabled(existingPolicies.length > 0);
    }
  }, [existingPolicies]);

  // Compute dynamic initial values based on organization groups
  const dynamicInitialValues = useMemo(
    (): SlurmPolicyFormData => ({
      ...initialValues,
      apply_to_all: organizationGroups?.length === 0, // True when no groups available
      organization_groups: [],
    }),
    [organizationGroups],
  );

  // Force checkbox to be checked when no organization groups exist
  useEffect(() => {
    if (organizationGroups?.length === 0) {
      const timer = setTimeout(() => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const applyToAllCheckbox = Array.from(checkboxes).find((cb) => {
          const text = cb.closest('div')?.textContent || '';
          return text.includes('Apply to All Organization Groups');
        }) as HTMLInputElement;

        if (
          applyToAllCheckbox &&
          applyToAllCheckbox.disabled &&
          !applyToAllCheckbox.checked
        ) {
          applyToAllCheckbox.checked = true;
          const event = new Event('change', { bubbles: true });
          applyToAllCheckbox.dispatchEvent(event);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [organizationGroups]);

  if (!offering) {
    return null;
  }

  if (groupsLoading || policiesLoading) {
    return <LoadingSpinner />;
  }

  const handleTogglePolicy = async (enabled: boolean) => {
    setIsSubmitting(true);

    try {
      if (enabled) {
        // Enable: Policy will be created when form is submitted
        setIsPolicyEnabled(true);
      } else {
        // Disable: Remove existing policies
        if (existingPolicies && existingPolicies.length > 0) {
          await Promise.all(
            existingPolicies.map((policy) =>
              marketplaceSlurmPeriodicUsagePoliciesDestroy({
                path: { uuid: policy.uuid },
              }),
            ),
          );
          dispatch(
            showSuccess(
              translate('SLURM policy has been disabled and removed.'),
            ),
          );
        }
        setIsPolicyEnabled(false);
        await refetchPolicies();
      }

      // Call refetch if available to refresh data
      if (refetch) {
        refetch();
      }
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Failed to update SLURM policy. Please try again.'),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (formData: SlurmPolicyFormData) => {
    setIsSubmitting(true);

    try {
      // First, remove existing policies if any
      if (existingPolicies && existingPolicies.length > 0) {
        await Promise.all(
          existingPolicies.map((policy) =>
            marketplaceSlurmPeriodicUsagePoliciesDestroy({
              path: { uuid: policy.uuid },
            }),
          ),
        );
      }

      // Create new policy
      const policyData = {
        ...formData,
        offering: offering.url,
        scope: offering.url,
        actions: 'notify_organization_owners',
        component_limits_set: [],
      };

      await marketplaceSlurmPeriodicUsagePoliciesCreate({
        body: policyData,
      });
      dispatch(
        showSuccess(translate('SLURM policy has been saved successfully.')),
      );

      await refetchPolicies();

      // Call refetch if available to refresh data
      if (refetch) {
        refetch();
      }
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Failed to save SLURM policy. Please try again.'),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Panel
      title={translate('SLURM Periodic Usage Policy')}
      subtitle={translate(
        'Configure SLURM-specific periodic usage policy with decay and carryover logic.',
      )}
      titleClassName="fw-normal"
      cardBordered
    >
      <div className="mb-6">
        <FormCheck
          type="switch"
          id="slurm-policy-toggle"
          checked={isPolicyEnabled}
          onChange={(e) => handleTogglePolicy(e.target.checked)}
          disabled={isSubmitting}
          label={translate('Enable SLURM Periodic Usage Policy')}
        />
        <div className="form-text">
          {translate(
            'When enabled, allows configuration of SLURM-specific usage policies. When disabled, removes any existing policies from the backend.',
          )}
        </div>
      </div>

      {isPolicyEnabled && (
        <Form
          key={`slurm-form-${organizationGroups?.length || 0}`}
          onSubmit={handleSubmit}
          initialValues={dynamicInitialValues}
          render={({ handleSubmit, form, pristine }) => (
            <>
              <div className="d-flex justify-content-end mb-4">
                <div className="d-flex gap-3">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => form.reset()}
                    disabled={pristine || isSubmitting}
                  >
                    {translate('Reset')}
                  </button>
                  <button
                    type="submit"
                    form="slurm-policy-form"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? translate('Saving...')
                      : translate('Save Policy')}
                  </button>
                </div>
              </div>

              <form id="slurm-policy-form" onSubmit={handleSubmit}>
                <FormGroup label={translate('Limit Type')} required>
                  <Field
                    component={SelectField as any}
                    name="limit_type"
                    options={limitTypeOptions}
                    getOptionValue={(option) => option.value}
                    getOptionLabel={(option) => option.label}
                    simpleValue
                  />
                </FormGroup>

                <FormGroup
                  help={translate(
                    'Use TRES billing units instead of raw TRES values',
                  )}
                >
                  <Field
                    component={AwesomeCheckbox as any}
                    name="tres_billing_enabled"
                    label={translate('TRES Billing Enabled')}
                  />
                </FormGroup>

                <FormGroup
                  label={translate('Fairshare Decay Half-Life')}
                  help={translate(
                    'Fairshare decay half-life in days (matches SLURM PriorityDecayHalfLife)',
                  )}
                  required
                >
                  <Field
                    component={NumberField as any}
                    name="fairshare_decay_half_life"
                    min={1}
                    unit={translate('days')}
                  />
                </FormGroup>

                <FormGroup
                  label={translate('Grace Ratio')}
                  help={translate(
                    'Grace period ratio (0.2 = 20% overconsumption allowed)',
                  )}
                  required
                >
                  <Field
                    component={NumberField as any}
                    name="grace_ratio"
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </FormGroup>

                <FormGroup
                  help={translate(
                    'Enable unused allocation carryover to next period',
                  )}
                >
                  <Field
                    component={AwesomeCheckbox as any}
                    name="carryover_enabled"
                    label={translate('Carryover Enabled')}
                  />
                </FormGroup>

                <FormGroup
                  help={translate(
                    'Reset raw usage at period transitions (PriorityUsageResetPeriod=None)',
                  )}
                >
                  <Field
                    component={AwesomeCheckbox as any}
                    name="raw_usage_reset"
                    label={translate('Raw Usage Reset')}
                  />
                </FormGroup>

                <FormGroup label={translate('QoS Strategy')} required>
                  <Field
                    component={SelectField as any}
                    name="qos_strategy"
                    options={qosStrategyOptions}
                    getOptionValue={(option) => option.value}
                    getOptionLabel={(option) => option.label}
                    simpleValue
                  />
                </FormGroup>

                <FormGroup
                  description={
                    organizationGroups?.length > 0
                      ? translate(
                          'When enabled, this policy applies to all organization groups. When disabled, you can select specific groups.',
                        )
                      : translate(
                          'No organization groups are configured in the system. The policy will automatically apply to all organizations.',
                        )
                  }
                >
                  <Field
                    component={AwesomeCheckbox as any}
                    name="apply_to_all"
                    label={translate('Apply to All Organization Groups')}
                    disabled={organizationGroups?.length === 0}
                  />
                  {organizationGroups?.length === 0 && (
                    <Field name="apply_to_all">
                      {({ input }) => {
                        if (!input.value && organizationGroups?.length === 0) {
                          input.onChange(true);
                        }
                        return null;
                      }}
                    </Field>
                  )}
                </FormGroup>

                <Field name="apply_to_all">
                  {({ input: applyToAllInput }) => (
                    <>
                      {!applyToAllInput.value &&
                        organizationGroups?.length > 0 && (
                          <FormGroup
                            label={translate('Organization Groups')}
                            help={translate(
                              'Select which organization groups this policy should apply to.',
                            )}
                            required
                          >
                            <Field
                              component={SelectField as any}
                              name="organization_groups"
                              options={organizationGroups.map((group) => ({
                                value: group.url,
                                label: group.name,
                              }))}
                              getOptionValue={(option) => option.value}
                              getOptionLabel={(option) => option.label}
                              isMulti
                              placeholder={translate(
                                'Select organization groups...',
                              )}
                            />
                          </FormGroup>
                        )}
                    </>
                  )}
                </Field>
              </form>
            </>
          )}
        />
      )}
    </Panel>
  );
};
