const SELECT_SINGLE_VALUE_TYPES = [
  'select_string',
  'select_openstack_tenant',
  'select_openstack_instance',
];

const SELECT_MULTI_VALUE_TYPES = [
  'select_multiple_openstack_tenants',
  'select_multiple_openstack_instances',
];

export const serializer = (attributes, offering) => {
  const payload: any = {};
  if (attributes) {
    payload.name = attributes.name;
    payload.description = attributes.description;
  }
  if (offering.options.order) {
    offering.options.order.forEach((key) => {
      const options = offering.options.options[key];
      if (!options) {
        return;
      }
      if (!attributes.hasOwnProperty(key)) {
        return;
      }
      let value = attributes[key];
      if (SELECT_SINGLE_VALUE_TYPES.includes(options.type)) {
        if (value) {
          value = typeof value === 'object' ? value.value : value;
        }
      } else if (SELECT_MULTI_VALUE_TYPES.includes(options.type)) {
        if (value) {
          value = value.map((item) => item.value);
        }
      }
      payload[key] = value;
    });
  }
  return payload;
};
