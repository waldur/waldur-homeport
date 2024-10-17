import { get } from 'lodash';
import { FunctionComponent } from 'react';

import { SecretField, StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { SecretField as PlainSecretField } from '@waldur/marketplace/common/SecretField';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields = [
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
        />
      }
    />
  ));
