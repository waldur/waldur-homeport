import { useRouter } from '@uirouter/react';
import { useState, FunctionComponent } from 'react';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalSubtitle } from '@waldur/modal/ModalSubtitle';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import './SelectWorkspaceDialog.scss';
import { getCustomersCount } from './api';
import { EmptyOrganizationsPlaceholder } from './EmptyOrganizationsPlaceholder';
import { OrganizationsSelector } from './OrganizationsSelector';
import { ProjectsPanel } from './ProjectsPanel';

export const SelectWorkspaceDialog: FunctionComponent = () => {
  const currentCustomer = useSelector(getCustomer);
  const [selectedOrganization, selectOrganization] =
    useState<Customer>(currentCustomer);

  const router = useRouter();

  const {
    loading,
    error,
    value: organizationsCount,
  } = useAsync(getCustomersCount);

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <h2>{translate('Unable to load data')}</h2>
  ) : (
    <>
      {organizationsCount !== 0 && (
        <Modal.Header>
          <Modal.Title>{translate('Project selector')}</Modal.Title>
          <ModalSubtitle>{translate('Select project scope')}</ModalSubtitle>
        </Modal.Header>
      )}
      <Modal.Body>
        <>
          <Row className="mb-8">
            <Col className="workspace-listing" xs={12}>
              <OrganizationsSelector
                selectedOrganization={selectedOrganization}
                selectOrganization={selectOrganization}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              {organizationsCount === 0 ? (
                <EmptyOrganizationsPlaceholder />
              ) : (
                <ProjectsPanel selectedOrganization={selectedOrganization} />
              )}
            </Col>
          </Row>
        </>
      </Modal.Body>
      {organizationsCount !== 0 && (
        <Modal.Footer>
          <Button onClick={() => router.stateService.go('profile.details')}>
            {translate('Go to my profile')}
          </Button>
          <CloseDialogButton />
        </Modal.Footer>
      )}
    </>
  );
};
