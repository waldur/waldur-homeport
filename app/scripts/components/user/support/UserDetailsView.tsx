import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';
import { connect } from 'react-redux';
import { compose } from 'redux';

import {TranslateProps, withTranslation} from '@waldur/i18n';
import UserEvents from '@waldur/user/list/UserEvents';
import { CurrentUser, UserDetails } from '@waldur/user/support/types';
import { getUser } from '@waldur/workspace/selectors';

export interface UserDetailsViewProps extends TranslateProps {
  children?: any;
  rows?: any;
  user?: UserDetails;
  currentUser: CurrentUser;
}

export const PureUserDetailsView = (props: UserDetailsViewProps) => {
  return (
    <Tabs defaultActiveKey={2} id="user-details">
      <Tab eventKey={1} title={props.translate('Audit log')}>
        <div className="m-t-sm">
          <UserEvents /> # passing user is a part of WAL-1378
        </div>
      </Tab>
      {(props.currentUser.is_support || props.currentUser.is_staff) &&
        <Tab eventKey={2} title={props.translate('Details')}>
          <div className="m-t-sm">
            # todo in WAL-1379
          </div>
        </Tab>
      }
      {props.currentUser.is_staff &&
        <Tab eventKey={3} title={props.translate('Manage')}>
          <div className="m-t-sm">
            # todo in WAL-1380
          </div>
        </Tab>
      }
    </Tabs>
  );
};

const mapStateToProps = state => ({
  currentUser: getUser(state),
});

const enhance = compose(withTranslation, connect(mapStateToProps));
export const UserDetailsView = enhance(PureUserDetailsView);
