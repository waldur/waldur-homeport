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
import { filterOfferingComponents } from '@/marketplace/common/registry';
import { getBillingPeriods } from '@/marketplace/common/utils';

export interface FetchedData {
  resource: Resource;
  columns: SelectDialogFieldColumn[];
  choices: SelectDialogFieldChoice[];
  initialValues: {
    plan: SelectDialogFieldChoice;
  };
}

const getColumns = (
  offering: PublicOfferingDetails,
  shouldConcealPrices: boolean,
): SelectDialogFieldColumn[] => [
  {
    name: 'name',
    label: translate('Name'),
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
): SelectDialogFieldChoice[] =>
  sortPlans(offering.plans).map((plan) => ({
    url: plan.url,
    uuid: plan.uuid,
    name: plan.name,
    ...plan.quotas,
    archived: plan.archived,
    // @ts-ignore
    price: getPlanSwitchPrice(plan),
    disabled: plan.url === resource.plan || !plan.is_active,
    disabledReason: !plan.is_active
      ? translate('Plan capacity is full.')
      : plan.url === resource.plan
        ? translate('Resource already has this plan.')
        : undefined,
  }));

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

  const columns = getColumns(offering, shouldConcealPrices);
  const choices = getChoices(offering, resource);
  const validPlan = choices.find((choice) => !choice.disabled);
  const initialValues = validPlan ? { plan: validPlan } : undefined;
  return { resource, columns, choices, initialValues };
}

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
      offering,
    };
  }

  const { periods, multipliers } = getBillingPeriods(oldPlan.unit);
  const { periods: newPeriods, multipliers: newMultipliers } =
    getBillingPeriods(newPlan.unit);
  const offeringComponents = filterOfferingComponents(offering).filter(
    (component) => component.billing_type === 'limit',
  );

  const components = offeringComponents.map((component) => {
    const currentLimit = order.limits[component.type] || 0;
    const oldPrice = Number(oldPlan.prices[component.type]) || 0;
    const oldSubTotal = oldPrice * currentLimit || 0;
    const oldPrices = multipliers.map((mult) => mult * oldSubTotal);
    const newPrice = Number(newPlan.prices[component.type]) || 0;
    const newSubTotal = newPrice * currentLimit || 0;
    const newPrices = newMultipliers.map((mult) => mult * newSubTotal);
    const changedSubTotal = newSubTotal - oldSubTotal;
    const changedSubTotalPrc = (changedSubTotal / oldSubTotal) * 100;
    // Assuming the period hasn't changed.
    const changedPrices = multipliers.map((mult) => mult * changedSubTotal);
    return {
      type: component.type,
      name: component.name,
      measured_unit: component.measured_unit,
      is_boolean: component.is_boolean,
      limit: currentLimit,
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
  return {
    periods,
    newPeriods,
    components,
    totalPeriods,
    newTotalPeriods,
    changedTotalPeriods,
    offering,
  };
};
