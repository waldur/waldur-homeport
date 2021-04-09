import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { Link } from '@waldur/core/Link';
import { SelectDialogField } from '@waldur/form/SelectDialogField';
import { formatJsx, translate } from '@waldur/i18n';

import { CreateResourceFormGroup } from '../CreateResourceFormGroup';

export const PublicKeyGroup: FunctionComponent<any> = (props) => (
  <CreateResourceFormGroup label={translate('SSH public key')}>
    <Field
      name="attributes.ssh_public_key"
      component={(fieldProps) => (
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
          emptyMessage={translate(
            'You have not added any SSH keys to your <Link>profile</Link>.',
            { Link: (s) => <Link state="profile.keys">{s}</Link> },
            formatJsx,
          )}
        />
      )}
    />
  </CreateResourceFormGroup>
);
