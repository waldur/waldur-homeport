import { FC, useMemo } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';

import { useSettingsUrlSync } from '@/administration/settings/useSettingsUrlSync';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';

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

  const { activeKey, handleSelect, defaultActiveKey } = useSettingsUrlSync(
    tabs,
    'section',
  );

  if (tabs.length === 0) {
    return null;
  }

  return (
    <Card className="card-bordered">
      <Card.Body>
        <Tab.Container
          defaultActiveKey={defaultActiveKey}
          activeKey={activeKey}
          onSelect={handleSelect}
        >
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {tabs.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <Tab.Content>
            {showUserAttribute && (
              <Tab.Pane eventKey="user-attribute" unmountOnExit>
                <UserAttributeConfigSection {...props} />
              </Tab.Pane>
            )}
            {showLexis && (
              <Tab.Pane eventKey="lexis" unmountOnExit>
                <LexisLinkIntegrationSection {...props} />
              </Tab.Pane>
            )}
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};
