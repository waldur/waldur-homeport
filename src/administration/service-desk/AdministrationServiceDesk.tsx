import { capitalize } from 'lodash';
import { Card, Col, Dropdown, DropdownButton, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { ServiceDeskProviderLogo } from '@waldur/administration/service-desk/ServiceDeskProviderLogo';
import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { isStaffOrSupport as isStaffOrSupportSelector } from '@waldur/workspace/selectors';

import { getDBSettings, saveConfig } from '../settings/api';

const AdministrationServiceDeskUpdateDialog = lazyComponent(
  () => import('./AdministrationServiceDeskUpdateDialog'),
  'AdministrationServiceDeskUpdateDialog',
);

export const AdministrationServiceDesk = () => {
  const isStaffOrSupport = useSelector(isStaffOrSupportSelector);
  const dispatch = useDispatch();
  const serviceDeskProviders = ['atlassian', 'zammad', 'smax'];

  const updateServiceDeskSettings = async (serviceDeskProvider) => {
    try {
      const initialPluginValues = await getDBSettings();
      dispatch(
        openModalDialog(AdministrationServiceDeskUpdateDialog, {
          size: 'lg',
          initialValues: initialPluginValues.data,
          name: serviceDeskProvider,
        }),
      );
    } catch (e) {
      return;
    }
  };

  const toggleServiceDeskBackend = async (serviceDeskProvider) => {
    let isEnableAction = false;
    if (
      serviceDeskProvider === ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE
    ) {
      serviceDeskProvider = '';
    } else {
      isEnableAction = true;
    }
    if (isEnableAction) {
      try {
        await waitForConfirmation(
          dispatch,
          translate('Confirmation'),
          translate(
            'Are you sure you want to enable {serviceDesk}? This will disable all the other service desks.',
            {
              serviceDesk: serviceDeskProvider,
            },
          ),
        );
      } catch {
        return;
      }
    }
    try {
      await saveConfig({
        WALDUR_SUPPORT_ACTIVE_BACKEND_TYPE: serviceDeskProvider,
      });
      dispatch(showSuccess('Configurations have been updated'));
      location.reload();
    } catch (e) {
      dispatch(
        showErrorResponse(e, translate('Unable to update the configurations.')),
      );
    }
  };

  return (
    <Card>
      <Card.Body>
        <Row>
          {serviceDeskProviders.map((serviceDeskProvider, index) => (
            <Col key={index} xs={12} md={6} xl={4} className="mb-6">
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
                            supportServiceProvider:
                              capitalize(serviceDeskProvider),
                          },
                          formatJsxTemplate,
                        )}
                      </p>
                      <DropdownButton
                        variant={
                          ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE ===
                          serviceDeskProvider
                            ? 'primary'
                            : 'warning'
                        }
                        title={
                          ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE ===
                          serviceDeskProvider
                            ? translate('Enabled')
                            : translate('Disabled')
                        }
                      >
                        {isStaffOrSupport && (
                          <Dropdown.Item
                            onClick={() =>
                              updateServiceDeskSettings(serviceDeskProvider)
                            }
                          >
                            {translate('Configure')}
                          </Dropdown.Item>
                        )}
                        {isStaffOrSupport && (
                          <Dropdown.Item
                            onClick={() =>
                              toggleServiceDeskBackend(serviceDeskProvider)
                            }
                          >
                            {ENV.plugins.WALDUR_SUPPORT.ACTIVE_BACKEND_TYPE ===
                            serviceDeskProvider
                              ? translate('Disable')
                              : translate('Enable')}
                          </Dropdown.Item>
                        )}
                      </DropdownButton>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
};
