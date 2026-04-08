import {
  BasePublicPlan,
  marketplacePublicOfferingsPlansRetrieve,
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesRetrieve,
  Offering,
  projectsRetrieve,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import {
  filterOfferingComponents,
  getFormLimitParser,
  getFormLimitSerializer,
} from '@waldur/marketplace/common/registry';
import { LimitParser, Limits } from '@waldur/marketplace/common/types';
import { getBillingPeriods } from '@waldur/marketplace/common/utils';
import { parseOfferingLimits } from '@waldur/marketplace/offerings/store/limits';
import { OfferingLimits } from '@waldur/marketplace/offerings/store/types';
import { StateProps } from '@waldur/marketplace/resources/change-limits/connector';

export interface FetchedData {
  resource: Resource;
  offering: PublicOfferingDetails;
  plan: BasePublicPlan;
  limitSerializer: LimitParser;
  usages: Limits;
  limits: Limits;
  initialValues: { limits: Limits };
  offeringLimits: OfferingLimits;
  concealBillingInfo: boolean;
}

export const getLimitChangeRequirements = (
  resource: Resource,
  offering: Offering,
) => {
  const limitParser = getFormLimitParser(offering.type);
  const limitSerializer = getFormLimitSerializer(offering.type);
  const components = filterOfferingComponents(offering).filter(
    (component) => component.billing_type === 'limit' || component.is_prepaid,
  );
  const usages = limitParser(resource.current_usages || {});
  const resourceLimits = limitParser(resource.limits);
  const limits: Record<string, number> = Object.fromEntries(
    components.map((component) => [
      component.type,
      resourceLimits[component.type] || 0,
    ]),
  );
  const offeringLimits = parseOfferingLimits(offering);
  return {
    limitSerializer,
    usages,
    limits,
    offeringLimits,
  };
};

export async function loadData(resource_uuid): Promise<FetchedData> {
  const resource = await marketplaceResourcesRetrieve({
    path: { uuid: resource_uuid },
  }).then((r) => r.data);
  const offering = await marketplaceResourcesOfferingRetrieve({
    path: { uuid: resource_uuid },
  }).then((response) => response.data);

  let plan: BasePublicPlan;
  await marketplacePublicOfferingsPlansRetrieve({
    path: { uuid: resource.offering_uuid, plan_uuid: resource.plan_uuid },
  })
    .then((response) => {
      plan = response.data;
    })
    .catch(() => {
      plan = offering.plans.find((p) => p.uuid === resource.plan_uuid);
    });
  if (!plan) {
    throw Error(`Plan with uuid of ${resource.plan_uuid} does not exist.`);
  }

  const { limitSerializer, usages, limits, offeringLimits } =
    getLimitChangeRequirements(resource, offering);

  let concealBillingInfo = false;
  if (resource.project_uuid) {
    try {
      const project = await projectsRetrieve({
        path: { uuid: resource.project_uuid },
        query: { field: ['customer_display_billing_info_in_projects'] },
      }).then((response) => response.data);
      concealBillingInfo =
        project?.customer_display_billing_info_in_projects === false;
    } catch {
      // If we can't fetch the project, don't conceal prices
    }
  }

  return {
    resource,
    offering,
    plan,
    limitSerializer,
    usages,
    limits,
    offeringLimits,
    initialValues: { limits },
    concealBillingInfo,
  };
}

export const getLimitChangeData = (
  plan,
  offering,
  newLimits,
  currentLimits,
  usages,
  orderCanBeApproved,
  concealBillingInfo = false,
): StateProps => {
  const { periods, multipliers } = getBillingPeriods(plan.unit);
  const offeringComponents = filterOfferingComponents(offering).filter(
    (component) => component.billing_type === 'limit' || component.is_prepaid,
  );
  const components = offeringComponents.map((component) => {
    const price = plan.prices[component.type] || 0;
    const subTotal = price * newLimits[component.type] || 0;
    const prices = multipliers.map((mult) => mult * subTotal);
    const currentLimit = currentLimits[component.type] || 0;
    const newLimit = newLimits[component.type] || 0;
    const changedLimit = newLimit - currentLimit;
    const changedSubTotal = price * changedLimit;
    const changedPrices = multipliers.map((mult) => mult * changedSubTotal);
    return {
      type: component.type,
      name: component.name,
      measured_unit: component.measured_unit,
      is_boolean: component.is_boolean,
      usage: usages[component.type] || 0,
      limit: currentLimits[component.type],
      prices,
      changedPrices,
      subTotal,
      changedSubTotal,
      changedLimit,
    };
  });
  const total = components.reduce((result, item) => result + item.subTotal, 0);
  const changedTotal = components.reduce(
    (result, item) => result + item.changedSubTotal,
    0,
  );
  const totalPeriods = multipliers.map((mult) => mult * total || 0);
  const changedTotalPeriods = multipliers.map(
    (mult) => mult * changedTotal || 0,
  );
  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) || concealBillingInfo;
  return {
    periods,
    components,
    orderCanBeApproved,
    totalPeriods,
    changedTotalPeriods,
    offering,
    shouldConcealPrices,
    newLimits,
  };
};
