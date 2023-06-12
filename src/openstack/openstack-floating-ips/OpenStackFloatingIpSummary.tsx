import { translate } from '@waldur/i18n';
import { Field, ResourceSummaryProps } from '@waldur/resource/summary';

export const OpenStackFloatingIpSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  return (
    <>
      <Field label={translate('Address')} value={resource.address} />
      <Field
        label={translate('Runtime state')}
        value={resource.runtime_state}
      />
    </>
  );
};
