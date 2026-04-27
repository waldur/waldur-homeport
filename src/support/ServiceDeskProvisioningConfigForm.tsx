import { FC } from 'react';

import { TextField } from '@/form';
import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@/marketplace/offerings/update/integration/types';

const fields: OfferingEditField[] = [
  {
    label: translate('Confirmation notification template'),
    key: 'secret_options.template_confirmation_comment',
    component: TextField,
  },
  {
    label: translate('Enable issues for membership changes'),
    key: 'plugin_options.enable_issues_for_membership_changes',
    component: AwesomeCheckboxField,
    hideLabel: true,
  },
];

export const ServiceDeskProvisioningConfigForm: FC<
  OfferingEditPanelFormProps
> = (props) => {
  return <DefaultOfferingEditPanel fields={fields} {...props} />;
};
