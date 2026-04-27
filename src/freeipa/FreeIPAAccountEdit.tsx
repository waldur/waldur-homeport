import React from 'react';
import { Form } from 'react-bootstrap';

import { FormContainer } from '@/form';
import { translate } from '@/i18n';

interface FreeIPAAccountEditOwnProps {
  profile: any;
  loading: boolean;
}

const UsernameGroup = ({ profile }) => (
  <div className=" mb-7">
    <Form.Label>{translate('Username')}</Form.Label>
    <Form.Control
      readOnly
      defaultValue={profile.username}
      className="form-control-solid"
    />
  </div>
);

export const FreeIPAAccountEdit: React.FC<FreeIPAAccountEditOwnProps> = ({
  profile,
  loading,
}) => {
  return (
    <FormContainer submitting={loading}>
      <UsernameGroup profile={profile} />
      <Form.Group>
        <div className="pull-right">
          {profile.is_active
            ? translate('Profile is enabled.')
            : translate('Profile is disabled.')}
        </div>
      </Form.Group>
    </FormContainer>
  );
};
