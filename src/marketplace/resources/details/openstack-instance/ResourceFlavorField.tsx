import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const ResourceFlavorField = ({ scope }) => {
  return <Field label={translate('Flavor')} value={scope.flavor_name} />;
};
