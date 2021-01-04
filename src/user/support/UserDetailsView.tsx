import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { UserEvents } from '@waldur/user/list/UserEvents';
import {
  isVisibleForSupportOrStaff,
  userManageIsVisible,
} from '@waldur/user/support/selectors';
import { UserDetailsTable } from '@waldur/user/support/UserDetailsTable';
import { UserEditContainer } from '@waldur/user/support/UserEditContainer';
import { UserDetails } from '@waldur/workspace/types';

interface StateProps {
  isVisibleForSupportOrStaff: boolean;
  userManageIsVisible: boolean;
}

interface OwnProps {
  user: UserDetails;
}

export type UserDetailsViewProps = TranslateProps & StateProps & OwnProps;

export const PureUserDetailsView: FunctionComponent<UserDetailsViewProps> = (
  props,
) => (
  <Tabs defaultActiveKey={1} id="user-details" unmountOnExit={true}>
    {props.isVisibleForSupportOrStaff && (
      <Tab eventKey={1} title={props.translate('Details')}>
        <div className="m-t-sm">
          <UserDetailsTable user={props.user} />
        </div>
      </Tab>
    )}
    <Tab eventKey={2} title={props.translate('Audit log')}>
      <div className="m-t-sm">
        <UserEvents user={props.user} showActions={false} />
      </div>
    </Tab>
    {props.userManageIsVisible && (
      <Tab eventKey={3} title={props.translate('Manage')}>
        <div className="m-t-sm">
          <UserEditContainer user={props.user} showDeleteButton={false} />
        </div>
      </Tab>
    )}
  </Tabs>
);

const mapStateToProps = (state: RootState) => ({
  userManageIsVisible: userManageIsVisible(state),
  isVisibleForSupportOrStaff: isVisibleForSupportOrStaff(state),
});

const enhance = compose(
  connect<StateProps, {}, OwnProps>(mapStateToProps),
  withTranslation,
);

export const UserDetailsView = enhance(PureUserDetailsView);
