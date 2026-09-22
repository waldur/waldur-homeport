import { useEffect } from 'react';
import { useForm } from 'react-final-form';
import { Offering, ProviderPlanDetails as Plan } from 'waldur-js-client';

import { getOrderablePlans } from '../offerings/details/planPricing';

import { useOrderFormData } from './selectors';

interface DefaultPlanOptions {
  /** The offering the form is currently ordering. */
  offering?: Offering;
  /** The plan the page was opened with; used only while its offering is on screen. */
  plan?: Plan;
  /** Edit mode, or a form without a plan step: the plan is left alone. */
  skip?: boolean;
}

/**
 * Keeps the order form's plan one of the current offering's, filled in with its
 * default: the plan the page was opened with, or the offering's only plan.
 *
 * FormCloudStep switches the offering inside the form without remounting it --
 * the Rancher cluster form is the one form with both a plan step and a cloud
 * step -- so the plan of the offering switched away from can be left behind.
 * Replacing only a *missing* plan is not enough, because such a plan is not
 * missing: it would price and submit against an offering it does not belong to.
 * So a plan that is not among the current offering's counts as missing, and
 * gives way to the default or, when the new offering has several plans, is
 * cleared so that the user chooses.
 *
 * The plan going missing outright is mostly handled elsewhere:
 * `keepDirtyOnReinitialize` on <Form> carries it through the reinitialisation
 * that choosing a project triggers (`resolveProject` and `resolveCustomer`
 * return fresh object literals, so the form's shallow comparison of
 * `initialValues` never short-circuits and every workspace change
 * reinitialises). What is left for this hook is the plan whose field is not
 * registered at the time -- FormPlanStep renders nothing when the offering has
 * no orderable plans -- and anything that clears the field later.
 *
 * `heldUuid` is therefore a trigger as well as a guard, and a reinitialisation
 * needs it to be: <Form> initialises in the *parent's* effect, after this one,
 * so on that render the effect first runs against the plan still held, and only
 * the resulting notification re-runs it against what survived.
 */
export const useDefaultPlan = ({
  offering,
  plan,
  skip,
}: DefaultPlanOptions) => {
  const form = useForm();
  const { plan: held } = useOrderFormData();
  const heldUuid = held?.uuid;

  useEffect(() => {
    if (skip || !offering) return;
    const plans = getOrderablePlans(offering);
    const isCurrent = (uuid?: string) =>
      Boolean(uuid) && plans.some((candidate) => candidate.uuid === uuid);
    if (isCurrent(heldUuid)) return;

    // Resolve against the offering on screen rather than keeping the plan
    // handed in: the same plan carried by props can be a staler copy, and the
    // held object is what PlanSelectField labels and useOrderPrices prices.
    const fallback = isCurrent(plan?.uuid)
      ? plans.find((candidate) => candidate.uuid === plan.uuid)
      : plans.length === 1
        ? plans[0]
        : undefined;
    if (fallback) {
      form.change('plan', fallback);
    } else if (heldUuid) {
      form.change('plan', undefined);
    }
  }, [offering, plan, heldUuid, skip]);
};
