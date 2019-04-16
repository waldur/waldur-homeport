export function getItemName(item) {
  if (item.details) {
    // eslint-disable-next-line no-unused-vars
    const {offering_name, offering_type, plan_name, offering_component_name} = item.details;
    if (offering_name && offering_type && plan_name && offering_component_name) {
      return `${offering_name} - ${offering_component_name} - (${offering_type} / ${plan_name})`;
    }
  }
  return item.name;
}
