import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { StringField, NumberField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields: OfferingEditField[] = [
  {
    label: translate('Instance name'),
    key: 'service_attributes.instance_name',
    description: translate(
      'Full path name to the OpenPortal Remote Agent that manages this instance',
    ),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Project template'),
    key: 'service_attributes.project_template',
    description: translate(
      'Name of the OpenPortal Remote Project Template in which remote projects will be created',
    ),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
  {
    label: translate('Allocation units'),
    key: 'service_attributes.allocation_unit',
    description: translate(
      'The unit of allocation for this instance, e.g. NHR',
    ),
    component: StringField,
    fieldProps: { required: false, validate: required },
  },
  {
    label: translate('Default allocation'),
    key: 'service_attributes.default_allocation',
    description: translate(
      'Default allocation in the above allocation units for projects using this resource. Leave empty for no default allocation.',
    ),
    component: NumberField,
    fieldProps: { required: false, validate: required },
  },
  {
    label: translate('Maximum allocation'),
    key: 'service_attributes.max_allocation',
    description: translate(
      'Maximum allocation in the above allocation units for projects using this resource. Leave empty for no maximum allocation.',
    ),
    component: NumberField,
    fieldProps: { required: false, validate: required },
  },
];

export const OpenPortalRemoteCredentialsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => <DefaultOfferingEditPanel fields={fields} {...props} />;
