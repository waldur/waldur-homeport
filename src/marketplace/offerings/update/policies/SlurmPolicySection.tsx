import {
  ClockCounterClockwiseIcon,
  EyeIcon,
  LightningIcon,
  PlayIcon,
  QuestionIcon,
  WarningIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Dropdown, FormCheck } from 'react-bootstrap';
import { Field, Form, useFormState, useForm } from 'react-final-form';
import { components } from 'react-select';
import {
  marketplaceSlurmPeriodicUsagePoliciesCreate,
  marketplaceSlurmPeriodicUsagePoliciesList,
  marketplaceSlurmPeriodicUsagePoliciesDestroy,
  marketplaceSlurmPeriodicUsagePoliciesPartialUpdate,
  LimitTypeEnum,
  PolicyPeriodEnum,
  SlurmPeriodicUsagePolicy,
} from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Panel } from '@/core/Panel';
import { SaveButton } from '@/core/SaveButton';
import { composeValidators, required, validateEmails } from '@/core/validators';
import { policyPeriodOptions } from '@/customer/cost-policies/utils';
import {
  SubmitButton,
  SelectGroup,
  StringGroup,
  BooleanGroup,
  NumberGroup,
} from '@/form';
import { MultiSelectValue } from '@/form/select';
import { translate } from '@/i18n';
import { useOrganizationGroups } from '@/marketplace/common/utils';
import { ComponentLimitsField } from '@/marketplace/offerings/details/policies/ComponentLimitsField';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';
import { useUser } from '@/workspace/hooks';

import { OfferingSectionProps } from '../types';

import { SlurmPolicyStatusSummary } from './SlurmPolicyStatusSummary';
import {
  TresBillingWeightsField,
  recordToArray,
  arrayToRecord,
} from './TresBillingWeightsField';

const SlurmPolicyPreviewDialog = lazyComponent(() =>
  import('./SlurmPolicyPreviewDialog').then((m) => ({
    default: m.SlurmPolicyPreviewDialog,
  })),
);

const SlurmPolicyExecutionLogDialog = lazyComponent(() =>
  import('./SlurmPolicyExecutionLogDialog').then((m) => ({
    default: m.SlurmPolicyExecutionLogDialog,
  })),
);

const SlurmPolicyEvaluateDialog = lazyComponent(() =>
  import('./SlurmPolicyEvaluateDialog').then((m) => ({
    default: m.SlurmPolicyEvaluateDialog,
  })),
);

const SlurmPolicySummaryDialog = lazyComponent(() =>
  import('./SlurmPolicySummaryDialog').then((m) => ({
    default: m.SlurmPolicySummaryDialog,
  })),
);

// Staff-only button to open evaluate/dry-run dialog
const EvaluateButton: FC<{ policyUuid: string }> = ({ policyUuid }) => {
  const { openDialog } = useModal();
  const user = useUser();

  const openEvaluate = useCallback(() => {
    openDialog(SlurmPolicyEvaluateDialog, {
      resolve: { policyUuid },
      size: 'xl',
    });
  }, [policyUuid]);

  if (!user?.is_staff) {
    return null;
  }

  return (
    <SubmitButton
      variant="outline-warning"
      onClick={openEvaluate}
      submitting={false}
      type="button"
      iconNode={<PlayIcon weight="bold" />}
      iconOnLeft
    >
      {translate('Evaluate')}
    </SubmitButton>
  );
};

