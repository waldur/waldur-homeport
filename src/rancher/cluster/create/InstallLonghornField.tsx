import { ExternalLink } from '@/core/ExternalLink';
import { BooleanGroup } from '@/form';
import { translate } from '@/i18n';

export const InstallLonghornField = () => (
  <BooleanGroup
    name="attributes.install_longhorn"
    hideLabel={true}
    description={
      <ExternalLink
        label={translate(
          'Longhorn is a lightweight, reliable, and powerful distributed block storage system for Kubernetes.',
        )}
        url="https://longhorn.io/docs/"
      />
    }
    label={translate('Deploy Longhorn block storage after cluster is deployed')}
  />
);
