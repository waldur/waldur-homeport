import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

export const VMwarePortSummary = (props) => {
  const { resource } = props;
  return (
    <>
      <Field label={translate('MAC address')} value={resource.mac_address} />
      <Field label={translate('Network')} value={resource.network_name} />
    </>
  );
};
