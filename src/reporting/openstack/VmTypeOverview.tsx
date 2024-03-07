import React from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';

import { FlavorsList } from './FlavorsList';
import { ImagesList } from './ImagesList';

export const VmTypeOverview = connect((state: RootState) =>
  getFormValues('vmOverviewFilter')(state),
)((formValues: { service_provider: any[] }) => {
  if (
    !Array.isArray(formValues.service_provider) ||
    formValues.service_provider.length === 0
  ) {
    return null;
  }
  return (
    <Card>
      <Tabs defaultActiveKey={1} id="vm-overview" mountOnEnter unmountOnExit>
        <Tab eventKey={1} title={translate('Images')}>
          <Card>
            <ImagesList />
          </Card>
        </Tab>
        <Tab eventKey={2} title={translate('Flavors')}>
          <Card>
            <FlavorsList />
          </Card>
        </Tab>
      </Tabs>
    </Card>
  );
}) as React.ComponentType;
