import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo, useState } from 'react';
import { Card, Nav } from 'react-bootstrap';
import { OpenStackInstance, openstackPortsRetrieve } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { getUUID } from '@waldur/core/utils';
import { TableTabsContainer } from '@waldur/customer/list/TableTabsContainer';
import { translate } from '@waldur/i18n';
import { RefreshButton } from '@waldur/marketplace/offerings/update/components/RefreshButton';
import { TablePlaceholder } from '@waldur/table/TablePlaceholder';

import { OpenStackSecurityGroupsTable } from '../openstack-security-groups/OpenStackSecurityGroupsDialog';

import { UpdateSecurityGroupsButton } from './actions/update-security-groups/UpdateSecurityGroupsButton';
import { ManageSecurityGroupsButton } from './ManageSecurityGroupsButton';

interface OwnProps {
  resourceScope: OpenStackInstance;
  resource;
  refetch?(): void;
  isLoading?: boolean;
}

const Placeholder = ({ message, refetch }) => (
  <TablePlaceholder
    verboseName={translate('Security groups')}
    emptyMessage={message}
    clearSearch={null}
    fetch={refetch}
    hasRetry
  />
);

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

  const activePort = useMemo(() => {
    if (activeKey === 'resource') return null;
    const port = props.resourceScope.ports.find((p) =>
      p.fixed_ips.some((fip) => activeKey.includes(fip.ip_address)),
    );
    return port;
  }, [activeKey, props.resourceScope]);

  const activePortSecurityGroups = activePort?.security_groups || [];

  const {
    data: port,
    refetch: refetchPort,
    isLoading: isLoadingPort,
    isRefetching: isRefetchingPort,
    error: errorPort,
  } = useQuery({
    queryKey: ['portDetails', activePort?.url],
    queryFn: () =>
      activePort?.url
        ? openstackPortsRetrieve({
            path: { uuid: getUUID(activePort?.url) },
            query: {
              field: [
                'uuid',
                'name',
                'url',
                'security_groups',
                'tenant_uuid',
                'state',
                'resource_type',
              ],
            },
          }).then((res) => res.data)
        : null,
    refetchOnWindowFocus: false,
    staleTime: 60 * 1000,
  });

  return (
    <Card className="card card-table card-bordered">
      <Card.Header>
        <Card.Title>
          <span className="me-2">{translate('Security groups details')}</span>
          <RefreshButton
            refetch={activeKey === 'resource' ? props.refetch : refetchPort}
            loading={props.isLoading || isRefetchingPort}
          />
        </Card.Title>
        <div className="card-toolbar">
          {activeKey === 'resource' ? (
            <UpdateSecurityGroupsButton
              resource={props.resourceScope}
              refetch={props.refetch}
            />
          ) : port && !isLoadingPort ? (
            <UpdateSecurityGroupsButton
              resource={port}
              refetch={() => {
                props.refetch();
                refetchPort();
              }}
            />
          ) : null}

          <ManageSecurityGroupsButton resource={props.resource} />
        </div>
      </Card.Header>
      <Card.Body className="min-h-300px">
        {ports?.length > 0 && (
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
            {props.resourceScope.security_groups.length === 0 && (
              <Placeholder
                message={translate(
                  'Instance does not have any security groups yet.',
                )}
                refetch={props.refetch}
              />
            )}
            {props.resourceScope.security_groups.length > 0 && (
              <OpenStackSecurityGroupsTable
                securityGroups={props.resourceScope.security_groups}
              />
            )}
          </>
        ) : isLoadingPort ? (
          <LoadingSpinner />
        ) : errorPort ? (
          <LoadingErred loadData={refetchPort} />
        ) : !activePortSecurityGroups?.length ? (
          translate('Instance port does not have any security groups yet.')
        ) : (
          <>
            {activePortSecurityGroups.length === 0 && (
              <Placeholder
                message={translate(
                  'Instance port does not have any security groups yet.',
                )}
                refetch={props.refetch}
              />
            )}
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
