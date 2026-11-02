import { FC } from 'react';

import { PropertyItem } from 'waldur-ui';

import { ENV } from '@/core/config';
import { translate } from '@/i18n';
import { BaseCredentialsSection } from '@/marketplace/offerings/update/integration/BaseCredentialsSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';
import { SlurmOfferingActions } from '@/site-agent/SlurmOfferingActions';

export const SiteAgentCredentialsSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  return (
    <BaseCredentialsSection
      {...props}
      hideScopeState={!props.offering.scope_state}
      actions={<SlurmOfferingActions offering={props.offering} />}
    >
      <PropertyItem
        label={translate('Waldur API URL')}
        value={ENV.apiEndpoint}
        hasCopy
      />

      <PropertyItem
        label={translate('Offering UUID')}
        value={props.offering.uuid}
        hasCopy
      />
    </BaseCredentialsSection>
  );
};
