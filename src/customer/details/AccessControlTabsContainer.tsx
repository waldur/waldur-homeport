import { FC, useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from 'waldur-ui';

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
    <Tabs value={activeKey} onValueChange={(k) => setActiveKey(k as SubTabKey)}>
      <div className="card card-bordered">
        <div className="card-header border-b-[1px] border-b-secondary">
          <div className="card-title">
            <h3>{translate('Access control')}</h3>
          </div>
        </div>
        <div className="card-header border-b-[1px] border-b-secondary items-stretch py-0 min-h-auto">
          <TabsList scrollable scrollClassName="grow pt-3" bordered={false}>
            {getSubTabs().map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} hint={tab.tooltip}>
                {tab.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="card-body p-0">
          <TabsContent value="subnets">
            <AccessSubnetMatrix customer={customer} canManage={canManage} />
          </TabsContent>
          <TabsContent value="restrictions">
            <CustomerMembershipRestrictionsPanel customer={customer} />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
};
