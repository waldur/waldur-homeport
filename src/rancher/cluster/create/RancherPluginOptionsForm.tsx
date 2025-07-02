import { FunctionComponent } from 'react';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { OfferingEditPanelFormProps } from '@waldur/marketplace/offerings/update/integration/types';

const fields: OfferingEditField[] = [
  {
    label: translate('Flavors regex'),
    key: 'plugin_options.flavors_regex',
    component: StringField,
    description: translate('Regular expression to limit flavors list'),
  },
];

export const RancherPluginOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => <DefaultOfferingEditPanel fields={fields} {...props} />;
