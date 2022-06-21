import { translate } from '@waldur/i18n';
import {
  Field,
  ResourceSummaryProps,
  PureVirtualMachineSummary,
} from '@waldur/resource/summary';

export const DigitalOceanDropletSummary = (props: ResourceSummaryProps) => {
  const { resource } = props;
  return (
    <span>
      <PureVirtualMachineSummary {...props} />
      <Field label={translate('Region')} value={resource.region_name} />
    </span>
  );
};
