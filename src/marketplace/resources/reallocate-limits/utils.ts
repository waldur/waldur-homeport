import {
  BasePublicPlan,
  marketplacePublicOfferingsPlansRetrieve,
  marketplacePublicOfferingsRetrieve,
  marketplaceResourcesRetrieve,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import {
  filterOfferingComponents,
  getFormLimitParser,
  getFormLimitSerializer,
} from '@waldur/marketplace/common/registry';
import { LimitParser, Limits } from '@waldur/marketplace/common/types';
import { parseOfferingLimits } from '@waldur/marketplace/offerings/store/limits';
import { OfferingLimits } from '@waldur/marketplace/offerings/store/types';

export interface FetchedData {
  resource: Resource;
  offering: PublicOfferingDetails;
  plan: BasePublicPlan;
  limitSerializer: LimitParser;
  usages: Limits;
  limits: Limits;
  initialValues: { limits: Limits };
  offeringLimits: OfferingLimits;
}

export async function loadData(resource_uuid: string): Promise<FetchedData> {
  const resource = await marketplaceResourcesRetrieve({
    path: { uuid: resource_uuid },
  }).then((r) => r.data);
  const offering = await marketplacePublicOfferingsRetrieve({
    path: { uuid: resource.offering_uuid },
  }).then((response) => response.data);
  const plan = await marketplacePublicOfferingsPlansRetrieve({
    path: { uuid: resource.offering_uuid, plan_uuid: resource.plan_uuid },
  }).then((response) => response.data);
  const limitParser = getFormLimitParser(offering.type);
  const limitSerializer = getFormLimitSerializer(offering.type);
  const components = filterOfferingComponents(offering).filter(
    (component) => component.billing_type === 'limit',
  );
  const usages = limitParser(resource.current_usages);
  const resourceLimits = limitParser(resource.limits);
  const limits: Record<string, number> = Object.fromEntries(
    components.map((component) => [
      component.type,
      resourceLimits[component.type] || 0,
    ]),
  );
  const offeringLimits = parseOfferingLimits(offering);
  return {
    resource,
    offering,
    plan,
    limitSerializer,
    usages,
    limits,
    offeringLimits,
    initialValues: { limits },
  };
}

export function calculateFreedCapacity(
  currentLimits: Limits,
  newLimits: Limits,
): Limits {
  const freed: Limits = {};
  Object.keys(currentLimits).forEach((key) => {
    const current = currentLimits[key] || 0;
    const newLimit = newLimits[key] || 0;
    const freedAmount = current - newLimit;
    if (freedAmount > 0) {
      freed[key] = freedAmount;
    }
  });
  return freed;
}
