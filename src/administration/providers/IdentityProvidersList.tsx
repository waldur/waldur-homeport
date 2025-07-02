import { useQuery } from '@tanstack/react-query';
import { Card, Col, Row } from 'react-bootstrap';
import { IdentityProvider, overrideSettingsRetrieve } from 'waldur-js-client';

import {
  EDUTEAMS_IDP,
  FREEIPA_IDP,
  KEYCLOAK_IDP,
  LOCAL_IDP,
  SAML2_IDP,
  SETTINGS_FREEIPA_GROUP_NAME,
  TARA_IDP,
} from '@waldur/auth/providers/constants';
import { ENV } from '@waldur/core/config';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { SettingsDescription } from '@waldur/SettingsDescription';

import { getIdentityProviders } from '../api';
import { SettingsCard } from '../settings/SettingsCard';

import { ProviderCard } from './ProviderCard';

export const IdentityProvidersList = () => {
  const {
    data: providersData,
    isLoading: isProvidersLoading,
    error: providersError,
    refetch: refetchProviders,
  } = useQuery<{}, {}, Record<string, IdentityProvider>>({
    queryKey: ['IdentityProvidersList'],

    queryFn: () =>
      getIdentityProviders().then((providers) =>
        providers.reduce(
          (result, item) => ({ ...result, [item.provider]: item }),
          {},
        ),
      ),
  });
  const {
    data: settingsData,
    isLoading: isSettingsLoading,
    error: settingsError,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['AdministrationUserSettings'],

    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });
  if (isProvidersLoading || isSettingsLoading) return <LoadingSpinner />;
  let errorMessage = '';
  if (providersError || settingsError) {
    if (providersError && settingsError) {
      errorMessage = translate(
        'Unable to load providers and settings configuration.',
      );
    } else if (providersError) {
      errorMessage = translate('Unable to load providers configuration.');
    } else {
      errorMessage = translate('Unable to load settings configuration.');
    }

    return (
      <LoadingErred
        message={errorMessage}
        loadData={() => {
          refetchProviders();
          refetchSettings();
        }}
      />
    );
  }
  return providersData && settingsData ? (
    <>
      <SettingsCard
        groupNames={[translate('User settings')]}
        settingsSource={settingsData}
      />

      <Card className="card-bordered">
        <Card.Body>
          <Row>
            <Col xs={12} md={6} xl={4} className="mb-6">
              <ProviderCard
                title="Keycloak"
                description={translate(
                  'Open source identity and access management solution.',
                )}
                provider={providersData.keycloak}
                type={KEYCLOAK_IDP}
                refetch={refetchProviders}
              />
            </Col>
            <Col xs={12} md={6} xl={4} className="mb-6">
              <ProviderCard
                title="TARA"
                description={translate(
                  'Identity service of the Republic of Estonia',
                )}
                provider={providersData.tara}
                type={TARA_IDP}
                refetch={refetchProviders}
              />
            </Col>
            <Col xs={12} md={6} xl={4} className="mb-6">
              <ProviderCard
                title="eduTEAMS"
                description={translate(
                  'Global federation of identity providers for researchers.',
                )}
                provider={providersData.eduteams}
                type={EDUTEAMS_IDP}
                refetch={refetchProviders}
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
                refetch={refetchProviders}
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
                refetch={refetchProviders}
                editable={false}
              />
            </Col>
            <Col xs={12} md={6} xl={4} className="mb-6">
              <ProviderCard
                title="FreeIPA"
                description={translate(
                  'FreeIPA is an integrated security information management solution.',
                )}
                provider={{
                  is_active: settingsData['FREEIPA_ENABLED'],
                  ...(
                    SettingsDescription.find((group) =>
                      group.description.includes(SETTINGS_FREEIPA_GROUP_NAME),
                    ).items || []
                  ).reduce(
                    (acc, item) =>
                      Object.assign(acc, {
                        [item.key]: settingsData[item.key] ?? item.default,
                      }),
                    {},
                  ),
                }}
                type={FREEIPA_IDP}
                refetch={refetchSettings}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </>
  ) : null;
};
