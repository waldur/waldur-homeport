import { FC, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { OpenStackSecurityGroup } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

import { SecurityGroupInstancesList } from './SecurityGroupInstancesList';
import { SecurityGroupRulesTable } from './SecurityGroupRulesList';

export const SecurityGroupExpandableRow: FC<{
  row: OpenStackSecurityGroup;
  fetch: (force?: boolean) => void;
}> = ({ row, fetch }) => {
  const [activeTab, setActiveTab] = useState('rules');
  return (
    <ExpandableContainer>
      <Tab.Container
        activeKey={activeTab}
        onSelect={setActiveTab}
        unmountOnExit
      >
        <Nav variant="tabs" className="nav-line-tabs flex-nowrap mb-4">
          <Nav.Item>
            <Nav.Link eventKey="rules">{translate('Rules')}</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="instances">{translate('Instances')}</Nav.Link>
          </Nav.Item>
        </Nav>
        <Tab.Content className="overflow-auto">
          <Tab.Pane eventKey="rules" unmountOnExit>
            <SecurityGroupRulesTable row={row} />
          </Tab.Pane>
          <Tab.Pane eventKey="instances" unmountOnExit>
            <SecurityGroupInstancesList row={row} refetchGroups={fetch} />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </ExpandableContainer>
  );
};
