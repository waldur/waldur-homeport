import {
  BasePublicPlan,
  NestedPlanComponent,
  OfferingComponent,
  PublicOfferingDetails,
} from 'waldur-js-client';

import { filterOfferingComponents } from '@/marketplace/common/registry';

/**
 * An offering component as it is billed under one plan.
 *
 * A plan may override how the offering's builtin components are billed
 * (`plan.billing_mode`), so `billing_type`, `measured_unit`, `is_prepaid`
 * and `limit_period` must be read from the plan's components rather than
 * from the offering component whenever a plan is known.
 */
export type EffectiveComponent = OfferingComponent;

type PlanWithComponents = Pick<BasePublicPlan, 'components'>;

const pickOverrides = (
  planComponent: Partial<NestedPlanComponent> | undefined,
): Partial<
  Pick<
    OfferingComponent,
    'billing_type' | 'measured_unit' | 'is_prepaid' | 'limit_period'
  >
> => {
  if (!planComponent) return {};
  const overrides: ReturnType<typeof pickOverrides> = {};
  if (planComponent.billing_type != null) {
    overrides.billing_type = planComponent.billing_type;
  }
  if (planComponent.measured_unit != null) {
    overrides.measured_unit = planComponent.measured_unit;
  }
  if (planComponent.is_prepaid != null) {
    overrides.is_prepaid = planComponent.is_prepaid;
  }
  if (planComponent.limit_period != null) {
    overrides.limit_period = planComponent.limit_period;
  }
  return overrides;
};

/**
 * Merge the plan-resolved billing fields over the given offering components.
 * Components absent from the plan, and plans without resolved fields, keep
 * the offering values.
 */
export const resolvePlanComponents = (
  components: OfferingComponent[],
  plan?: PlanWithComponents | null,
): EffectiveComponent[] => {
  if (!plan?.components?.length) {
    return components;
  }
  const byType = new Map(plan.components.map((pc) => [pc.type, pc]));
  return components.map((component) => ({
    ...component,
    ...pickOverrides(byType.get(component.type)),
  }));
};

/**
 * The offering's visible components, resolved for the given plan.
 */
export const getEffectiveComponents = (
  offering: Pick<PublicOfferingDetails, 'type' | 'components'>,
  plan?: PlanWithComponents | null,
): EffectiveComponent[] =>
  resolvePlanComponents(filterOfferingComponents(offering), plan);

/**
 * Pick the plan a resource is on out of its offering's plans.
 */
export const findResourcePlan = <P extends { uuid?: string }>(
  plans: P[] | undefined,
  planUuid: string | undefined | null,
): P | undefined =>
  planUuid && plans ? plans.find((plan) => plan.uuid === planUuid) : undefined;
