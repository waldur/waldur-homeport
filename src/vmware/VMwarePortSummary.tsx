import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

export const VMwarePortSummary = (props) => {
  const { resource } = props;
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component
        label={translate('MAC address')}
        value={resource.mac_address}
      />
      <Component label={translate('Network')} value={resource.network_name} />
    </>
  );
};
