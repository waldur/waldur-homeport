import React from 'react';
import { Card } from 'react-bootstrap';
import { FormSpy } from 'react-final-form';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

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
            <Tabs mount="active" defaultValue="images">
              <TabsList>
                <TabsTrigger value="images">{translate('Images')}</TabsTrigger>
                <TabsTrigger value="flavors">
                  {translate('Flavors')}
                </TabsTrigger>
              </TabsList>
              <div className="tab-content">
                <TabsContent value="images">
                  <Card>
                    <ImagesList />
                  </Card>
                </TabsContent>
                <TabsContent value="flavors">
                  <Card>
                    <FlavorsList />
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        );
      }}
    </FormSpy>
  );
};
