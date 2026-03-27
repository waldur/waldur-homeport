import { FC, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ReportingTitle } from '../ReportingTitle';

import { AffiliationUsageTab } from './AffiliationUsageTab';
import { OrgTypeUsageTab } from './OrgTypeUsageTab';

type TabKey = 'affiliation' | 'org-type';

export const UsageByCreatorPage: FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('affiliation');

  return (
    <>
      <ReportingTitle reportKey="usage-by-creator" />
      <Tab.Container
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k as TabKey)}
      >
        <Nav variant="tabs" className="nav-line-tabs mb-6">
          <Nav.Item>
            <Nav.Link as="button" eventKey="affiliation">
              {translate('By affiliation')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link as="button" eventKey="org-type">
              {translate('By organization type')}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          <Tab.Pane eventKey="affiliation" mountOnEnter>
            <AffiliationUsageTab />
          </Tab.Pane>
          <Tab.Pane eventKey="org-type" mountOnEnter>
            <OrgTypeUsageTab />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </>
  );
};
