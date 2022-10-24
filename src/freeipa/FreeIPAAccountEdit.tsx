import React from 'react';
import { Form } from 'react-bootstrap';

import { FormContainer } from '@waldur/form';
import { translate } from '@waldur/i18n';

import { SyncProfile } from './SyncProfile';

interface FreeIPAAccountEditOwnProps {
  profile: any;
  refreshProfile(): void;
}

const UsernameGroup = ({ profile }) => (
  <div className="form-floating mb-7">
    <Form.Control
      readOnly
      defaultValue={profile.username}
      className="form-control-solid"
    />
    <Form.Label>{translate('Username')}</Form.Label>
  </div>
);

export const FreeIPAAccountEdit: React.FC<FreeIPAAccountEditOwnProps> = ({
  profile,
  refreshProfile,
}) => {
  const [loading, setLoading] = React.useState<boolean>();
  return (
    <FormContainer submitting={loading} floating={true}>
      <UsernameGroup profile={profile} />
      <Form.Group>
        <div className="pull-right">
          {profile.is_active
            ? translate('Profile is enabled.')
            : translate('Profile is disabled.')}
          <SyncProfile
            profile={profile}
            setLoading={setLoading}
            refreshProfile={refreshProfile}
          />
        </div>
      </Form.Group>
    </FormContainer>
  );
};
