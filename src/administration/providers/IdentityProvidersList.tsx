import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Card, Col, Nav, Row, Tab } from 'react-bootstrap';
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
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { SettingsDescription } from '@waldur/SettingsDescription';

import { getIdentityProviders } from '../api';
import { FieldRow } from '../settings/FieldRow';

import { ProviderCard } from './ProviderCard';

const IDENTITY_TABS = [
  {
    key: 'authentication',
    title: translate('Authentication'),
    groupName: translate('Authentication settings'),
  },
  {
    key: 'invitations',
    title: translate('Invitations'),
    groupName: translate('Invitation settings'),
  },
  {
    key: 'profile',
    title: translate('User profile'),
    groupName: translate('User profile settings'),
  },
  {
    key: 'privacy',
    title: translate('Data privacy'),
    groupName: translate('Data privacy settings'),
  },
  {
    key: 'api-auth',
    title: translate('API authentication'),
    groupName: translate('API token authentication'),
  },
  {
    key: 'providers',
    title: translate('Providers'),
    groupName: null, // Custom tab, not from SettingsDescription
  },
];

const SettingsTabContent = ({
  groupName,
  settingsData,
}: {
  groupName: string;
  settingsData: Record<string, unknown>;
}) => {
  const group = SettingsDescription.find((g) => g.description === groupName);
  if (!group) return null;

  return (
    <FormTable>
      {group.items.map((item) => (
        <FieldRow key={item.key} item={item} value={settingsData?.[item.key]} />
      ))}
    </FormTable>
  );
};

const ProvidersTabContent = ({
  providersData,
  settingsData,
  refetchProviders,
  refetchSettings,
}: {
  providersData: Record<string, IdentityProvider>;
  settingsData: Record<string, unknown>;
  refetchProviders: () => void;
  refetchSettings: () => void;
}) => (
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
        description={translate('Identity service of the Republic of Estonia')}
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
    <Col xs={12} md={6} xl={4} className="mb-6">
      <ProviderCard
        title={translate('Local identity provider')}
        description={translate('Digital identity is managed by Waldur itself.')}
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
            ENV.plugins.WALDUR_CORE['AUTHENTICATION_METHODS'].includes('SAML2'),
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
          is_active: settingsData['FREEIPA_ENABLED'] as boolean,
          ...(
            SettingsDescription.find((group) =>
              group.description.includes(SETTINGS_FREEIPA_GROUP_NAME),
            )?.items || []
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
);

export const IdentityProvidersList = () => {
  const [activeTab, setActiveTab] = useState('authentication');

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

  if (providersError || settingsError) {
    let errorMessage = '';
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

  if (!providersData || !settingsData) return null;

  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Identity & Authentication')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Tab.Container
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k as string)}
        >
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {IDENTITY_TABS.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key} className="cursor-pointer">
                  {tab.title}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <Tab.Content>
            {IDENTITY_TABS.map((tab) => (
              <Tab.Pane key={tab.key} eventKey={tab.key}>
                {tab.groupName ? (
                  <SettingsTabContent
                    groupName={tab.groupName}
                    settingsData={settingsData}
                  />
                ) : (
                  <ProvidersTabContent
                    providersData={providersData}
                    settingsData={settingsData}
                    refetchProviders={refetchProviders}
                    refetchSettings={refetchSettings}
                  />
                )}
              </Tab.Pane>
            ))}
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};
