import { FC } from 'react';

import { required } from '@/core/validators';
import {
  NumberEditField,
  SecretEditField,
  StringEditField,
} from '@/form/editFields';
import { translate } from '@/i18n';
import { BaseCredentialsSection } from '@/marketplace/offerings/update/integration/BaseCredentialsSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';

// The plugin stores RAM and disk maximums in MiB; providers read and enter
// them in GB, in the table as well as in the edit dialog. The conversion into
// MiB has to happen in `parse`: `format` alone would re-divide every keystroke.
const mibToGb = (value) => (value ? value / 1024 : null);

const sizeInGbProps = {
  unit: 'GB',
  format: (value) => mibToGb(value) ?? '',
  parse: (value) =>
    value === '' || value == null ? null : Math.round(Number(value) * 1024),
  renderValue: (value) => {
    const gb = mibToGb(value);
    return gb == null ? null : `${gb} GB`;
  },
};

export const VMwareCredentialsSection: FC<OfferingEditPanelProps> = (props) => {
  return (
    <BaseCredentialsSection {...props}>
      <StringEditField
        name="service_attributes.backend_url"
        label={translate('Hostname')}
        required
        validate={required}
      />
      <StringEditField
        name="service_attributes.username"
        label={translate('Username')}
        required
        validate={required}
      />
      <SecretEditField
        name="service_attributes.password"
        label={translate('Password')}
        required
        validate={required}
      />
      <StringEditField
        name="service_attributes.default_cluster_label"
        label={translate('Default cluster label')}
        required
        validate={required}
      />
      <NumberEditField
        name="service_attributes.max_cpu"
        label={translate('Maximum vCPU for each VM')}
      />
      <NumberEditField
        name="service_attributes.max_ram"
        label={translate('Maximum RAM for each VM')}
        {...sizeInGbProps}
      />
      <NumberEditField
        name="service_attributes.max_disk"
        label={translate('Maximum capacity for each disk')}
        {...sizeInGbProps}
      />
      <NumberEditField
        name="service_attributes.max_disk_total"
        label={translate('Maximum total size of the disk space per VM')}
        {...sizeInGbProps}
      />
    </BaseCredentialsSection>
  );
};
