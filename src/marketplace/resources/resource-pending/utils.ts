import { Resource } from 'waldur-js-client';

export const hasResourceChangePlanRequest = (resource: Resource) => {
  if (
    !resource.order_in_progress ||
    resource.order_in_progress.type !== 'Update'
  ) {
    return false;
  }
  const order = resource.order_in_progress;
  return (
    order.new_plan_uuid &&
    order.old_plan_uuid &&
    order.new_plan_uuid !== order.old_plan_uuid
  );
};

export const hasResourceLimitChangeRequest = (resource: Resource) => {
  if (
    !resource.order_in_progress ||
    resource.order_in_progress.type !== 'Update'
  ) {
    return false;
  }
  const attributes = resource.order_in_progress.attributes as any;
  return resource.order_in_progress.limits && attributes.old_limits;
};
