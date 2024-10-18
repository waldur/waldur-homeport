import { get } from 'lodash';
import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { FieldEditButton } from '@waldur/marketplace/offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields = [
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

export const SlurmForm: FunctionComponent<OfferingEditPanelFormProps> = (
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

export const SlurmRemoteForm: FunctionComponent<OfferingEditPanelFormProps> = (
  props,
) => (
  <>
    <FormTable.Item
      label={translate('Waldur API URL')}
      value={
        <div className="d-flex align-items-center gap-2">
          {ENV.apiEndpoint}
          <CopyToClipboardButton value={ENV.apiEndpoint} />
        </div>
      }
    />
    <FormTable.Item
      label={translate('Offering UUID')}
      value={
        <div className="d-flex align-items-center gap-2">
          {props.offering.uuid}
          <CopyToClipboardButton value={props.offering.uuid} />
        </div>
      }
    />
  </>
);
