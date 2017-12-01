import * as React from 'react';
import { react2angular } from 'react2angular';

import Panel from '@waldur/core/Panel';
import { withTranslation } from '@waldur/i18n/translate';
import { withStore } from '@waldur/table-react/utils';

import CustomerPermissions from './CustomerPermissions';
import ProjectPermissions from './ProjectPermissions';
import UserEvents from './UserEvents';

const UserDashboard = ({ translate }) => (
  <div className="wrapper wrapper-content">
    <div className="row">
      <div className="col-md-6">
        <Panel title={translate('Owned organizations')}>
          <CustomerPermissions/>
        </Panel>
      </div>
      <div className="col-md-6">
        <Panel title={translate('Managed projects')}>
          <ProjectPermissions/>
        </Panel>
      </div>
    </div>
    <div className="row">
      <div className="col-md-12">
        <Panel title={translate('Audit logs')}>
          <UserEvents/>
        </Panel>
      </div>
    </div>
  </div>
);

export default react2angular(withStore(withTranslation(UserDashboard)));
