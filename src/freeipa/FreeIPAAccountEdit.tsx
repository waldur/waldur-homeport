import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { SyncProfile } from './SyncProfile';

interface FreeIPAAccountEditOwnProps {
  profile: any;
  refreshProfile(): void;
}

const UsernameGroup = ({ profile }) => (
  <Form.Group className="m-b-n">
    <Form.Label className="col-sm-3">{translate('Username')}:</Form.Label>
    <div className="col-sm-6 mb-2">
      <p>{profile.username}</p>
    </div>
  </Form.Group>
);

export const FreeIPAAccountEdit: React.FC<FreeIPAAccountEditOwnProps> = ({
  profile,
  refreshProfile,
}) => {
  const [loading, setLoading] = React.useState<boolean>();
  return (
    <Row disabled={loading}>
      <UsernameGroup profile={profile} />
      <Form.Group>
        <Col sm={{ span: 5, offset: 3 }}>
          <SyncProfile
            profile={profile}
            setLoading={setLoading}
            refreshProfile={refreshProfile}
          />
          {profile.is_active
            ? translate('Profile is enabled.')
            : translate('Profile is disabled.')}
        </Col>
      </Form.Group>
    </Row>
  );
};
