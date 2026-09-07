import {
  BasePublicPlan,
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesRetrieve,
  Offering,
  OrderDetails,
  projectsRetrieve,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { SelectDialogFieldColumn, SelectDialogFieldChoice } from '@/form/types';
import { translate } from '@/i18n';
import {
  filterOfferingComponents,
  getFormLimitParser,
} from '@/marketplace/common/registry';
import { getBillingPeriods } from '@/marketplace/common/utils';
import {
  getPlanBillingMode,
  getPlanBillingModeLabel,
  PlanBilling,
} from '@/marketplace/details/plan/billingMode';
import { getEffectiveComponents } from '@/marketplace/details/plan/effectiveComponents';

import { BilledLimit } from './PlanSwitchModeExplanation';

export interface FetchedData {
  resource: Resource;
  offering: PublicOfferingDetails;
  currentPlan?: BasePublicPlan;
  currentMode: PlanBilling | null;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  initialValues: {
    plan: SelectDialogFieldChoice;
  };
  shouldConcealPrices: boolean;
}

const getColumns = (
  offering: PublicOfferingDetails,
  shouldConcealPrices: boolean,
): SelectDialogFieldColumn[] => [
  {
    name: 'name',
    label: translate('Name'),
  },
  {
    name: 'billing_mode',
    label: translate('Billing'),
  },
  ...filterOfferingComponents(offering)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((component) => ({
      name: component.type,
      label: component.name,
    })),
  ...(shouldConcealPrices
    ? []
    : [
        {
          name: 'price',
          label: translate('Price'),
        },
      ]),
];

const sortPlans = (plans: BasePublicPlan[]) =>
  plans
    .map((plan) => ({
      ...plan,
      unit_price:
        typeof plan.unit_price === 'string'
          ? parseFloat(plan.unit_price)
          : plan.unit_price,
    }))
    .sort((a, b) => a.unit_price - b.unit_price);

const getPlanSwitchPrice = (plan: BasePublicPlan) => {
  const fixedPart =
    typeof plan.unit_price === 'string'
      ? parseFloat(plan.unit_price)
      : plan.unit_price;
  const switchPart =
    typeof plan.switch_price === 'string'
      ? parseFloat(plan.switch_price)
      : plan.switch_price;
  return defaultCurrency(fixedPart + switchPart);
};

const getChoices = (
  offering: PublicOfferingDetails,
  resource: Resource,
  currentPlan?: BasePublicPlan,
): SelectDialogFieldChoice[] =>
  sortPlans(offering.plans).map((plan) => {
    const unitMismatch = Boolean(currentPlan && plan.unit !== currentPlan.unit);
    return {
      url: plan.url,
      uuid: plan.uuid,
      name: plan.name,
      billing_mode: getPlanBillingModeLabel(getPlanBillingMode(offering, plan)),
      ...plan.quotas,
      archived: plan.archived,
      // @ts-ignore
      price: getPlanSwitchPrice(plan),
      disabled: plan.url === resource.plan || !plan.is_active || unitMismatch,
      disabledReason: !plan.is_active
        ? translate('Plan capacity is full.')
        : plan.url === resource.plan
          ? translate('Resource already has this plan.')
          : unitMismatch
            ? translate(
                'Billing period ({unit}) differs from the current plan.',
                { unit: plan.unit },
              )
            : undefined,
    };
  });

export async function loadData(resource_uuid): Promise<FetchedData> {
  const [resource, offering] = await Promise.all([
    marketplaceResourcesRetrieve({
      path: { uuid: resource_uuid },
    }).then((r) => r.data),
    marketplaceResourcesOfferingRetrieve({
      path: { uuid: resource_uuid },
    }).then((response) => response.data),
  ]);

  let shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );
  if (!shouldConcealPrices && resource.project_uuid) {
    try {
      const project = await projectsRetrieve({
        path: { uuid: resource.project_uuid },
        query: { field: ['customer_display_billing_info_in_projects'] },
      }).then((response) => response.data);
      shouldConcealPrices =
        project?.customer_display_billing_info_in_projects === false;
    } catch {
      // If we can't fetch the project, don't conceal prices
    }
  }

  const currentPlan = offering.plans.find(
    (plan) => plan.uuid === resource.plan_uuid,
  );
  const columns = getColumns(offering, shouldConcealPrices);
  const choices = getChoices(offering, resource, currentPlan);
  const validPlan = choices.find((choice) => !choice.disabled);
  const initialValues = validPlan ? { plan: validPlan } : undefined;
  return {
    resource,
    offering,
    currentPlan,
    currentMode: getPlanBillingMode(offering, currentPlan),
    columns,
    choices,
    initialValues,
    shouldConcealPrices,
  };
}

/**
 * The limits a limit-based plan bills for a resource, priced with that plan.
 */
