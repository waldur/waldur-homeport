import { FunctionComponent } from 'react';

import { isGuid, required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const GUID_FIELD: Partial<OfferingEditField> = {
  description: translate('In the format of GUID'),
  component: StringField,
  fieldProps: { required: true, validate: [required, isGuid] },
};

const fields: OfferingEditField[] = [
  {
    label: translate('Subscription ID'),
    key: 'service_attributes.subscription_id',
    ...GUID_FIELD,
  },
  {
    label: translate('Tenant ID'),
    key: 'service_attributes.tenant_id',
    ...GUID_FIELD,
  },
  {
    label: translate('Client ID'),
    key: 'service_attributes.client_id',
    ...GUID_FIELD,
  },
  {
    label: translate('Client secret'),
    key: 'service_attributes.client_secret',
    description: translate('Azure Active Directory Application Secret'),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
];

export const AzureForm: FunctionComponent<OfferingEditPanelFormProps> = (
  props,
) => <DefaultOfferingEditPanel fields={fields} {...props} />;
