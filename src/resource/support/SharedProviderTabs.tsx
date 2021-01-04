import { FunctionComponent } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { SharedProviderCustomers } from './SharedProviderCustomers';
import { providerSelector } from './SharedProviderFilter';
import { SharedProviderResources } from './SharedProviderResources';

const SharedProviderTabs: FunctionComponent<{ provider }> = ({ provider }) =>
  provider ? (
    <div className="ibox">
      <div className="ibox-content">
        <Tabs
          defaultActiveKey={1}
          id="shared-provider-tabs"
          unmountOnExit={true}
        >
          <Tab eventKey={1} title={translate('Organizations')}>
            <div className="m-t-sm">
              <SharedProviderCustomers provider_uuid={provider.uuid} />
            </div>
          </Tab>
          <Tab eventKey={2} title={translate('VMs')}>
            <div className="m-t-sm">
              <SharedProviderResources provider_uuid={provider.uuid} />
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  ) : null;

const mapStateToProps = (state: RootState) => ({
  provider: providerSelector(state),
});

const connector = connect(mapStateToProps);

export const SharedProviderTabsContainer = connector(SharedProviderTabs);
