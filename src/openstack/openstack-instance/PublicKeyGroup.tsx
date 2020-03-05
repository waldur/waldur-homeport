import * as React from 'react';
import { Field } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { SelectDialogField } from '@waldur/form-react/SelectDialogField';
import { translate } from '@waldur/i18n';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

export const PublicKeyGroup = props => (
  <CreateResourceFormGroup label={translate('SSH public key')}>
    <Field
      name="attributes.ssh_public_key"
      component={fieldProps => (
        <SelectDialogField
          columns={[
            {
              label: translate('Name'),
              name: 'name',
            },
            {
              label: translate('Fingerprint'),
              name: 'fingerprint',
            },
          ]}
          choices={props.sshKeys}
          input={fieldProps.input}
          preSelectFirst={true}
          emptyMessage={
            <>
              {translate(`You have not added any SSH keys to your`)}{' '}
              <Link state="profile.keys">{translate('profile.')}</Link>
            </>
          }
        />
      )}
    />
  </CreateResourceFormGroup>
);
