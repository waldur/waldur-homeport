import { FC, useEffect, useMemo, useRef } from 'react';
import { useForm, useFormState } from 'react-final-form';
import {
  ProviderOfferingDetails,
  ProviderPlanDetails as Plan,
} from 'waldur-js-client';

import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';

import { optionValue } from './PlanForm';
import { getPlanComponentsForMode } from './planPrices';
import { PricesTable } from './PricesTable';

interface PlanPricesSectionProps {
  offering: Pick<
    ProviderOfferingDetails,
    'type' | 'components' | 'plans' | 'billable'
  >;
  /** The plan being edited: its own components resolve its current mode. */
  plan?: Plan;
  /** Creation must ask; editing states it by setting the prices to 0. */
  showFreeChoice?: boolean;
}

/**
 * Prices where the plan is created, rather than through a separate action
 * afterwards. The provider must say which it is -- priced or free -- because
 * stored prices cannot express the difference: both are zeros.
 */
export const PlanPricesSection: FC<PlanPricesSectionProps> = ({
  offering,
  plan,
  showFreeChoice = true,
}) => {
  const { values } = useFormState({ subscription: { values: true } });
  const mode = optionValue(values.billing_mode);

  const components = useMemo(
    () =>
      getPlanComponentsForMode(
        offering,
        plan ? [plan, ...(offering.plans ?? [])] : offering.plans,
        mode,
      ),
    [offering, plan, mode],
  );

  // Switching the mode re-denominates every price -- cores per month become
  // core-hours -- so a figure typed under the old one is wrong by the hours in
  // a month. Clear them rather than carry them across.
  const form = useForm();
  const lastMode = useRef(mode);
  useEffect(() => {
    if (lastMode.current !== mode) {
      lastMode.current = mode;
      form.change('prices', undefined);
    }
  }, [mode, form]);

  if (!components.length) {
    return null;
  }

  return (
    <>
      {/* Separates this block from the fields above, not from its own body. */}
      <hr className="my-5" />
      <h6 className="mb-5">{translate('Component prices')}</h6>
      {showFreeChoice && (
        <BooleanGroup
          name="is_free"
          label={translate('This plan is free')}
          // help_text, not description: the toggle renders its own supporting
          // line inside the label, where ComponentPrepaidFieldGroup puts it.
          // FormGroup's description lands under the whole control instead.
          help_text={translate(
            'Customers can order it at no cost. Nothing is charged for any component.',
          )}
          space={5}
        />
      )}
      {!values.is_free && (
        <PricesTable
          components={components}
          fieldName="prices"
          // Editing a plan that already charges something: a blank field
          // there would zero a live price.
          requirePrice={Boolean(plan)}
        />
      )}
    </>
  );
};
