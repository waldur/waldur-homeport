import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row } from 'react-bootstrap';

import {
  EDUTEAMS_IDP,
  KEYCLOAK_IDP,
  LOCAL_IDP,
  SAML2_IDP,
  TARA_IDP,
} from '@waldur/auth/providers/constants';
import { ENV } from '@waldur/configs/default';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { getIdentityProviders } from '../api';

import { ProviderCard } from './ProviderCard';

export const IdentityProvidersList = () => {
  const { data, isLoading, error, refetch } = useQuery<
    {},
    {},
    Record<string, { is_active }>
  >(['IdentityProvidersList'], () =>
    getIdentityProviders().then((providers) =>
      providers.reduce(
        (result, item) => ({ ...result, [item.provider]: item }),
        {},
      ),
    ),
  );
  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred
      message={translate('Unable to load identity providers.')}
      loadData={refetch}
    />
  ) : data ? (
    <Card>
      <Card.Body>
        <Row>
          <Col xs={12} md={6} xl={4} className="mb-6">
            <ProviderCard
              title="Keycloak"
              description={translate(
                'Open source identity and access management solution.',
              )}
              provider={data.keycloak}
              type={KEYCLOAK_IDP}
              refetch={refetch}
            />
          </Col>
          <Col xs={12} md={6} xl={4} className="mb-6">
            <ProviderCard
              title="TARA"
              description={translate(
                'Identity service of the Republic of Estonia',
              )}
              provider={data.tara}
              type={TARA_IDP}
              refetch={refetch}
            />
          </Col>
          <Col xs={12} md={6} xl={4} className="mb-6">
            <ProviderCard
              title="eduTEAMS"
              description={translate(
                'Global federation of identity providers for researchers.',
              )}
              provider={data.eduteams}
              type={EDUTEAMS_IDP}
              refetch={refetch}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={6} xl={4} className="mb-6">
            <ProviderCard
              title={translate('Local identity provider')}
              description={translate(
                'Digital identity is managed by Waldur itself.',
              )}
              provider={{
                is_active:
                  ENV.plugins.WALDUR_CORE['AUTHENTICATION_METHODS'].includes(
                    'LOCAL_SIGNIN',
                  ),
              }}
              type={LOCAL_IDP}
              refetch={refetch}
              editable={false}
            />
          </Col>
          <Col xs={12} md={6} xl={4} className="mb-6">
            <ProviderCard
              title="SAML2"
              description={translate(
                'Single sign-on using SAML2-based identity federation.',
              )}
              provider={{
                is_active:
                  ENV.plugins.WALDUR_CORE['AUTHENTICATION_METHODS'].includes(
                    'SAML2',
                  ),
              }}
              type={SAML2_IDP}
              refetch={refetch}
              editable={false}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  ) : null;
};
