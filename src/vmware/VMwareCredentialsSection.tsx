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
        unit="GB"
        format={(v) => (v ? v / 1024 : '')}
        normalize={(v) => Number(v) * 1024}
      />
      <NumberEditField
        name="service_attributes.max_disk"
        label={translate('Maximum capacity for each disk')}
        unit="GB"
        format={(v) => (v ? v / 1024 : '')}
        normalize={(v) => Number(v) * 1024}
      />
      <NumberEditField
        name="service_attributes.max_disk_total"
        label={translate('Maximum total size of the disk space per VM')}
        unit="GB"
        format={(v) => (v ? v / 1024 : '')}
        normalize={(v) => Number(v) * 1024}
      />
    </BaseCredentialsSection>
  );
};