// Dropdown combining informational and log actions
const PolicyInfoDropdown: FC<{
  offering: OfferingSectionProps['offering'];
  policyUuid?: string;
}> = ({ offering, policyUuid }) => {
  const { openDialog } = useModal();
  const formState = useFormState();

  const planAllocations = useMemo(() => {
    if (!offering?.plans) return [];
    return offering.plans
      .filter((plan) => plan.components?.length)
      .map((plan) => ({
        planName: plan.name || plan.uuid || '',
        components: (plan.components || [])
          .filter((c) => c.amount && c.amount > 0)
          .map((c) => ({
            name: c.name || c.type || '',
            type: c.type || '',
            amount: c.amount || 0,
            measuredUnit: c.measured_unit || '',
          })),
      }))
      .filter((plan) => plan.components.length > 0);
  }, [policyUuid, offering?.plans]);

  const openSummary = useCallback(() => {
    openDialog(SlurmPolicySummaryDialog, {
      resolve: {
        config: {
          limit_type: formState.values.limit_type,
          tres_billing_enabled: formState.values.tres_billing_enabled,
          carryover_factor: formState.values.carryover_factor,
          grace_ratio: formState.values.grace_ratio,
          carryover_enabled: formState.values.carryover_enabled,
          raw_usage_reset: formState.values.raw_usage_reset,
          apply_to_all: formState.values.apply_to_all,
          actions: formState.values.actions,
          period: formState.values.period,
        },
        planAllocations,
      },
      size: 'xl',
    });
  }, [planAllocations]);

  const openPreview = useCallback(() => {
    openDialog(SlurmPolicyPreviewDialog, {
      resolve: {
        formValues: {
          grace_ratio: formState.values.grace_ratio,
          carryover_factor: formState.values.carryover_factor,
          carryover_enabled: formState.values.carryover_enabled,
        },
        offering: offering as any,
      },
      size: 'lg',
    });
  }, [offering]);

  const openExecutionLog = useCallback(() => {
    if (!policyUuid) return;
    openDialog(SlurmPolicyExecutionLogDialog, {
      resolve: { policyUuid },
      size: 'xl',
    });
  }, [policyUuid]);

  return (
    <ActionDropdownButton title={translate('Policy info')}>
      <Dropdown.Item onClick={openSummary}>
        <QuestionIcon weight="bold" className="me-2" />
        {translate('How it works')}
      </Dropdown.Item>
      <Dropdown.Item onClick={openPreview}>
        <EyeIcon weight="bold" className="me-2" />
        {translate('Preview impact')}
      </Dropdown.Item>
      {policyUuid && (
        <>
          <Dropdown.Divider />
          <Dropdown.Item onClick={openExecutionLog}>
            <ClockCounterClockwiseIcon weight="bold" className="me-2" />
            {translate('Execution log')}
          </Dropdown.Item>
        </>
      )}
    </ActionDropdownButton>
  );
};

