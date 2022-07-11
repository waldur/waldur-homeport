import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { IdentityProviderIndicator } from './IdentityProviderIndicator';

export const IdentityProviderContainer = ({ user }) => (
  <Card className="user-edit mb-6">
    <Card.Header>{translate('Identity provider')}</Card.Header>
    <Card.Body>
      <IdentityProviderIndicator user={user} />
    </Card.Body>
  </Card>
);
