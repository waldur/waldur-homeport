import { FunctionComponent, useMemo } from 'react';

import { StringField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { DefaultOfferingEditPanel } from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';

import { OfferingEditPanelFormProps } from './offerings/update/integration/types';

export const UserSecretOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => {
  const fields = useMemo(
    () => [
      {
        label: translate('Shared user password'),
        key: 'secret_options.shared_user_password',
        component: StringField,
        description: translate(
          'If defined, will be set as a password for all offering users',
        ),
        disabled:
          !props.offering.plugin_options
            ?.service_provider_can_create_offering_user,
      },
    ],

    [props.offering.plugin_options],
  );
  return <DefaultOfferingEditPanel fields={fields} {...props} />;
};
