import { FC, useMemo } from 'react';

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardContent,
} from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useUrlTab } from '@/navigation/useUrlTab';

import { isHpcWorkspaceConfigurable } from './advancedIntegration';
import { HpcWorkspaceIntegrationSection } from './HpcWorkspaceIntegrationSection';
import { LexisLinkIntegrationSection } from './LexisLinkIntegrationSection';
import { OfferingEditPanelProps } from './types';
import { UserAttributeConfigSection } from './UserAttributeConfigSection';

export const AdvancedIntegrationSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const showUserAttribute = Boolean(
    props.offering?.plugin_options?.service_provider_can_create_offering_user,
  );
  const showLexis = isFeatureVisible(MarketplaceFeatures.lexis_links);
  const showHpcWorkspace = isHpcWorkspaceConfigurable(props.offering);

  const tabs = useMemo(
    () =>
      [
        showUserAttribute && {
          key: 'user-attribute',
          title: translate('User attribute exposure'),
        },
        showLexis && {
          key: 'lexis',
          title: translate('LEXIS integration'),
        },
        showHpcWorkspace && {
          key: 'hpc-workspace',
          title: translate('HPC workspace'),
        },
      ].filter(Boolean),
    [showUserAttribute, showLexis, showHpcWorkspace],
  );

  const { activeKey, handleSelect } = useUrlTab(tabs, 'section');

  if (tabs.length === 0) {
    return null;
  }

  return (
    <Card bordered>
      <CardContent>
        <Tabs mount="active" value={activeKey} onValueChange={handleSelect}>
          <TabsList className="mb-4">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <>
            {showUserAttribute && (
              <TabsContent value="user-attribute">
                <UserAttributeConfigSection {...props} />
              </TabsContent>
            )}
            {showLexis && (
              <TabsContent value="lexis">
                <LexisLinkIntegrationSection {...props} />
              </TabsContent>
            )}
            {showHpcWorkspace && (
              <TabsContent value="hpc-workspace">
                <HpcWorkspaceIntegrationSection {...props} />
              </TabsContent>
            )}
          </>
        </Tabs>
      </CardContent>
    </Card>
  );
};
