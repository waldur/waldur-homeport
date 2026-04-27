import { FunctionComponent } from 'react';

import { SecretField, StringField } from '@/form';
import { translate } from '@/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@/marketplace/offerings/update/integration/types';

const fields: OfferingEditField[] = [
  {
    label: translate('API URL'),
    key: 'secret_options.api_url',
    component: StringField,
  },
  {
    label: translate('Token'),
    key: 'secret_options.token',
    component: SecretField,
  },
  {
    label: translate('Organization UUID'),
    key: 'secret_options.customer_uuid',
    component: StringField,
  },
];

export const RemoteOfferingSecretOptions: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => <DefaultOfferingEditPanel fields={fields} {...props} />;
