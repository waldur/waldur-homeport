import React from 'react';
import { Card, Tab, Tabs } from 'react-bootstrap';
import { FormSpy } from 'react-final-form';

import { translate } from '@/i18n';

import { FlavorsList } from './FlavorsList';
import { ImagesList } from './ImagesList';

export const VmTypeOverview: React.FC = () => {
  return (
    <FormSpy subscription={{ values: true }}>
      {({ values }) => {
        if (
          !Array.isArray(values?.service_provider) ||
          values.service_provider.length === 0
        ) {
          return null;
        }

        return (
          <Card>
            <Tabs
              defaultActiveKey={1}
              id="vm-overview"
              mountOnEnter
              unmountOnExit
            >
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
      }}
    </FormSpy>
  );
};
