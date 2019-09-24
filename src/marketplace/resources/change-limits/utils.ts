import { getOffering, getResource, getPlan } from '@waldur/marketplace/common/api';
import { getFormLimitSerializer, getFormLimitParser, LimitParser, Limits } from '@waldur/marketplace/common/registry';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Offering, Plan } from '@waldur/marketplace/types';

export interface FetchedData {
  resource: OrderItemResponse;
  offering: Offering;
  plan: Plan;
  limitSerializer: LimitParser;
  usages: Limits;
  limits: Limits;
  initialValues: {limits: Limits};
}

export async function loadData({ resource_uuid }): Promise<FetchedData> {
  const resource = await getResource(resource_uuid);
  const offering = await getOffering(resource.offering_uuid);
  const plan = await getPlan(resource.plan_uuid);
  const limitParser = getFormLimitParser(offering.type);
  const limitSerializer = getFormLimitSerializer(offering.type);
  const usages = limitParser(resource.current_usages);
  const limits = limitParser(resource.limits);
  return {
    resource,
    offering,
    plan,
    limitSerializer,
    usages,
    limits,
    initialValues: {limits},
  };
}
