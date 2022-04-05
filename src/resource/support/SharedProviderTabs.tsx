import { FunctionComponent } from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { SharedProviderCustomers } from './SharedProviderCustomers';
import { providerSelector } from './SharedProviderFilter';
import { SharedProviderResources } from './SharedProviderResources';

const SharedProviderTabs: FunctionComponent<{ provider }> = ({ provider }) =>
  provider ? (
    <Card>
      <Card.Body>
        <Tabs
          defaultActiveKey={1}
          id="shared-provider-tabs"
          unmountOnExit={true}
        >
          <Tab eventKey={1} title={translate('Organizations')}>
            <div className="mt-2">
              <SharedProviderCustomers provider_uuid={provider.uuid} />
            </div>
          </Tab>
          <Tab eventKey={2} title={translate('VMs')}>
            <div className="mt-2">
              <SharedProviderResources provider_uuid={provider.uuid} />
            </div>
          </Tab>
        </Tabs>
      </Card.Body>
    </Card>
  ) : null;

const mapStateToProps = (state: RootState) => ({
  provider: providerSelector(state),
});

const connector = connect(mapStateToProps);

export const SharedProviderTabsContainer = connector(SharedProviderTabs);
