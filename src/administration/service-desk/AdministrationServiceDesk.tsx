import { useQuery } from '@tanstack/react-query';
import { capitalize } from 'lodash-es';
import { useMemo } from 'react';
import { Card, Col, Dropdown, Nav, Row, Tab } from 'react-bootstrap';
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

import { FieldRow } from '../settings/FieldRow';
import { useSettingsUrlSync } from '../settings/useSettingsUrlSync';
import { SupportUsersList } from '../support-users/SupportUsersList';

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

const ServiceDeskProviderCard = ({ serviceDeskProvider, initialValues }) => {
  const { openDialog } = useModal();

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
    });
  };

  return (
    <Card className="card-bordered min-h-150px">
      <Card.Body className="pe-5">
        <div className="d-flex align-items-center h-100">
          <div className="d-flex flex-row justify-content-between h-100 flex-grow-1">
            <div
              style={{
                width: 70,
                marginRight: 17,
              }}
            >
              <ServiceDeskProviderLogo name={serviceDeskProvider} />
            </div>
          </div>
          <div className="flex-grow-1">
            <h1 className="fs-2 text-nowrap fw-boldest">
              {capitalize(serviceDeskProvider)}
            </h1>
            <p className="fs-6 text-dark">
              {translate(
                '{supportServiceProvider} service desk.',
                {
                  supportServiceProvider: capitalize(serviceDeskProvider),
                },
                formatJsxTemplate,
              )}
            </p>
            <ActionDropdownButton
              variant="primary"
              title={translate('Actions')}
            >
              <Dropdown.Item onClick={openConfigure}>
                {translate('Configure')}
              </Dropdown.Item>
              {serviceDeskProvider === 'atlassian' && (
                <Dropdown.Item onClick={openDiscovery}>
                  {translate('Discovery')}
                </Dropdown.Item>
              )}
            </ActionDropdownButton>
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
            <Tab.Pane eventKey="configuration">
              <ConfigurationTab data={data} />
            </Tab.Pane>
            <Tab.Pane eventKey="credentials">
              <CredentialsTab data={data} />
            </Tab.Pane>
            {supportEnabled && (
              <Tab.Pane eventKey="issue-statuses" unmountOnExit={true}>
                <IssueStatusList />
              </Tab.Pane>
            )}
            {supportEnabled && (
              <Tab.Pane eventKey="support-users" unmountOnExit={true}>
                <SupportUsersList />
              </Tab.Pane>
            )}
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  ) : null;
};
