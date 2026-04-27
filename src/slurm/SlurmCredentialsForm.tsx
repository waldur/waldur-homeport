import { FunctionComponent } from 'react';

import { required } from '@/core/validators';
import { StringField } from '@/form';
import { translate } from '@/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@/marketplace/offerings/update/integration/types';

const fields: OfferingEditField[] = [
  {
    label: translate('Hostname'),
    key: 'service_attributes.hostname',
    description: translate('Hostname or IP address of master node'),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Username'),
    key: 'service_attributes.username',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Port'),
    key: 'service_attributes.port',
    component: StringField,
  },
  {
    label: translate('Gateway'),
    key: 'service_attributes.gateway',
    description: translate('Hostname or IP address of gateway node'),
    component: StringField,
  },
  {
    label: translate('Use sudo'),
    key: 'service_attributes.use_sudo',
    description: translate('Set to true to activate privilege escalation'),
    component: StringField,
  },
  {
    label: translate('Default account'),
    key: 'service_attributes.default_account',
    description: translate('Default SLURM account for user'),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
];

export const SlurmCredentialsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => <DefaultOfferingEditPanel fields={fields} {...props} />;
