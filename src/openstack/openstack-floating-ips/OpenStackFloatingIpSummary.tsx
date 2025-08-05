import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export const OpenStackFloatingIpSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  const Component = props.formTableItem ? FormTable.Item : Field;
  return (
    <>
      <Component label={translate('Address')} value={resource.address} />
      <Component
        label={translate('Runtime state')}
        value={resource.runtime_state}
      />
    </>
  );
};
