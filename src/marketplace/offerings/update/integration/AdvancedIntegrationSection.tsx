import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { Tabs, TabsList, TabsTrigger, TabsContent } from 'waldur-ui';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { useUrlTab } from '@/navigation/useUrlTab';

import { LexisLinkIntegrationSection } from './LexisLinkIntegrationSection';
import { OfferingEditPanelProps } from './types';
import { UserAttributeConfigSection } from './UserAttributeConfigSection';

export const isAdvancedIntegrationVisible = (offering): boolean =>
  Boolean(
    offering?.plugin_options?.service_provider_can_create_offering_user ||
    isFeatureVisible(MarketplaceFeatures.lexis_links),
  );

export const AdvancedIntegrationSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const showUserAttribute = Boolean(
    props.offering?.plugin_options?.service_provider_can_create_offering_user,
  );
  const showLexis = isFeatureVisible(MarketplaceFeatures.lexis_links);

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
      ].filter(Boolean),
    [showUserAttribute, showLexis],
  );

  const { activeKey, handleSelect } = useUrlTab(tabs, 'section');

  if (tabs.length === 0) {
    return null;
  }

  return (
    <Card className="card-bordered">
      <Card.Body>
        <Tabs mount="active" value={activeKey} onValueChange={handleSelect}>
          <TabsList className="mb-5">
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
          </>
        </Tabs>
      </Card.Body>
    </Card>
  );
};
