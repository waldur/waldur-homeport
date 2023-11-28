import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const ResourceFloatingIpField = ({ scope }) => {
  return (
    <Field
      label={translate('Floating IP')}
      value={scope.floating_ips.map((item) => item.address).join(', ')}
      hasCopy
    />
  );
};
