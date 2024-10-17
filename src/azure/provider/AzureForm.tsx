import { get } from 'lodash';
import { FunctionComponent } from 'react';

import { isGuid, required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const defaultValidtors = [required, isGuid];

const fields = [
  {
    label: translate('Subscription ID'),
    key: 'service_attributes.subscription_id',
    description: translate('In the format of GUID'),
    component: StringField,
    fieldProps: { required: true, validate: defaultValidtors },
  },
  {
    label: translate('Tenant ID'),
    key: 'service_attributes.tenant_id',
    description: translate('In the format of GUID'),
    component: StringField,
    fieldProps: { required: true, validate: defaultValidtors },
  },
  {
    label: translate('Client ID'),
    key: 'service_attributes.client_id',
    description: translate('In the format of GUID'),
    component: StringField,
    fieldProps: { required: true, validate: defaultValidtors },
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
) =>
  fields.map((field) => (
    <FormTable.Item
      key={field.key}
      label={field.label}
      description={field.description}
      value={get(props.offering, field.key, 'N/A')}
      actions={
        <FieldEditButton
          title={props.title}
          scope={props.offering}
          name={field.key}
          callback={props.callback}
          fieldComponent={field.component}
          fieldProps={field.fieldProps}
        />
      }
    />
  ));
