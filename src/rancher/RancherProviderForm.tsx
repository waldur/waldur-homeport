import { get } from 'lodash';
import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { StringField, SecretField, TextField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { SecretField as PlainSecretField } from '@waldur/marketplace/common/SecretField';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields = [
  {
    label: translate('Rancher server URL'),
    key: 'service_attributes.backend_url',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Rancher access key'),
    key: 'service_attributes.username',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Rancher secret key'),
    key: 'service_attributes.password',
    component: SecretField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Base image name'),
    key: 'service_attributes.base_image_name',
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Cloud init template'),
    key: 'service_attributes.cloud_init_template',
    component: TextField,
  },
];

export const RancherProviderForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) =>
  fields.map((field) => (
    <FormTable.Item
      key={field.key}
      label={field.label}
      value={
        field.component === SecretField ? (
          <PlainSecretField value={get(props.offering, field.key)} />
        ) : (
          get(props.offering, field.key, 'N/A')
        )
      }
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
