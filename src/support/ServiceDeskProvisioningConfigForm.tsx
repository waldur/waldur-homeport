import { FC } from 'react';

import { TextField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

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
