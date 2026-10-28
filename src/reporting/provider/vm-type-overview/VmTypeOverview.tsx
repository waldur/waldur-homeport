import React from 'react';
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
          <div className="card">
            <Tabs mount="active" defaultValue="images">
              <TabsList>
                <TabsTrigger value="images">{translate('Images')}</TabsTrigger>
                <TabsTrigger value="flavors">
                  {translate('Flavors')}
                </TabsTrigger>
              </TabsList>
              <div className="tab-content">
                <TabsContent value="images">
                  <div className="card">
                    <ImagesList />
                  </div>
                </TabsContent>
                <TabsContent value="flavors">
                  <div className="card">
                    <FlavorsList />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        );
      }}
    </FormSpy>
  );
};
