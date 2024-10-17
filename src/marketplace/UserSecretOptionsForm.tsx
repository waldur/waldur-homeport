import { FunctionComponent } from 'react';

import { formatYesNo } from '@waldur/core/utils';
import { StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';

import { FieldEditButton } from './offerings/update/integration/FieldEditButton';
import { OfferingEditPanelFormProps } from './offerings/update/integration/types';

const FIELD_PREFIX = 'secret_options.';

export const UserSecretOptionsForm: FunctionComponent<
  OfferingEditPanelFormProps
> = (props) => {
  const canCreateUser =
    props.offering.secret_options?.service_provider_can_create_offering_user;

  return (
    <>
      <FormTable.Item
        label={translate('Service provider can create offering user')}
        value={formatYesNo(
          props.offering.secret_options
            ?.service_provider_can_create_offering_user,
        )}
        actions={
          <FieldEditButton
            title={props.title}
            scope={props.offering}
            name={FIELD_PREFIX + 'service_provider_can_create_offering_user'}
            callback={props.callback}
            fieldComponent={AwesomeCheckboxField}
            hideLabel
          />
        }
      />
      <FormTable.Item
        label={translate('Shared user password')}
        value={props.offering.secret_options?.shared_user_password || 'N/A'}
        description={translate(
          'If defined, will be set as a password for all offering users',
        )}
        disabled={!canCreateUser}
        actions={
          <FieldEditButton
            title={props.title}
            scope={props.offering}
            name={FIELD_PREFIX + 'shared_user_password'}
            callback={props.callback}
            fieldComponent={StringField}
          />
        }
      />
    </>
  );
};
