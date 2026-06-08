import { FC } from 'react';

import { ENV } from '@/core/config';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import FormTable from '@/form/FormTable';
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
      <FormTable.Item
        label={translate('Waldur API URL')}
        value={
          <div className="d-flex align-items-center gap-2">
            {ENV.apiEndpoint}
            <CopyToClipboardButton value={ENV.apiEndpoint} />
          </div>
        }
      />

      <FormTable.Item
        label={translate('Offering UUID')}
        value={
          <div className="d-flex align-items-center gap-2">
            {props.offering.uuid}
            <CopyToClipboardButton value={props.offering.uuid} />
          </div>
        }
      />
    </BaseCredentialsSection>
  );
};
