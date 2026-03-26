import React from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { translate } from '@waldur/i18n';

import { FlavorsList } from './FlavorsList';
import { ImagesList } from './ImagesList';

export const VmTypeOverview: React.FC = () => {
  const formValues = useSelector(getFormValues('vmOverviewFilter')) as {
    service_provider;
  };

  if (
    !Array.isArray(formValues?.service_provider) ||
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
};
