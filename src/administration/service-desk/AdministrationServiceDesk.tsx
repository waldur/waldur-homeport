import { useQuery } from '@tanstack/react-query';
import { capitalize } from 'lodash-es';
import { useMemo } from 'react';
import { Card, Col, Nav, Row, Tab } from 'react-bootstrap';
import { overrideSettingsRetrieve } from 'waldur-js-client';

import { ServiceDeskProviderLogo } from '@/administration/service-desk/ServiceDeskProviderLogo';
import { lazyComponent } from '@/core/lazyComponent';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import FormTable from '@/form/FormTable';
import { formatJsxTemplate, translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { useModal } from '@/modal/actions';
import { SettingsDescription } from '@/SettingsDescription';
import { ActionDropdownButton } from '@/table/ActionDropdownButton';
import { ActionsDropdownItem } from '@/table/ActionsDropdown';

import { FieldRow } from '../settings/FieldRow';
import { useSettingsUrlSync } from '../settings/useSettingsUrlSync';
import { SupportUsersList } from '../support-users/SupportUsersList';

import {
  getAtlassianAuthMethod,
  getAtlassianAuthMethodLabel,
  getAtlassianSiteName,
  getConfiguredValue,
} from './atlassianAuth';
import { IssueStatusList } from './issue-statuses';

const AdministrationServiceDeskUpdateDialog = lazyComponent(() =>
  import('./AdministrationServiceDeskUpdateDialog').then((module) => ({
    default: module.AdministrationServiceDeskUpdateDialog,
  })),
);

const AtlassianDiscoveryDialog = lazyComponent(() =>
  import('./atlassian-discovery/AtlassianDiscoveryDialog').then((module) => ({
    default: module.AtlassianDiscoveryDialog,
  })),
);

const INTEGRATION_SETTINGS = SettingsDescription.find(
  (group) =>
    group.description === translate('Service desk integration settings'),
);

// A provider counts as configured once its API URL is set; Atlassian also
// needs credentials, and its URL default is a placeholder.
const isProviderConfigured = (provider: string, settings) =>
  provider === 'atlassian'
    ? Boolean(
        getAtlassianAuthMethod(settings) &&
        getConfiguredValue(settings, 'ATLASSIAN_API_URL'),
      )
    : Boolean(settings[`${provider.toUpperCase()}_API_URL`]);

const AtlassianSummary = ({ settings }) => {
  const apiUrl = getConfiguredValue(settings, 'ATLASSIAN_API_URL') as string;
  return (
    <p className="fs-6 text-dark">
      {settings.ATLASSIAN_PROJECT_ID
        ? translate('{site}, service desk {project}', {
            site: getAtlassianSiteName(apiUrl),
            project: settings.ATLASSIAN_PROJECT_ID,
          })
        : getAtlassianSiteName(apiUrl)}
      <br />
      {getAtlassianAuthMethodLabel(getAtlassianAuthMethod(settings))}
    </p>
  );
};

const ServiceDeskProviderCard = ({ serviceDeskProvider, initialValues }) => {
  const { openDialog } = useModal();
  const isAtlassian = serviceDeskProvider === 'atlassian';
  const isConfigured = isProviderConfigured(serviceDeskProvider, initialValues);
  const isActive =
    Boolean(initialValues.WALDUR_SUPPORT_ENABLED) &&
    initialValues.WALDUR_SUPPORT_ACTIVE_BACKEND_TYPE === serviceDeskProvider;

  const openConfigure = () => {
    openDialog(AdministrationServiceDeskUpdateDialog, {
      size: 'lg',
      resolve: {
        initialValues,
        name: serviceDeskProvider,
      },
    });
  };

  const openDiscovery = () => {
    openDialog(AtlassianDiscoveryDialog, {
      size: 'xl',
      resolve: { settings: initialValues },
    });
  };

  // Same states, colours and wording as the identity provider cards. An
  // unconfigured desk is never shown as enabled, even when it is the default
  // active backend.
  const state = !isConfigured
    ? { variant: 'dark', title: translate('Not configured') }
    : isActive
      ? { variant: 'primary', title: translate('Enabled') }
      : { variant: 'warning', title: translate('Disabled') };

  return (
    // Cards in a row share its height; the menu sits at the bottom so the
    // buttons line up however long the description is.
    <Card className="bg-light min-h-150px h-100 border border-secondary border-hover">
      <Card.Body className="pe-5 d-flex">
        <div className="d-flex flex-grow-1">
          <div className="d-flex flex-row justify-content-between flex-grow-1">
            <div
              style={{
                width: 50,
                marginRight: 17,
              }}
            >
              <ServiceDeskProviderLogo name={serviceDeskProvider} />
            </div>
            <div className="flex-grow-1 d-flex flex-column">
              <h1 className="fs-2 text-nowrap fw-boldest">
                {capitalize(serviceDeskProvider)}
              </h1>
              {isAtlassian && isConfigured ? (
                <AtlassianSummary settings={initialValues} />
              ) : (
                <p className="fs-6 text-dark">
                  {translate(
                    '{supportServiceProvider} service desk.',
                    {
                      supportServiceProvider: capitalize(serviceDeskProvider),
                    },
                    formatJsxTemplate,
                  )}
                </p>
              )}
              <div className="mt-auto">
                <ActionDropdownButton
                  variant={state.variant}
                  title={state.title}
                >
                  {isAtlassian && !isConfigured && (
                    <ActionsDropdownItem onSelect={openDiscovery}>
                      {translate('Discovery wizard')}
                    </ActionsDropdownItem>
                  )}
                  <ActionsDropdownItem onSelect={openConfigure}>
                    {translate('Edit')}
                  </ActionsDropdownItem>
                  {isAtlassian && isConfigured && (
                    <ActionsDropdownItem onSelect={openDiscovery}>
                      {translate('Re-discover')}
                    </ActionsDropdownItem>
                  )}
                </ActionDropdownButton>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

const SERVICE_DESK_PROVIDERS = ['atlassian', 'zammad', 'smax'];

const ConfigurationTab = ({ data }) =>
  INTEGRATION_SETTINGS ? (
    <FormTable>
      {INTEGRATION_SETTINGS.items.map((item) => (
        <FieldRow key={item.key} item={item} value={data[item.key]} />
      ))}
    </FormTable>
  ) : null;

const CredentialsTab = ({ data }) => (
  <Row>
    {SERVICE_DESK_PROVIDERS.map((serviceDeskProvider) => (
      <Col key={serviceDeskProvider} xs={12} md={6} xl={4} className="mb-6">
        <ServiceDeskProviderCard
          serviceDeskProvider={serviceDeskProvider}
          initialValues={data}
        />
      </Col>
    ))}
  </Row>
);

export const AdministrationServiceDesk = () => {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AdministrationServiceDesk'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  // Issue statuses and support users only exist once a helpdesk is configured.
  const supportEnabled = hasSupport();
  const tabs = useMemo(
    () => [
      { key: 'configuration', title: translate('Configuration') },
      { key: 'credentials', title: translate('Credentials') },
      ...(supportEnabled
        ? [
            {
              key: 'issue-statuses',
              title: translate('Issue status mapping'),
            },
            { key: 'support-users', title: translate('Support users') },
          ]
        : []),
    ],
    [supportEnabled],
  );
  const { activeKey, handleSelect } = useSettingsUrlSync(tabs);

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred
      message={translate('Unable to load service desk configuration.')}
      loadData={refetch}
    />
  ) : data ? (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Service desk integration')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Tab.Container
          activeKey={activeKey}
          onSelect={handleSelect}
          unmountOnExit
        >
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
            {/* These two stay mounted across tab switches (unlike the rest of
                this container) so in-progress edits aren't lost when the user
                tabs away — hence the explicit override back to false. */}
            <Tab.Pane eventKey="configuration" unmountOnExit={false}>
              <ConfigurationTab data={data} />
            </Tab.Pane>
            <Tab.Pane eventKey="credentials" unmountOnExit={false}>
              <CredentialsTab data={data} />
            </Tab.Pane>
            {supportEnabled && (
              <Tab.Pane eventKey="issue-statuses">
                <IssueStatusList />
              </Tab.Pane>
            )}
            {supportEnabled && (
              <Tab.Pane eventKey="support-users">
                <SupportUsersList />
              </Tab.Pane>
            )}
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  ) : null;
};
