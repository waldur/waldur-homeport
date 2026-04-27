import { useQuery } from '@tanstack/react-query';
import { ReactNode, useMemo } from 'react';
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
} from '@/auth/providers/constants';
import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { UserFeatures } from '@/FeaturesEnums';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { SettingsDescription } from '@/SettingsDescription';

import { getIdentityProviders } from '../api';
import { FieldRow } from '../settings/FieldRow';
import { useSettingsUrlSync } from '../settings/useSettingsUrlSync';

import { IdentityBridgeTab } from './IdentityBridgeTab';
import { ProviderCard } from './ProviderCard';
import { ScimSyncButton } from './ScimSyncButton';

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
    key: 'scim',
    title: translate('SCIM'),
    groupName: translate('SCIM settings'),
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
  actions,
}: {
  groupName: string;
  settingsData: Record<string, unknown>;
  actions?: ReactNode;
}) => {
  const group = SettingsDescription.find((g) => g.description === groupName);
  if (!group) return null;

  if (actions) {
    return (
      <FormTable.Card
        title={groupName}
        actions={actions}
        className="card-bordered mb-5"
      >
        <FormTable>
          {group.items.map((item) => (
            <FieldRow
              key={item.key}
              item={item}
              value={settingsData?.[item.key]}
            />
          ))}
        </FormTable>
      </FormTable.Card>
    );
  }

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
        title="MyAccessID"
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
  const tabs = useMemo(() => {
    const result = [...IDENTITY_TABS];
    if (isFeatureVisible(UserFeatures.show_identity_bridge)) {
      result.push({
        key: 'identity-bridge',
        title: translate('Identity Bridge'),
        groupName: null,
      });
    }
    return result;
  }, []);

  const { activeKey, handleSelect } = useSettingsUrlSync(tabs);

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
        <Tab.Container activeKey={activeKey} onSelect={handleSelect}>
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {tabs.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key} className="cursor-pointer">
                  {tab.title}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <Tab.Content>
            {tabs.map((tab) => (
              <Tab.Pane key={tab.key} eventKey={tab.key}>
                {tab.key === 'identity-bridge' ? (
                  <>
                    <SettingsTabContent
                      groupName={translate('Identity Bridge')}
                      settingsData={settingsData}
                    />
                    <IdentityBridgeTab />
                  </>
                ) : tab.groupName ? (
                  <SettingsTabContent
                    groupName={tab.groupName}
                    settingsData={settingsData}
                    actions={
                      tab.key === 'scim' &&
                      settingsData?.['SCIM_MEMBERSHIP_SYNC_ENABLED'] ? (
                        <ScimSyncButton />
                      ) : undefined
                    }
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
