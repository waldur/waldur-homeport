import { FC } from 'react';

import { BooleanEditField, TextEditField } from '@/form/editFields';
import { translate } from '@/i18n';
import { BaseProvisioningConfigSection } from '@/marketplace/offerings/update/integration/ProvisioningConfigSection';
import { OfferingEditPanelProps } from '@/marketplace/offerings/update/integration/types';

export const ServiceDeskProvisioningConfigForm: FC<OfferingEditPanelProps> = (
  props,
) => {
  return (
    <BaseProvisioningConfigSection {...props}>
      <TextEditField
        name="secret_options.template_confirmation_comment"
        label={translate('Confirmation notification template')}
      />
      <BooleanEditField
        name="plugin_options.enable_issues_for_membership_changes"
        label={translate('Enable issues for membership changes')}
        hideLabel
      />
    </BaseProvisioningConfigSection>
  );
};
