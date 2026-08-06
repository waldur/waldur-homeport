import { QuestionIcon } from '@phosphor-icons/react';
import { FC, useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { PermissionEnum } from '@/permissions/enums';
import { hasPermission } from '@/permissions/hasPermission';
import { useUser } from '@/workspace/hooks';

import { AccessSubnetMatrix } from './AccessSubnetMatrix';
import { CustomerMembershipRestrictionsPanel } from './CustomerMembershipRestrictionsPanel';
import { CustomerEditPanelProps } from './types';

type SubTabKey = 'subnets' | 'restrictions';

const getSubTabs = (): Array<{
  key: SubTabKey;
  title: string;
  tooltip?: string;
}> => [
  {
    key: 'subnets',
    title: translate('Access subnets'),
    tooltip: translate(
      'Networks this organization trusts. Each entry says what it is trusted for: signing in to the portal, reaching resources of a given offering, or both.',
    ),
  },
  {
    key: 'restrictions',
    title: translate('Membership restrictions'),
    tooltip: translate(
      'When restrictions are configured, only users matching at least one criterion can become members. If multiple restriction types are configured, matching any one of them is sufficient (OR logic).',
    ),
  },
];

export const AccessControlTabsContainer: FC<CustomerEditPanelProps> = ({
  customer,
}) => {
  const [activeKey, setActiveKey] = useState<SubTabKey>('subnets');
  const customer_uuid = customer.uuid;

  const user = useUser();
  const canManage = hasPermission(user, {
    permission: PermissionEnum.CREATE_ACCESS_SUBNET,
    customerId: customer_uuid,
  });

  return (
    <Card className="card-bordered">
      <Card.Header className="border-bottom">
        <Card.Title>
          <h3>{translate('Access control')}</h3>
        </Card.Title>
      </Card.Header>
      <Card.Header className="border-bottom align-items-stretch py-0 min-h-auto">
        <Tab.Container
          activeKey={activeKey}
          onSelect={(k) => setActiveKey(k as SubTabKey)}
        >
          <div className="overflow-auto flex-grow-1 pb-2 pt-4">
            <Nav
              variant="tabs"
              className="nav-line-tabs flex-nowrap mx-0 border-0"
            >
              {getSubTabs().map((tab) => (
                <Nav.Item key={tab.key} className="text-nowrap">
                  <Nav.Link as="button" eventKey={tab.key}>
                    {tab.title}
                    {tab.tooltip && (
                      <Tip
                        id={`${tab.key}-tooltip`}
                        label={tab.tooltip}
                        className="ms-2"
                      >
                        <QuestionIcon
                          size={16}
                          weight="bold"
                          className="text-muted"
                        />
                      </Tip>
                    )}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </div>
        </Tab.Container>
      </Card.Header>
      <Card.Body className="p-0">
        {activeKey === 'subnets' && (
          <AccessSubnetMatrix customer={customer} canManage={canManage} />
        )}
        {activeKey === 'restrictions' && (
          <CustomerMembershipRestrictionsPanel customer={customer} />
        )}
      </Card.Body>
    </Card>
  );
};
