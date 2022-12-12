import { FunctionComponent } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { UserEvents } from '@waldur/user/dashboard/UserEvents';
import { KeysList } from '@waldur/user/keys/KeysList';
import {
  isVisibleForSupportOrStaff,
  userManageIsVisible,
} from '@waldur/user/support/selectors';
import { UserDetailsTable } from '@waldur/user/support/UserDetailsTable';
import { UserEditContainer } from '@waldur/user/support/UserEditContainer';
import { UserOfferingList } from '@waldur/user/UserOfferingList';
import { UserDetails } from '@waldur/workspace/types';

import { UserOrganizationsList } from './UserOrganizationsList';
import { UserProjectsList } from './UserProjectsList';

interface StateProps {
  isVisibleForSupportOrStaff: boolean;
  userManageIsVisible: boolean;
}

interface OwnProps {
  user: UserDetails;
}

export type UserDetailsViewProps = StateProps & OwnProps;

export const PureUserDetailsView: FunctionComponent<UserDetailsViewProps> = (
  props,
) => (
  <Tabs defaultActiveKey={1} id="user-details" unmountOnExit={true}>
    {props.isVisibleForSupportOrStaff && (
      <Tab eventKey={1} title={translate('Details')}>
        <Card>
          <UserDetailsTable user={props.user} />
        </Card>
      </Tab>
    )}
    <Tab eventKey={2} title={translate('Audit log')}>
      <Card>
        <UserEvents user={props.user} showActions={false} />
      </Card>
    </Tab>
    {props.userManageIsVisible && (
      <Tab eventKey={3} title={translate('Manage')}>
        <Card>
          <UserEditContainer user={props.user} showDeleteButton={false} />
        </Card>
      </Tab>
    )}
    <Tab eventKey={4} title={translate('Keys')}>
      <Card>
        <KeysList user={props.user} />
      </Card>
    </Tab>
    <Tab eventKey={5} title={translate('Remote accounts')}>
      <Card>
        <UserOfferingList user={props.user} />
      </Card>
    </Tab>
    <Tab eventKey={6} title={translate('Organizations')}>
      <Card>
        <UserOrganizationsList user={props.user} />
      </Card>
    </Tab>
    <Tab eventKey={7} title={translate('Projects')}>
      <Card>
        <UserProjectsList user={props.user} />
      </Card>
    </Tab>
  </Tabs>
);

const mapStateToProps = (state: RootState) => ({
  userManageIsVisible: userManageIsVisible(state),
  isVisibleForSupportOrStaff: isVisibleForSupportOrStaff(state),
});

const enhance = connect<StateProps, {}, OwnProps>(mapStateToProps);

export const UserDetailsView = enhance(PureUserDetailsView);
