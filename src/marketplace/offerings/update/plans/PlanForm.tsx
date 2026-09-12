import { FC, useEffect, useMemo } from 'react';
import { useField, useForm } from 'react-final-form';
import { ProviderOfferingDetails } from 'waldur-js-client';

import { required } from '@/core/validators';
import { StringGroup, MarkdownGroup, SelectGroup } from '@/form';
import { translate } from '@/i18n';
import {
  getPlanBillingModeOptions,
  offeringHasBuiltinComponents,
  offeringHasPrepaidBuiltins,
} from '@/marketplace/details/plan/billingMode';

import { ArticleCodeField } from '../../ArticleCodeField';

import { getBillingPeriods } from './constants';

/** SelectGroup stores the selected option; other callers may seed a bare value. */
export const optionValue = (v: unknown): string | undefined =>
  v && typeof v === 'object' ? (v as { value?: string }).value : (v as string);

interface PlanFormProps {
  offering?: Partial<
    Pick<ProviderOfferingDetails, 'components' | 'billing_period_applies'>
  > & {
    plans?: Array<{ unit?: string }>;
  };
  plan?: { resources_count?: number };
}

export const PlanForm: FC<PlanFormProps> = ({ offering, plan }) => {
  const form = useForm();
  const { input: modeInput } = useField('billing_mode', {
    subscription: { value: true },
  });
  const { input: unitInput } = useField('unit', {
    subscription: { value: true },
  });

  // A prepaid offering has no plan-level choice to make: every mode would
  // resolve its builtin components to something that is not prepaid.
  const isPrepaid = offeringHasPrepaidBuiltins(offering);
  const showBillingMode = offeringHasBuiltinComponents(offering) && !isPrepaid;
  const inUse = (plan?.resources_count ?? 0) > 0;

  // SelectGroup keeps the whole option in form state, not its value, so both of
  // these arrive as { value, label } -- and as a bare string from a caller that
  // seeds the form differently.
  const mode = optionValue(modeInput.value) || 'inherit';
  const unit = optionValue(unitInput.value);
  // Only fixed and limit-based components derive their invoice quantity from
  // the period; usage and prepaid price a quantity of their own. The backend
  // resolves that per mode so the rule is not restated here. Absent -- an older
  // backend -- the field behaves as it always did.
  const periodApplies = offering?.billing_period_applies?.[mode] ?? true;

  // Customers can only move between plans that share a billing period, so a
  // plan whose own period is inert still has to match its siblings or it
  // quietly becomes unswitchable.
  const siblingUnit = useMemo(() => {
    const units = new Set(
      (offering?.plans ?? []).map((p) => p.unit).filter(Boolean),
    );
    return units.size === 1 ? [...units][0] : undefined;
  }, [offering?.plans]);

  const pinned = !periodApplies && Boolean(siblingUnit);
  useEffect(() => {
    if (pinned && unit !== siblingUnit) {
      // Put back an option, not a bare value: the select reads both halves.
      form.change(
        'unit',
        getBillingPeriods().find((option) => option.value === siblingUnit),
      );
    }
  }, [pinned, siblingUnit, unit, form]);

  const mismatchesSiblings =
    Boolean(siblingUnit) && Boolean(unit) && unit !== siblingUnit;

  const periodDescription = pinned
    ? translate(
        'Nothing on this plan is billed per period — usage is charged per reported quantity — so it follows the other plans of this offering, which lets customers switch between them.',
      )
    : !periodApplies
      ? translate(
          'Nothing on this plan is billed per period, so this does not change what is invoiced. Customers can only move between plans that share a period, so match the other plans of this offering.',
        )
      : mismatchesSiblings
        ? translate(
            'Fixed and limit-based charges are billed for this period. The plan can be created, but the other plans of this offering use a different period, and customers can only move between plans that share one.',
          )
        : translate(
            'Fixed and limit-based charges are billed for this period. Usage is charged per reported quantity and is unaffected.',
          );

  return (
    <>
      <StringGroup
        space={5}
        name="name"
        validate={required}
        label={translate('Name')}
        required={true}
      />
      {showBillingMode && (
        <SelectGroup
          space={5}
          name="billing_mode"
          label={translate('Billing mode')}
          options={getPlanBillingModeOptions()}
          isClearable={false}
          isDisabled={inUse}
          description={
            inUse
              ? translate('Cannot be changed while resources use this plan.')
              : translate(
                  'Limit-based or usage-based override how the builtin components (cores, RAM, storage) are billed under this plan. Custom components are unaffected.',
                )
          }
        />
      )}
      <SelectGroup
        space={5}
        name="unit"
        validate={required}
        label={translate('Billing period')}
        options={getBillingPeriods()}
        isClearable={false}
        required={true}
        isDisabled={pinned}
        description={periodDescription}
      />
      <MarkdownGroup
        space={5}
        name="description"
        label={translate('Description')}
      />
      <ArticleCodeField />
    </>
  );
};