// Preset selector component
const PresetSelector: FC = () => {
  const form = useForm();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const applyPreset = useCallback(
    (preset: PolicyPreset) => {
      // Apply all values from the preset
      Object.entries(preset.values).forEach(([key, value]) => {
        form.change(key as keyof SlurmPolicyFormData, value);
      });
      setSelectedPreset(preset.key);
    },
    [form],
  );

  return (
    <div className="mb-6">
      <div className="d-flex align-items-center gap-2 mb-3">
        <LightningIcon weight="bold" className="text-primary" />
        <span className="fw-semibold">{translate('Quick Configuration')}</span>
      </div>
      <div className="row g-3">
        {policyPresets.map((preset) => (
          <div key={preset.key} className="col-md-6 col-lg-3">
            <Card
              className={`h-100 cursor-pointer border-2 ${
                selectedPreset === preset.key
                  ? 'border-primary bg-light-primary'
                  : 'border-light-dark'
              }`}
              onClick={() => applyPreset(preset)}
              style={{ cursor: 'pointer' }}
            >
              <Card.Body className="p-3">
                <Card.Title className="fs-7 fw-bold mb-2">
                  {preset.label}
                </Card.Title>
                <Card.Text className="fs-8 text-gray-600 mb-0">
                  {preset.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
        ))}
      </div>
      <div className="form-text mt-2">
        {translate(
          'Select a preset to quickly configure common policy patterns. You can customize individual settings after applying a preset.',
        )}
      </div>
    </div>
  );
};

interface ComponentLimit {
  type: string;
  limit: number;
}

interface TresWeight {
  key: string;
  value: number;
}

interface SlurmPolicyFormData {
  limit_type: LimitTypeEnum;
  tres_billing_enabled: boolean;
  tres_billing_weights_array: TresWeight[];
  carryover_factor: number;
  grace_ratio: number;
  carryover_enabled: boolean;
  raw_usage_reset: boolean;
  apply_to_all: boolean;
  organization_groups: string[];
  actions: string[];
  options: {
    notify_external_user?: string;
  };
  component_limits_set: ComponentLimit[];
  period: PolicyPeriodEnum;
}

const limitTypeOptions = [
  { value: 'GrpTRESMins', label: translate('Group TRES Minutes') },
  { value: 'MaxTRESMins', label: translate('Max TRES Minutes') },
  { value: 'GrpTRES', label: translate('Group TRES (concurrent)') },
];

// Policy presets for quick configuration
interface PolicyPreset {
  key: string;
  label: string;
  description: string;
  values: Partial<SlurmPolicyFormData>;
}

const policyPresets: PolicyPreset[] = [
  {
    key: 'quarterly_soft',
    label: translate('Quarterly Research (Soft Limits)'),
    description: translate(
      'Quarterly billing period with 20% grace ratio allowing overrun. Includes carryover of unused allocation. Ideal for research projects with variable workloads.',
    ),
    values: {
      period: 2 as PolicyPeriodEnum, // Quarterly
      grace_ratio: 0.2,
      carryover_enabled: true,
      carryover_factor: 50,
      raw_usage_reset: false,
      limit_type: 'GrpTRESMins' as LimitTypeEnum,
      tres_billing_enabled: true,
      actions: [
        'notify_organization_owners',
        'request_slurm_resource_downscaling',
      ],
    },
  },
  {
    key: 'monthly_strict',
    label: translate('Monthly Strict'),
    description: translate(
      'Monthly billing with hard limits and no grace period. Usage resets each month with no carryover. Best for environments requiring strict cost control.',
    ),
    values: {
      period: 1 as PolicyPeriodEnum, // Monthly
      grace_ratio: 0,
      carryover_enabled: false,
      carryover_factor: 0,
      raw_usage_reset: true,
      limit_type: 'GrpTRESMins' as LimitTypeEnum,
      tres_billing_enabled: true,
      actions: [
        'notify_organization_owners',
        'block_creation_of_new_resources',
        'request_slurm_resource_pausing',
      ],
    },
  },
  {
    key: 'annual_grant',
    label: translate('Annual Grant Allocation'),
    description: translate(
      'Annual billing period designed for research grants. Generous 30% grace ratio with carryover enabled. Up to 75% of unused allocation carries over.',
    ),
    values: {
      period: 4 as PolicyPeriodEnum, // Annual
      grace_ratio: 0.3,
      carryover_enabled: true,
      carryover_factor: 75,
      raw_usage_reset: false,
      limit_type: 'GrpTRESMins' as LimitTypeEnum,
      tres_billing_enabled: true,
      actions: ['notify_organization_owners'],
    },
  },
  {
    key: 'tracking_only',
    label: translate('Usage Tracking Only'),
    description: translate(
      'Track usage without enforcing limits. No QoS modifications, just notifications. Useful for monitoring before implementing enforcement.',
    ),
    values: {
      period: 1 as PolicyPeriodEnum, // Monthly
      grace_ratio: 1.0, // 100% grace = effectively no hard limit
      carryover_enabled: false,
      carryover_factor: 0,
      raw_usage_reset: true,
      limit_type: 'GrpTRESMins' as LimitTypeEnum,
      tres_billing_enabled: false,
      actions: ['notify_organization_owners'],
    },
  },
];

const slurmActionOptions = [
  {
    value: 'notify_organization_owners',
    label: translate('Notify organization owners'),
  },
  {
    value: 'notify_external_user',
    label: translate('Notify external user'),
  },
  {
    value: 'block_creation_of_new_resources',
    label: translate('Block creation of new resources'),
  },
  {
    value: 'request_slurm_resource_downscaling',
    label: translate('Request SLURM resource downscaling (slowdown QoS)'),
  },
  {
    value: 'request_slurm_resource_pausing',
    label: translate('Request SLURM resource pausing (blocked QoS)'),
  },
];

const defaultValues: SlurmPolicyFormData = {
  limit_type: 'GrpTRESMins' as LimitTypeEnum,
  tres_billing_enabled: true,
  tres_billing_weights_array: [],
  carryover_factor: 50,
  grace_ratio: 0.2,
  carryover_enabled: true,
  raw_usage_reset: true,
  apply_to_all: true,
  organization_groups: [],
  actions: ['notify_organization_owners'],
  options: {},
  component_limits_set: [] as ComponentLimit[],
  period: 3 as PolicyPeriodEnum, // Default to quarterly (3 months)
};

// Convert existing policy data to form values
const policyToFormValues = (
  policy: SlurmPeriodicUsagePolicy,
): SlurmPolicyFormData => ({
  limit_type: policy.limit_type || defaultValues.limit_type,
  tres_billing_enabled:
    policy.tres_billing_enabled ?? defaultValues.tres_billing_enabled,
  tres_billing_weights_array: policy.tres_billing_weights
    ? recordToArray(policy.tres_billing_weights as Record<string, number>)
    : defaultValues.tres_billing_weights_array,
  carryover_factor: policy.carryover_factor ?? defaultValues.carryover_factor,
  grace_ratio: policy.grace_ratio ?? defaultValues.grace_ratio,
  carryover_enabled:
    policy.carryover_enabled ?? defaultValues.carryover_enabled,
  raw_usage_reset: policy.raw_usage_reset ?? defaultValues.raw_usage_reset,
  apply_to_all: policy.apply_to_all ?? defaultValues.apply_to_all,
  organization_groups: policy.organization_groups || [],
  // Convert actions string to array
  actions: policy.actions
    ? policy.actions.split(',').map((a) => a.trim())
    : defaultValues.actions,
  options: (policy.options as { notify_external_user?: string }) || {},
  component_limits_set:
    policy.component_limits_set?.length > 0
      ? policy.component_limits_set.map((limit) => ({
          type: limit.type,
          limit: limit.limit,
        }))
      : defaultValues.component_limits_set,
  period: policy.period ?? defaultValues.period,
});

export const SlurmPolicySection: FC<OfferingSectionProps> = ({
  offering,
  refetch,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolicyEnabled, setIsPolicyEnabled] = useState(false);
  const { showErrorResponse, showSuccess } = useNotify();

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

  // Get the first existing policy (if any) for editing
  const existingPolicy = existingPolicies?.[0] || null;

  // Compute initial values based on existing policy or defaults
  const dynamicInitialValues = useMemo((): SlurmPolicyFormData => {
    if (existingPolicy) {
      return policyToFormValues(existingPolicy);
    }
    return {
      ...defaultValues,
      apply_to_all: organizationGroups?.length === 0, // True when no groups available
      organization_groups: [],
    };
  }, [existingPolicy, organizationGroups]);

  // Filter offering components to those that support limits/usage
  const availableComponents = useMemo(() => {
    if (!offering?.components) return [];
    return offering.components.filter(
      (c) => c.billing_type === 'usage' || c.billing_type === 'limit',
    );
  }, [offering?.components]);

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
          showSuccess(translate('SLURM policy has been disabled and removed.'));
        }
        setIsPolicyEnabled(false);
        await refetchPolicies();
      }

      // Call refetch if available to refresh data
      if (refetch) {
        refetch();
      }
    } catch (error) {
      showErrorResponse(
        error,
        translate('Failed to update SLURM policy. Please try again.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (formData: SlurmPolicyFormData) => {
    if (!isPolicyEnabled) return;

    setIsSubmitting(true);

    try {
      // Convert form data to API format
      const {
        actions: actionsArray,
        tres_billing_weights_array,
        ...restFormData
      } = formData;
      const apiData = {
        ...restFormData,
        actions: actionsArray.join(','),
        tres_billing_weights: arrayToRecord(tres_billing_weights_array),
      };

      if (existingPolicy) {
        // Update existing policy
        await marketplaceSlurmPeriodicUsagePoliciesPartialUpdate({
          path: { uuid: existingPolicy.uuid },
          body: apiData,
        });
        showSuccess(translate('SLURM policy has been updated successfully.'));
      } else {
        // Create new policy
        const policyData = {
          ...apiData,
          scope: offering.url,
          component_limits_set: [],
        };

        await marketplaceSlurmPeriodicUsagePoliciesCreate({
          body: policyData,
        });
        showSuccess(translate('SLURM policy has been created successfully.'));
      }

      await refetchPolicies();

      // Call refetch if available to refresh data
      if (refetch) {
        refetch();
      }
    } catch (error) {
      showErrorResponse(
        error,
        translate('Failed to save SLURM policy. Please try again.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const panelTitle = translate('SLURM Periodic Usage Policy');
  const panelSubtitle = translate(
    'Configure SLURM-specific periodic usage policy with decay and carryover logic.',
  );

  const enableToggle = (
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
  );

  if (!isPolicyEnabled) {
    return (
      <Panel
        title={panelTitle}
        subtitle={panelSubtitle}
        titleClassName="fw-normal"
        cardBordered
      >
        {enableToggle}
      </Panel>
    );
  }

  return (
    <Form
      key={`slurm-form-${existingPolicy?.uuid || 'new'}-${organizationGroups?.length || 0}`}
      onSubmit={handleSubmit}
      initialValues={dynamicInitialValues}
      mutators={{ ...arrayMutators }}
      render={({ handleSubmit, form, pristine, dirty }) => (
        <Panel
          title={panelTitle}
          subtitle={panelSubtitle}
          titleClassName="fw-normal"
          cardBordered
          actions={
            <div className="d-flex gap-3">
              <PolicyInfoDropdown
                offering={offering}
                policyUuid={existingPolicy?.uuid}
              />
              {existingPolicy && (
                <EvaluateButton policyUuid={existingPolicy.uuid} />
              )}
              <SubmitButton
                variant="secondary"
                onClick={() => form.reset()}
                disabled={pristine}
                submitting={isSubmitting}
                type="button"
              >
                {translate('Reset')}
              </SubmitButton>
              <SaveButton
                onClick={handleSubmit}
                submitting={isSubmitting}
                dirty={dirty}
              />
            </div>
          }
        >
          {enableToggle}
          {existingPolicy?.warnings?.length > 0 && (
            <div className="alert alert-warning d-flex align-items-start mb-4">
              <WarningIcon
                weight="bold"
                className="me-2 mt-1 flex-shrink-0"
                size={20}
              />
              <div>
                {existingPolicy.warnings.map((warning, index) => (
                  <div key={index}>{warning}</div>
                ))}
              </div>
            </div>
          )}
          {existingPolicy && (
            <SlurmPolicyStatusSummary policyUuid={existingPolicy.uuid} />
          )}
          <form id="slurm-policy-form" onSubmit={handleSubmit}>
            <PresetSelector />

            <SelectGroup
              name="actions"
              options={slurmActionOptions}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              isMulti
              simpleValue
              placeholder={translate('Select actions...')}
              components={{
                MultiValue: MultiSelectValue,
                ValueContainer: components.ValueContainer,
              }}
              label={translate('Policy Actions')}
              help={translate(
                'Select actions to trigger when usage thresholds are reached.',
              )}
              required
            />

            <Field name="actions">
              {({ input: actionsInput }) =>
                actionsInput.value?.includes('notify_external_user') && (
                  <StringGroup
                    name="options.notify_external_user"
                    validate={composeValidators(required, validateEmails)}
                    placeholder="admin@example.com, ops@example.com"
                    label={translate('External Email')}
                    help={translate(
                      'Comma-separated list of email addresses to notify.',
                    )}
                    required
                  />
                )
              }
            </Field>

            {availableComponents.length > 0 && (
              <ComponentLimitsField components={availableComponents} />
            )}

            <SelectGroup
              name="period"
              options={Object.values(policyPeriodOptions)}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              simpleValue
              label={translate('Period')}
              help={translate(
                'The time period over which usage is accumulated and limits are applied.',
              )}
              required
            />

            <SelectGroup
              name="limit_type"
              options={limitTypeOptions}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              simpleValue
              label={translate('Limit Type')}
              required
            />

            <BooleanGroup
              name="tres_billing_enabled"
              label={translate('TRES Billing Enabled')}
              help={translate(
                'Use TRES billing units instead of raw TRES values',
              )}
            />

            <Field name="tres_billing_enabled">
              {({ input: tresBillingInput }) =>
                tresBillingInput.value && <TresBillingWeightsField />
              }
            </Field>

            <NumberGroup
              name="carryover_factor"
              min={0}
              max={100}
              unit="%"
              label={translate('Carryover factor')}
              help={translate(
                'Maximum percentage of the base allocation that can carry over from unused previous period (0 = no carryover, 100 = full carryover).',
              )}
              required
            />

            <NumberGroup
              name="grace_ratio"
              min={0}
              max={1}
              step={0.1}
              label={translate('Grace Ratio')}
              help={translate(
                'Grace period ratio (0.2 = 20% overconsumption allowed)',
              )}
              required
            />

            <BooleanGroup
              name="carryover_enabled"
              label={translate('Carryover Enabled')}
              help={translate(
                'Enable unused allocation carryover to next period',
              )}
            />

            <BooleanGroup
              name="raw_usage_reset"
              label={translate('Raw Usage Reset')}
              help={translate(
                'Reset raw usage at period transitions (PriorityUsageResetPeriod=None)',
              )}
            />

            <BooleanGroup
              name="apply_to_all"
              label={translate('Apply to All Organization Groups')}
              disabled={organizationGroups?.length === 0}
              help={
                organizationGroups?.length > 0
                  ? translate(
                      'When enabled, this policy applies to all organization groups. When disabled, you can select specific groups.',
                    )
                  : translate(
                      'No organization groups are configured in the system. The policy will automatically apply to all organizations.',
                    )
              }
            />

            <Field name="apply_to_all">
              {({ input: applyToAllInput }) => (
                <>
                  {!applyToAllInput.value && organizationGroups?.length > 0 && (
                    <SelectGroup
                      name="organization_groups"
                      options={organizationGroups.map((group) => ({
                        value: group.url,
                        label: group.name,
                      }))}
                      getOptionValue={(option) => option.value}
                      getOptionLabel={(option) => option.label}
                      isMulti
                      placeholder={translate('Select organization groups...')}
                      label={translate('Organization Groups')}
                      help={translate(
                        'Select which organization groups this policy should apply to.',
                      )}
                      required
                    />
                  )}
                </>
              )}
            </Field>
          </form>
        </Panel>
      )}
    />
  );
};
