import {
  getOffering,
  getResource,
  getPlan,
} from '@waldur/marketplace/common/api';
import {
  getFormLimitSerializer,
  getFormLimitParser,
  LimitParser,
  Limits,
  filterOfferingComponents,
} from '@waldur/marketplace/common/registry';
import { parseOfferingLimits } from '@waldur/marketplace/offerings/store/limits';
import { OfferingLimits } from '@waldur/marketplace/offerings/store/types';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Offering, Plan } from '@waldur/marketplace/types';

export interface FetchedData {
  resource: OrderItemResponse;
  offering: Offering;
  plan: Plan;
  limitSerializer: LimitParser;
  usages: Limits;
  limits: Limits;
  initialValues: { limits: Limits };
  offeringLimits: OfferingLimits;
}

export async function loadData({ resource_uuid }): Promise<FetchedData> {
  const resource = await getResource(resource_uuid);
  const offering = await getOffering(resource.offering_uuid);
  const plan = await getPlan(resource.plan_uuid);
  const limitParser = getFormLimitParser(offering.type);
  const limitSerializer = getFormLimitSerializer(offering.type);
  const components = filterOfferingComponents(offering);
  const usages = limitParser(resource.current_usages);
  const resourceLimits = limitParser(resource.limits);
  const limits: Record<string, number> = components.reduce(
    (result, component) => ({
      ...result,
      [component.type]: resourceLimits[component.type],
    }),
    {},
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
