import * as React from 'react';
import { useSelector } from 'react-redux';

import { Panel } from '@waldur/core/Panel';
import { CustomerCreatePromptContainer } from '@waldur/customer/create/CustomerCreatePromptContainer';
import { renderCustomerCreatePrompt } from '@waldur/customer/create/selectors';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { CurrentUserEvents } from './CurrentUserEvents';
import { CustomerPermissions } from './CustomerPermissions';
import { ProjectPermissions } from './ProjectPermissions';

export const UserDashboard: React.FC = () => {
  useTitle(translate('User dashboard'));
  const renderPrompt = useSelector(renderCustomerCreatePrompt);
  return (
    <div className="wrapper wrapper-content">
      {renderPrompt && (
        <div className="row">
          <div className="col-md-12">
            <CustomerCreatePromptContainer />
          </div>
        </div>
      )}
      <div className="row">
        <div className="col-md-6">
          <Panel title={translate('Owned organizations')}>
            <CustomerPermissions />
          </Panel>
        </div>
        <div className="col-md-6">
          <Panel title={translate('Managed projects')}>
            <ProjectPermissions />
          </Panel>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12">
          <Panel title={translate('Audit logs')}>
            <CurrentUserEvents />
          </Panel>
        </div>
      </div>
    </div>
  );
};
