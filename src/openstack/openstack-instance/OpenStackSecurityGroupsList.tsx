import { FunctionComponent, useMemo, useState } from 'react';
import { Card, Nav } from 'react-bootstrap';
import { OpenStackInstance } from 'waldur-js-client';

import { TableTabsContainer } from '@waldur/customer/list/TableTabsContainer';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';

import { OpenStackSecurityGroupsTable } from '../openstack-security-groups/OpenStackSecurityGroupsDialog';

import { UpdateSecurityGroupsButton } from './actions/update-security-groups/UpdateSecurityGroupsButton';
import { ManageSecurityGroupsButton } from './ManageSecurityGroupsButton';

interface OwnProps {
  resourceScope: OpenStackInstance;
  resource;
  refetch?(): void;
  isLoading?: boolean;
}

export const OpenStackSecurityGroupsList: FunctionComponent<OwnProps> = (
  props,
) => {
  const [activeKey, setActiveKey] = useState('resource');

  const ports = useMemo(() => {
    if (!props.resourceScope?.ports) return [];
    return props.resourceScope.ports.map((port) =>
      port.fixed_ips.map((fip) => fip.ip_address).join(', '),
    );
  }, [props.resourceScope]);

  const activePortSecurityGroups = useMemo(() => {
    if (activeKey === 'resource') return [];
    const port = props.resourceScope.ports.find((p) =>
      p.fixed_ips.some((fip) => activeKey.includes(fip.ip_address)),
    );
    return port?.security_groups || [];
  }, [activeKey, props.resourceScope]);

  return (
    <Card className="card card-table card-bordered">
      <Card.Header>
        <Card.Title>
          <span className="me-2">{translate('Security groups details')}</span>
          <RefreshButton refetch={props.refetch} loading={props.isLoading} />
        </Card.Title>
        <div className="card-toolbar">
          {activeKey === 'resource' && (
            <UpdateSecurityGroupsButton
              resource={props.resourceScope}
              refetch={props.refetch}
            />
          )}

          <ManageSecurityGroupsButton resource={props.resource} />
        </div>
      </Card.Header>
      <Card.Body>
        {ports?.length && (
          <TableTabsContainer
            onSelect={setActiveKey}
            defaultActiveKey="resource"
          >
            <div className="overflow-auto">
              <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
                <Nav.Item className="text-nowrap">
                  <Nav.Link eventKey="resource">
                    {translate('Resource')}
                  </Nav.Link>
                </Nav.Item>
                {ports.map((tab) => (
                  <Nav.Item key={tab} className="text-nowrap">
                    <Nav.Link eventKey={tab}>{tab}</Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
            </div>
          </TableTabsContainer>
        )}
        {activeKey === 'resource' ? (
          <>
            {props.resourceScope.security_groups.length === 0 &&
              translate('Instance does not have any security groups yet.')}
            {props.resourceScope.security_groups.length > 0 && (
              <OpenStackSecurityGroupsTable
                securityGroups={props.resourceScope.security_groups}
              />
            )}
          </>
        ) : (
          <>
            {activePortSecurityGroups.length === 0 &&
              translate('Instance port does not have any security groups yet.')}
            {activePortSecurityGroups.length > 0 && (
              <OpenStackSecurityGroupsTable
                securityGroups={activePortSecurityGroups}
              />
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};
