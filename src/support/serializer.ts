const SELECT_SINGLE_VALUE_TYPES = [
  'select_string',
  'select_openstack_tenant',
  'select_openstack_instance',
];

const SELECT_MULTI_VALUE_TYPES = [
  'select_multiple_openstack_tenants',
  'select_multiple_openstack_instances',
];

// OpenStack tenant/instance async selects store the whole option object; the
// backend expects the backend_id string. Fall back to `value` for any legacy
// {value,label} shape and pass primitives through unchanged.
const toBackendId = (value) =>
  value && typeof value === 'object'
    ? (value.backend_id ?? value.value)
    : value;

export const serializer = (attributes, offering) => {
  const payload: any = {};
  if (attributes) {
    payload.name = attributes.name;
    payload.description = attributes.description;
    payload.end_date = attributes.end_date;
  }
  if (offering.options.order) {
    offering.options.order.forEach((key) => {
      const options = offering.options.options[key];
      if (!options) {
        return;
      }
      if (!Object.prototype.hasOwnProperty.call(attributes, key)) {
        return;
      }
      let value = attributes[key];
      if (SELECT_SINGLE_VALUE_TYPES.includes(options.type)) {
        if (value) {
          value = toBackendId(value);
        }
      } else if (SELECT_MULTI_VALUE_TYPES.includes(options.type)) {
        if (value) {
          value = value.map(toBackendId);
        }
      }
      payload[key] = value;
    });
  }
  return payload;
};
