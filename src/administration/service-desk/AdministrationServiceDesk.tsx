import { Card, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { ENV } from '@waldur/configs/default';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { isStaffOrSupport as isStaffOrSupportSelector } from '@waldur/workspace/selectors';

const AdministrationServiceDeskUpdateDialogContainer = lazyComponent(
  () => import('./AdministrationServiceDeskUpdateDialog'),
  'AdministrationServiceDeskUpdateDialogContainer',
);

export const AdministrationServiceDesk = () => {
  const isStaffOrSupport = useSelector(isStaffOrSupportSelector);
  const WaldurLogo = require('@waldur/images/logo.svg');
  const dispatch = useDispatch();

  const updateServiceDeskSettings = () => {
    dispatch(
      openModalDialog(AdministrationServiceDeskUpdateDialogContainer, {
        size: 'lg',
      }),
    );
  };

  return (
    <Col md={6} className="mb-6">
      <Card className="bg-light min-h-150px border border-secondary border-hover">
        <Card.Body className="pe-5">
          <div className="d-flex align-items-center h-100">
            <div className="d-flex flex-row justify-content-between h-100 flex-grow-1">
              <div
                style={{
                  width: 50,
                  marginRight: 17,
                }}
              >
                <img src={WaldurLogo} style={{ width: '100%' }} />
              </div>
            </div>
            <div className="flex-grow-1">
              <h1 className="fs-2 text-nowrap fw-boldest">
                {translate('Waldur support')}
              </h1>
              <p className="fs-6 text-dark">
                {translate(
                  'Waldur support plugin allows integration with various service desk providers.',
                )}
              </p>
              <DropdownButton
                variant={ENV.plugins.WALDUR_SUPPORT ? 'primary' : 'warning'}
                title={
                  ENV.plugins.WALDUR_SUPPORT
                    ? translate('Enabled')
                    : translate('Disabled')
                }
              >
                {isStaffOrSupport && (
                  <Dropdown.Item onClick={updateServiceDeskSettings}>
                    {translate('Configure')}
                  </Dropdown.Item>
                )}
              </DropdownButton>
            </div>
          </div>
        </Card.Body>
      </Card>
    </Col>
  );
};
