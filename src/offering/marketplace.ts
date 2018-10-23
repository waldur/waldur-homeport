import { translate } from '@waldur/i18n';
import { registerOfferingType } from '@waldur/marketplace/common/registry';
import { OfferingConfigurationDetails } from '@waldur/offering/OfferingConfigurationDetails';
import { OfferingConfigurationForm } from '@waldur/offering/OfferingConfigurationForm';

const serializer = (attributes, offering) => {
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

registerOfferingType({
  type: 'Support.OfferingTemplate',
  get label() {
    return translate('Request-based item');
  },
  component: OfferingConfigurationForm,
  detailsComponent: OfferingConfigurationDetails,
  serializer,
  showOptions: true,
  showComponents: true,
});
