import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';

import { SharedProviderCustomers } from './SharedProviderCustomers';
import { providerSelector } from './SharedProviderFilter';
import { SharedProviderResources } from './SharedProviderResources';

const SharedProviderTabs = ({ provider }) => provider ? (
  <div className="ibox">
    <div className="ibox-content">
      <Tabs defaultActiveKey={1} id="shared-provider-tabs" unmountOnExit={true}>
        <Tab eventKey={1} title={translate('Organizations')}>
          <div className="m-t-sm">
            <SharedProviderCustomers provider_uuid={provider.uuid}/>
          </div>
        </Tab>
        <Tab eventKey={2} title={translate('VMs')}>
          <div className="m-t-sm">
            <SharedProviderResources provider_uuid={provider.uuid}/>
          </div>
        </Tab>
      </Tabs>
    </div>
  </div>
) : null;

const mapStateToProps = state => ({
  provider: providerSelector(state),
});

const connector = connect(mapStateToProps);

export const SharedProviderTabsContainer = connector(SharedProviderTabs);
