import * as React from 'react';
import * as Tab from 'react-bootstrap/lib/Tab';
import * as Tabs from 'react-bootstrap/lib/Tabs';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';

import { FlavorsList } from './FlavorsList';
import { ImagesList } from './ImagesList';

export const VmTypeOverview = connect(state =>
  getFormValues('vmOverviewFilter')(state),
)((formValues: { service_provider: any[] }) => {
  if (
    !Array.isArray(formValues.service_provider) ||
    formValues.service_provider.length === 0
  ) {
    return null;
  }
  return (
    <Panel>
      <Tabs
        defaultActiveKey={1}
        id="vm-overview"
        mountOnEnter
        unmountOnExit
        animation={false}
      >
        <Tab eventKey={1} title={translate('Images')}>
          <div className="m-t-sm">
            <ImagesList />
          </div>
        </Tab>
        <Tab eventKey={2} title={translate('Flavors')}>
          <div className="m-t-sm">
            <FlavorsList />
          </div>
        </Tab>
      </Tabs>
    </Panel>
  );
}) as React.ComponentType<{}>;
