import { FunctionComponent } from 'react';

import { required } from '@waldur/core/validators';
import { StringField } from '@waldur/form';
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
      'Full path name to the OpenPortal Agent that manages this instance',
    ),
    component: StringField,
    fieldProps: { required: true, validate: required },
  },
];

export const OpenPortalCredentialsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => <DefaultOfferingEditPanel fields={fields} {...props} />;
