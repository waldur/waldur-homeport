import { useQuery } from '@tanstack/react-query';
import { capitalize } from 'lodash-es';
import { Card, Col, Dropdown, Row } from 'react-bootstrap';
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

export const AdministrationServiceDesk = () => {
  const serviceDeskProviders = ['atlassian', 'zammad', 'smax'];
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['AdministrationServiceDesk'],
    queryFn: () => overrideSettingsRetrieve().then((response) => response.data),
  });

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred
      message={translate('Unable to load service desk configuration.')}
      loadData={refetch}
    />
  ) : data ? (
    <>
      <SettingsGroupCard group={INTEGRATION_SETTINGS} data={data} />

      <Card className="card-bordered mb-6">
        <Card.Body>
          <Row>
            {serviceDeskProviders.map((serviceDeskProvider, index) => (
              <Col key={index} xs={12} md={6} xl={4} className="mb-6">
                <ServiceDeskProviderCard
                  serviceDeskProvider={serviceDeskProvider}
                  initialValues={data}
                />
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {hasSupport() && <IssueStatusList />}
    </>
  ) : null;
};

const SettingsGroupCard = ({ group, data }) => {
  if (!group) return null;

  return (
    <FormTable.Card
      title={group.description}
      key={group.description}
      className="card-bordered mb-5"
    >
      <FormTable>
        {group.items.map((item) => (
          <FieldRow key={item.key} item={item} value={data[item.key]} />
        ))}
      </FormTable>
    </FormTable.Card>
  );
};
