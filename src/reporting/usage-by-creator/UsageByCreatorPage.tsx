import { FC, useState } from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { translate } from '@/i18n';

import { ReportingTitle } from '../ReportingTitle';

import { AffiliationUsageTab } from './AffiliationUsageTab';
import { OrgTypeUsageTab } from './OrgTypeUsageTab';

type TabKey = 'affiliation' | 'org-type';

export const UsageByCreatorPage: FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('affiliation');

  return (
    <>
      <ReportingTitle reportKey="usage-by-creator" />
      <Tabs
        mount="visited"
        value={activeTab}
        onValueChange={(k) => setActiveTab(k as TabKey)}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="affiliation">
            {translate('By affiliation')}
          </TabsTrigger>
          <TabsTrigger value="org-type">
            {translate('By organization type')}
          </TabsTrigger>
        </TabsList>

        <>
          <TabsContent value="affiliation">
            <AffiliationUsageTab />
          </TabsContent>
          <TabsContent value="org-type">
            <OrgTypeUsageTab />
          </TabsContent>
        </>
      </Tabs>
    </>
  );
};
