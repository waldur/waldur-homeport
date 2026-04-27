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
