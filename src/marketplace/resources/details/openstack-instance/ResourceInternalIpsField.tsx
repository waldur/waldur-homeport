import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const ResourceInternalIpsField = ({ scope }) => {
  return (
    <Field
      label={translate('Internal IPs')}
      value={scope.internal_ips.join(', ')}
      hasCopy
    />
  );
};
