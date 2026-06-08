import { FC } from 'react';

import { required } from '@/core/validators';
import { StringEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import { BaseCredentialsSection } from '@/marketplace/offerings/update/integration/BaseCredentialsSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';

export const OpenPortalCredentialsSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  return (
    <BaseCredentialsSection {...props}>
      <StringEditField
        name="service_attributes.instance_name"
        label={translate('Instance name')}
        description={translate(
          'Full path name to the OpenPortal Agent that manages this instance',
        )}
        required
        validate={required}
      />
    </BaseCredentialsSection>
  );
};
