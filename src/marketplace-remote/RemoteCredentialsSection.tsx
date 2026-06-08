import { FC } from 'react';

import { StringEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import { BaseCredentialsSection } from '@/marketplace/offerings/update/integration/BaseCredentialsSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';

export const RemoteCredentialsSection: FC<OfferingEditPanelProps> = (props) => {
  return (
    <BaseCredentialsSection {...props}>
      <StringEditField name="backend_id" label={translate('Backend ID')} />
    </BaseCredentialsSection>
  );
};
