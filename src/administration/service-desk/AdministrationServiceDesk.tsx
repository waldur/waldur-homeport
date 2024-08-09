import { useQuery } from '@tanstack/react-query';
import { capitalize } from 'lodash';
import { Button, Card, Col, Row, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { ServiceDeskProviderLogo } from '@waldur/administration/service-desk/ServiceDeskProviderLogo';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import FormTable from '@waldur/form/FormTable';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { SettingsDescription } from '@waldur/SettingsDescription';

import { getDBSettings } from '../settings/api';
import { FieldRow } from '../settings/FieldRow';

const AdministrationServiceDeskUpdateDialog = lazyComponent(
  () => import('./AdministrationServiceDeskUpdateDialog'),
  'AdministrationServiceDeskUpdateDialog',
);

const INTEGRATION_SETTINGS = SettingsDescription.find(
  (group) =>
    group.description === translate('Service desk integration settings'),
);

const ServiceDeskProviderCard = ({ serviceDeskProvider, initialValues }) => {
  const dispatch = useDispatch();

  return (
    <Card className="bg-light min-h-150px border border-secondary border-hover">
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
              {translate(capitalize(serviceDeskProvider))}
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
            <Button
              onClick={() =>
                dispatch(
                  openModalDialog(AdministrationServiceDeskUpdateDialog, {
                    size: 'lg',
                    initialValues,
                    name: serviceDeskProvider,
                  }),
                )
              }
            >
              {translate('Configure')}
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export const AdministrationServiceDesk = () => {
  const serviceDeskProviders = ['atlassian', 'zammad', 'smax'];
  const { data, error, isLoading, refetch } = useQuery(
    ['AdministrationServiceDesk'],
    () => getDBSettings().then((response) => response.data),
  );

  return isLoading ? (
    <LoadingSpinner />
  ) : error ? (
    <LoadingErred
      message={translate('Unable to load service desk configuration.')}
      loadData={refetch}
    />
  ) : data ? (
    <>
      <FormTable.Card
        title={INTEGRATION_SETTINGS.description}
        key={INTEGRATION_SETTINGS.description}
        className="card-bordered mb-3"
      >
        <Table bordered={true} responsive={true} className="form-table">
          {INTEGRATION_SETTINGS.items.map((item) => (
            <FieldRow item={item} key={item.key} value={data[item.key]} />
          ))}
        </Table>
      </FormTable.Card>
      <Card>
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
    </>
  ) : null;
};
