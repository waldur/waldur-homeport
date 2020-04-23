import { useRouter } from '@uirouter/react';
import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Row from 'react-bootstrap/lib/Row';
import { useSelector } from 'react-redux';
import useAsync from 'react-use/lib/useAsync';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import './SelectWorkspaceDialog.scss';
import { EmptyOrganizationsPlaceholder } from './EmptyOrganizationsPlaceholder';
import { OrganizationsPanel } from './OrganizationsPanel';
import { ProjectsPanel } from './ProjectsPanel';
import { loadOrganizations } from './utils';

export const SelectWorkspaceDialog = () => {
  const currentCustomer = useSelector(getCustomer);
  const [selectedOrganization, selectOrganization] = React.useState<Customer>(
    currentCustomer,
  );

  const { loading, error, value: organizations } = useAsync(
    loadOrganizations,
    [],
  );

  const router = useRouter();

  return (
    <>
      <div className="modal-header">
        <h3 className="modal-title">{translate('Select workspace')}</h3>
      </div>
      <div className="modal-body">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          translate('Unable to load data')
        ) : organizations.length === 0 ? (
          <EmptyOrganizationsPlaceholder />
        ) : (
          <Row>
            <OrganizationsPanel
              organizations={organizations}
              selectedOrganization={selectedOrganization}
              selectOrganization={selectOrganization}
            />
            <ProjectsPanel selectedOrganization={selectedOrganization} />
          </Row>
        )}
      </div>
      <div className="modal-footer">
        <Button onClick={() => router.stateService.go('profile.details')}>
          {translate('Go to my profile')}
        </Button>
        <CloseDialogButton />
      </div>
    </>
  );
};