export const getBilledLimits = (
  offering: Pick<PublicOfferingDetails, 'type' | 'components'>,
  plan: BasePublicPlan,
  limits: Record<string, number> | null | undefined,
): BilledLimit[] => {
  const parsedLimits = getFormLimitParser(offering.type)(limits || {});
  return getEffectiveComponents(offering, plan)
    .filter((component) => component.billing_type === 'limit')
    .map((component) => {
      const limit = parsedLimits[component.type] || 0;
      const price = Number(plan.prices[component.type]) || 0;
      return {
        name: component.name,
        limit,
        measured_unit: component.measured_unit,
        price,
        subTotal: price * limit,
      };
    });
};

export const getPlanSwitchData = (order: OrderDetails, offering: Offering) => {
  const oldPlan = offering.plans.find((p) => p.uuid === order.old_plan_uuid);
  const newPlan = offering.plans.find((p) => p.uuid === order.new_plan_uuid);

  // Guard against missing plans
  if (!oldPlan || !newPlan) {
    return {
      periods: [],
      newPeriods: [],
      components: [],
      totalPeriods: [],
      newTotalPeriods: [],
      changedTotalPeriods: [],
      hasUsageSide: false,
      offering,
    };
  }

  const { periods, multipliers } = getBillingPeriods(oldPlan.unit);
  const { periods: newPeriods, multipliers: newMultipliers } =
    getBillingPeriods(newPlan.unit);
  // Each side is resolved for its own plan: a component may be limit-based
  // under one plan and usage-based under the other.
  const oldComponents = new Map(
    getEffectiveComponents(offering, oldPlan).map((c) => [c.type, c]),
  );
  const newComponents = new Map(
    getEffectiveComponents(offering, newPlan).map((c) => [c.type, c]),
  );
  const isBilled = (billingType?: string) =>
    billingType === 'limit' || billingType === 'usage';
  const types = [...oldComponents.keys()].filter(
    (type) =>
      isBilled(oldComponents.get(type)?.billing_type) ||
      isBilled(newComponents.get(type)?.billing_type),
  );

  const components = types.map((type) => {
    const oldComponent = oldComponents.get(type);
    const newComponent = newComponents.get(type) ?? oldComponent;
    const oldBillingType = oldComponent.billing_type;
    const newBillingType = newComponent.billing_type;
    const currentLimit = order.limits?.[type] || 0;
    const oldPrice = Number(oldPlan.prices[type]) || 0;
    const newPrice = Number(newPlan.prices[type]) || 0;
    const oldSubTotal =
      oldBillingType === 'limit' ? oldPrice * currentLimit || 0 : 0;
    const newSubTotal =
      newBillingType === 'limit' ? newPrice * currentLimit || 0 : 0;
    const bothLimit = oldBillingType === 'limit' && newBillingType === 'limit';
    const oldPrices = multipliers.map((mult) => mult * oldSubTotal);
    const newPrices = newMultipliers.map((mult) => mult * newSubTotal);
    const changedSubTotal = bothLimit ? newSubTotal - oldSubTotal : 0;
    const changedSubTotalPrc =
      bothLimit && oldSubTotal ? (changedSubTotal / oldSubTotal) * 100 : 0;
    // Assuming the period hasn't changed.
    const changedPrices = multipliers.map((mult) => mult * changedSubTotal);
    return {
      type,
      name: oldComponent.name,
      measured_unit: oldComponent.measured_unit,
      is_boolean: oldComponent.is_boolean,
      limit: currentLimit,
      oldBillingType,
      newBillingType,
      oldMeasuredUnit: oldComponent.measured_unit,
      newMeasuredUnit: newComponent.measured_unit,
      oldPrice,
      newPrice,
      bothLimit,
      oldPrices,
      newPrices,
      changedPrices,
      oldSubTotal,
      newSubTotal,
      changedSubTotal,
      changedSubTotalPrc,
    };
  });
  const oldTotal = components.reduce(
    (result, item) => result + item.oldSubTotal,
    0,
  );
  const newTotal = components.reduce(
    (result, item) => result + item.newSubTotal,
    0,
  );
  const changedTotal = components.reduce(
    (result, item) => result + item.changedSubTotal,
    0,
  );
  const totalPeriods = multipliers.map((mult) => mult * oldTotal || 0);
  const newTotalPeriods = newMultipliers.map((mult) => mult * newTotal || 0);
  // Assuming the period hasn't changed.
  const changedTotalPeriods = multipliers.map(
    (mult) => mult * changedTotal || 0,
  );
  const hasUsageSide = components.some(
    (item) =>
      item.oldBillingType === 'usage' || item.newBillingType === 'usage',
  );
  return {
    periods,
    newPeriods,
    components,
    totalPeriods,
    newTotalPeriods,
    changedTotalPeriods,
    hasUsageSide,
    offering,
  };
};
