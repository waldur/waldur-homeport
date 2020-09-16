import { useRouter } from '@uirouter/react';
import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Modal from 'react-bootstrap/lib/Modal';
import * as Row from 'react-bootstrap/lib/Row';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import './SelectWorkspaceDialog.scss';
import { getCustomersCount } from './api';
import { EmptyOrganizationsPlaceholder } from './EmptyOrganizationsPlaceholder';
import { OrganizationsPanel } from './OrganizationsPanel';
import { ProjectsPanel } from './ProjectsPanel';

export const SelectWorkspaceDialog = () => {
  const currentCustomer = useSelector(getCustomer);
  const [selectedOrganization, selectOrganization] = React.useState<Customer>(
    currentCustomer,
  );

  const router = useRouter();

  const { loading, error, value: organizationsCount } = useAsync(
    getCustomersCount,
  );

  return (
    <>
      <Modal.Header>
        <Modal.Title>{translate('Select workspace')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          translate('Unable to load data')
        ) : organizationsCount === 0 ? (
          <EmptyOrganizationsPlaceholder />
        ) : (
          <Row>
            <OrganizationsPanel
              selectedOrganization={selectedOrganization}
              selectOrganization={selectOrganization}
              organizationsCount={organizationsCount}
            />
            <ProjectsPanel selectedOrganization={selectedOrganization} />
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => router.stateService.go('profile.details')}>
          {translate('Go to my profile')}
        </Button>
        <CloseDialogButton />
      </Modal.Footer>
    </>
  );
};
