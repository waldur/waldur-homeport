import { getOffering, getResource, getPlan } from '@waldur/marketplace/common/api';
import { OrderItemResponse } from '@waldur/marketplace/orders/types';
import { Offering, Plan } from '@waldur/marketplace/types';

export interface FetchedData {
  resource: OrderItemResponse;
  offering: Offering;
  plan: Plan;
}

export async function loadData({ resource_uuid }): Promise<FetchedData> {
  const resource = await getResource(resource_uuid);
  const offering = await getOffering(resource.offering_uuid);
  const plan = await getPlan(resource.plan_uuid);
  return {
    resource,
    offering,
    plan,
  };
}
