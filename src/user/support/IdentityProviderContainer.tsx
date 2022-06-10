import React from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { UserDetails } from '@waldur/workspace/types';

import { IdentityProviderLogo } from './IdentityProviderLogo';

interface IdentityProviderContainerProps {
  user: UserDetails;
}

export const IdentityProviderContainer: React.FC<IdentityProviderContainerProps> =
  ({ user }) => (
    <Card className="user-edit mb-6">
      <Card.Header>{translate('Identity provider')}</Card.Header>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="symbol img-wrapper me-5">
              <IdentityProviderLogo name={user.registration_method} />
            </div>
            <div className="d-flex flex-column">
              <span className="text-gray-800 text-hover-primary fs-6 fw-bolder">
                {user.identity_provider_label}
              </span>
              <span className="text-gray-400 fw-bold">
                {translate('Identity provider')}
              </span>
            </div>
          </div>
          {user.identity_provider_management_url ? (
            <div>
              <a
                className="btn btn-secondary btn-sm"
                href={user.identity_provider_management_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa fa-pencil-square-o" /> {translate('Edit')}
              </a>
            </div>
          ) : null}
        </div>
      </Card.Body>
    </Card>
  );
