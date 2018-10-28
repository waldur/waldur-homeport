import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import Panel from '@waldur/core/Panel';
import { CustomerCreatePromptContainer } from '@waldur/customer/create/CustomerCreatePromptContainer';
import { renderCustomerCreatePrompt } from '@waldur/customer/create/selectors';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { CurrentUserEvents } from './CurrentUserEvents';
import CustomerPermissions from './CustomerPermissions';
import ProjectPermissions from './ProjectPermissions';

interface PureUserDashboardProps extends TranslateProps {
  renderCustomerCreatePrompt: boolean;
}

const PureUserDashboard: React.SFC<PureUserDashboardProps> = props => (
  <div className="wrapper wrapper-content">
    {props.renderCustomerCreatePrompt &&
      <div className="row">
        <div className="col-md-12">
          <CustomerCreatePromptContainer/>
        </div>
      </div>
    }
    <div className="row">
      <div className="col-md-6">
        <Panel title={props.translate('Owned organizations')}>
          <CustomerPermissions/>
        </Panel>
      </div>
      <div className="col-md-6">
        <Panel title={props.translate('Managed projects')}>
          <ProjectPermissions/>
        </Panel>
      </div>
    </div>
    <div className="row">
      <div className="col-md-12">
        <Panel title={props.translate('Audit logs')}>
          <CurrentUserEvents/>
        </Panel>
      </div>
    </div>
  </div>
);

const mapStateToProps = state => ({
  renderCustomerCreatePrompt: renderCustomerCreatePrompt(state),
});

const enhance = compose(
  connect(mapStateToProps),
  withTranslation,
);

const UserDashboard = enhance(PureUserDashboard);

export default connectAngularComponent(UserDashboard);
