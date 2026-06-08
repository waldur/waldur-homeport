import { FC } from 'react';

import { required } from '@/core/validators';
import { NumberEditField, StringEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import { BaseCredentialsSection } from '@/marketplace/offerings/update/integration/BaseCredentialsSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';

export const OpenPortalRemoteCredentialsSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  return (
    <BaseCredentialsSection {...props}>
      <StringEditField
        name="service_attributes.instance_name"
        label={translate('Instance name')}
        description={translate(
          'Full path name to the OpenPortal Remote Agent that manages this instance',
        )}
        required
        validate={required}
      />
      <StringEditField
        name="service_attributes.project_template"
        label={translate('Project template')}
        description={translate(
          'Name of the OpenPortal Remote Project Template in which remote projects will be created',
        )}
        required
        validate={required}
      />
      <StringEditField
        name="service_attributes.allocation_unit"
        label={translate('Allocation units')}
        description={translate(
          'The unit of allocation for this instance, e.g. NHR',
        )}
        validate={required}
      />
      <NumberEditField
        name="service_attributes.default_allocation"
        label={translate('Default allocation')}
        description={translate(
          'Default allocation in the above allocation units for projects using this resource. Leave empty for no default allocation.',
        )}
        validate={required}
      />
      <NumberEditField
        name="service_attributes.max_allocation"
        label={translate('Maximum allocation')}
        description={translate(
          'Maximum allocation in the above allocation units for projects using this resource. Leave empty for no maximum allocation.',
        )}
        validate={required}
      />
    </BaseCredentialsSection>
  );
};
