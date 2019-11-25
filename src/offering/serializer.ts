export const serializer = (attributes, offering) => {
  const payload: any = {};
  if (attributes) {
    payload.name = attributes.name;
    payload.description = attributes.description;
  }
  if (offering.options.order) {
    offering.options.order.forEach(key => {
      const options = offering.options.options[key];
      if (!options) {
        return;
      }
      if (!attributes.hasOwnProperty(key)) {
        return;
      }
      let value = attributes[key];
      if (options.type === 'select_string') {
        if (value) {
          value = value.value;
        }
      }
      payload[key] = value;
    });
  }
  return payload;
};
