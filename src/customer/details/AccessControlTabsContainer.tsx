import { QuestionIcon } from '@phosphor-icons/react';
import { FC, useMemo, useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import { AccessSubnet, accessSubnetsList } from 'waldur-js-client';

import { Tip } from '@waldur/core/Tooltip';
import { FilteredEventsButton } from '@waldur/events/FilteredEventsButton';
import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { AccessSubnetCreateButton } from './AccessSubnetCreateButton';
import { AccessSubnetRowActions } from './AccessSubnetRowActions';
import { CustomerMembershipRestrictionsPanel } from './CustomerMembershipRestrictionsPanel';
import { CustomerEditPanelProps } from './types';

type SubTabKey = 'subnets' | 'restrictions';

const restrictionsTooltip = translate(
  'When restrictions are configured, only users matching at least one criterion can become members. If multiple restriction types are configured, matching any one of them is sufficient (OR logic).',
);

const subTabs: Array<{ key: SubTabKey; title: string; tooltip?: string }> = [
  { key: 'subnets', title: translate('Allowed access subnets') },
  {
    key: 'restrictions',
    title: translate('Membership restrictions'),
    tooltip: restrictionsTooltip,
  },
];

export const AccessControlTabsContainer: FC<CustomerEditPanelProps> = ({
  customer,
}) => {
  const [activeKey, setActiveKey] = useState<SubTabKey>('subnets');

  const customer_uuid = customer.uuid;
  const filter = useMemo(() => ({ customer_uuid }), [customer_uuid]);
  const tableProps = useTable({
    table: 'customerAccessControl',
    filter,
    fetchData: createFetcher(accessSubnetsList),
    queryField: 'description',
  });

  const subnetsActions = (
    <>
      <FilteredEventsButton
        filter={{ customer_uuid, feature: 'access_subnets' }}
      />
      <AccessSubnetCreateButton
        refetch={tableProps.fetch}
        customer_url={customer.url}
      />
    </>
  );

  return (
    <Card className="card-bordered">
      <Card.Header className="border-bottom">
        <Card.Title>
          <h3>{translate('Access control')}</h3>
        </Card.Title>
        <div className="card-toolbar d-flex gap-2">
          {activeKey === 'subnets' && subnetsActions}
        </div>
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
              {subTabs.map((tab) => (
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
          <Table<AccessSubnet>
            {...tableProps}
            id="access-control-subnets"
            columns={[
              {
                title: translate('CIDR'),
                render: ({ row }) => <>{row.inet}</>,
              },
              {
                title: translate('Description'),
                render: ({ row }) => <>{row.description}</>,
              },
            ]}
            verboseName={translate('Access control')}
            hasQuery
            hasActionBar={false}
            cardBordered={false}
            rowActions={({ row }) => (
              <AccessSubnetRowActions row={row} refetch={tableProps.fetch} />
            )}
          />
        )}
        {activeKey === 'restrictions' && (
          <CustomerMembershipRestrictionsPanel customer={customer} />
        )}
      </Card.Body>
    </Card>
  );
};
