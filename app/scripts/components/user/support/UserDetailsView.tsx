import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import UserEvents from '@waldur/user/list/UserEvents';
import { isVisibleForSupportOrStaff, userEventsIsVisible, userManageIsVisible } from '@waldur/user/support/selectors';
import { UserDetailsTable } from '@waldur/user/support/UserDetailsTable';
import { UserEditContainer } from '@waldur/user/support/UserEditContainer';
import { UserDetails } from '@waldur/workspace/types';

export interface UserDetailsViewProps extends TranslateProps {
  user: UserDetails;
  isVisibleForSupportOrStaff: boolean;
  userManageIsVisible: boolean;
  userEventsIsVisible: boolean;
}

export const PureUserDetailsView = (props: UserDetailsViewProps) => (
  <Tabs defaultActiveKey={1} id="user-details">
    {props.isVisibleForSupportOrStaff && (
      <Tab eventKey={1} title={props.translate('Details')}>
        <div className="m-t-sm">
          <UserDetailsTable user={props.user}/>
        </div>
      </Tab>
    )}
    {props.userEventsIsVisible && (
      <Tab eventKey={2} title={props.translate('Audit log')}>
        <div className="m-t-sm">
          <UserEvents />
        </div>
      </Tab>
    )}
    {props.userManageIsVisible && (
      <Tab eventKey={3} title={props.translate('Manage')}>
        <div className="m-t-sm">
          <UserEditContainer user={props.user} showDeleteButton={false}/>
        </div>
      </Tab>
    )}
  </Tabs>
);

const mapStateToProps = state => ({
  userManageIsVisible: userManageIsVisible(state),
  isVisibleForSupportOrStaff: isVisibleForSupportOrStaff(state),
  userEventsIsVisible: userEventsIsVisible(state),
});

const enhance = compose(withTranslation, connect(mapStateToProps));

export const UserDetailsView = enhance(PureUserDetailsView);
