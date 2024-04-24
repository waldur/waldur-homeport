import { FunctionComponent } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { UserEvents } from '@waldur/user/dashboard/UserEvents';
import { KeysList } from '@waldur/user/keys/KeysList';
import { UserDetailsTable } from '@waldur/user/support/UserDetailsTable';
import { UserEditContainer } from '@waldur/user/support/UserEditContainer';
import { UserOfferingList } from '@waldur/user/UserOfferingList';
import { getUser } from '@waldur/workspace/selectors';

import { BaseOrganizationsList } from '../affiliations/BaseOrganizationsList';

import { UserProjectsList } from './UserProjectsList';

export const UserDetailsView: FunctionComponent<{ user }> = ({ user }) => {
  const currentUser = useSelector(getUser);
  return (
    <Tabs defaultActiveKey={1} id="user-details" unmountOnExit={true}>
      {(currentUser.is_staff || currentUser.is_support) && (
        <Tab eventKey={1} title={translate('Details')}>
          <Card>
            <UserDetailsTable user={user} />
          </Card>
        </Tab>
      )}
      <Tab eventKey={2} title={translate('Audit log')}>
        <Card>
          <UserEvents user={user} />
        </Card>
      </Tab>
      {currentUser.is_staff && (
        <Tab eventKey={3} title={translate('Manage')}>
          <Card>
            <UserEditContainer user={user} showDeleteButton={false} />
          </Card>
        </Tab>
      )}
      <Tab eventKey={4} title={translate('Keys')}>
        <Card>
          <KeysList user={user} />
        </Card>
      </Tab>
      <Tab eventKey={5} title={translate('Remote accounts')}>
        <Card>
          <UserOfferingList user={user} />
        </Card>
      </Tab>
      <Tab eventKey={6} title={translate('Organizations')}>
        <Card>
          <BaseOrganizationsList user={user} />
        </Card>
      </Tab>
      <Tab eventKey={7} title={translate('Projects')}>
        <Card>
          <UserProjectsList user={user} />
        </Card>
      </Tab>
    </Tabs>
  );
};
