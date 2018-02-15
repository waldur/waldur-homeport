import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';
import { connect } from 'react-redux';
import { compose } from 'redux';

import {TranslateProps, withTranslation} from '@waldur/i18n';
import UserEvents from '@waldur/user/list/UserEvents';
import { userDetailsIsVisible, userManageIsVisible } from '@waldur/user/support/selectors';
import { UserDetailsTable } from '@waldur/user/support/UserDetailsTable';
import { UserDetails, User } from '@waldur/workspace/types';

export interface UserDetailsViewProps extends TranslateProps {
  user: UserDetails;
  currentUser: User;
  userDetailsIsVisible: boolean;
  userManageIsVisible: boolean;
}

export const PureUserDetailsView = (props: UserDetailsViewProps) => (
  <Tabs defaultActiveKey={1} id="user-details">
    <Tab eventKey={1} title={props.translate('Audit log')}>
      <div className="m-t-sm">
        <UserEvents />
      </div>
    </Tab>
    {props.userDetailsIsVisible && (
      <Tab eventKey={2} title={props.translate('Details')}>
        <div className="m-t-sm">
          <UserDetailsTable user={props.user}/>
        </div>
      </Tab>
    )}
    {props.userManageIsVisible && (
      <Tab eventKey={3} title={props.translate('Manage')}>
        <div className="m-t-sm">
          # todo in WAL-1380
        </div>
      </Tab>
    )}
  </Tabs>
);

const mapStateToProps = state => ({
  userManageIsVisible: userManageIsVisible(state),
  userDetailsIsVisible: userDetailsIsVisible(state),
});

const enhance = compose(withTranslation, connect(mapStateToProps));

export const UserDetailsView = enhance(PureUserDetailsView);
