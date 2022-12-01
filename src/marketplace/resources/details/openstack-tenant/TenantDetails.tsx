import classNames from 'classnames';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { get } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { OpenStackTenant } from '@waldur/openstack/openstack-tenant/types';

import { FlavorsSection } from './FlavorsSection';
import { FloatingIPsSection } from './FloatingIPsSection';
import { InstancesSection } from './InstancesSection';
import { NetworksSection } from './NetworksSection';
import { PortsSection } from './PortsSection';
import { RoutersSection } from './RoutersSection';
import { SecurityGroupsSection } from './SecurityGroupsSection';
import { ServerGroupsSection } from './ServerGroupsSection';
import { SnapshotsSection } from './SnapshotsSection';
import { SubnetsSection } from './SubnetsSection';
import { VolumesSection } from './VolumesSection';

interface TenantCounters {
  instances: number;
  server_groups: number;
  security_groups: number;
  flavors: number;
  images: number;
  volumes: number;
  snapshots: number;
  networks: number;
  floating_ips: number;
  ports: number;
  routers: number;
  subnets: number;
}

export const TenantDetails = ({ resource }) => {
  const { loading, error, value } = useAsync(async () => {
    const tenant = (await get<OpenStackTenant>(resource.scope)).data;
    const counters = (await get<TenantCounters>(resource.scope + 'counters/'))
      .data;
    return { tenant, counters };
  });

  const tabs = useMemo(
    () =>
      resource && value
        ? [
            {
              title: translate('Compute'),
              children: [
                {
                  title: translate('Instances'),
                  count: value.counters.instances,
                  component: InstancesSection,
                },
                {
                  title: translate('Flavors'),
                  count: value.counters.flavors,
                  component: FlavorsSection,
                },
                {
                  title: translate('Server groups'),
                  count: value.counters.server_groups,
                  component: ServerGroupsSection,
                },
              ],
            },
            {
              title: translate('Networking'),
              children: [
                {
                  title: translate('Routers'),
                  count: value.counters.routers,
                  component: RoutersSection,
                },
                {
                  title: translate('Networks'),
                  count: value.counters.networks,
                  component: NetworksSection,
                },
                {
                  title: translate('Subnets'),
                  count: value.counters.subnets,
                  component: SubnetsSection,
                },
                {
                  title: translate('Security groups'),
                  count: value.counters.security_groups,
                  component: SecurityGroupsSection,
                },
                {
                  title: translate('Floating IPs'),
                  count: value.counters.floating_ips,
                  component: FloatingIPsSection,
                },
                {
                  title: translate('Ports'),
                  count: value.counters.ports,
                  component: PortsSection,
                },
              ],
            },
            {
              title: translate('Storage'),
              children: [
                {
                  title: translate('Volumes'),
                  count: value.counters.volumes,
                  component: VolumesSection,
                },
                {
                  title: translate('Snapshots'),
                  count: value.counters.snapshots,
                  component: SnapshotsSection,
                },
              ],
            },
          ]
        : [],
    [resource, value],
  );

  const [selectedSection, selectSection] = useState<any>();

  useEffect(() => {
    Array.isArray(tabs) &&
      tabs.length > 0 &&
      selectSection(tabs[0].children[0]);
  }, [tabs]);

  if (loading) return <LoadingSpinner />;

  if (error) return <>{translate('Unable to load resource details.')}</>;

  return (
    <Row>
      <Col sm={4}>
        <div
          className="menu menu-rounded menu-column menu-active-bg menu-hover-bg menu-title-gray-700 fs-5 fw-semibold w-250px"
          id="#kt_aside_menu"
          data-kt-menu="true"
        >
          {tabs.map((tab, tabIndex) => (
            <Fragment key={tabIndex}>
              <div className="menu-item">
                <div className="menu-content pb-2">
                  <span className="menu-section text-muted text-uppercase fs-7 fw-bold">
                    {tab.title}
                  </span>
                </div>
              </div>
              <div className="menu-sub menu-sub-accordion show">
                {tab.children.map((section, sectionIndex) => (
                  <div
                    className="menu-item"
                    data-kt-menu-trigger="click"
                    data-kt-menu-permanent="true"
                    key={sectionIndex}
                  >
                    <a
                      className={classNames(
                        'menu-link active border-3 border-start',
                        selectedSection === section
                          ? 'border-primary'
                          : 'border-transparent',
                      )}
                      onClick={() => selectSection(section)}
                    >
                      <span className="menu-title">{section.title}</span>
                      <span className="menu-badge fs-7 fw-normal text-muted">
                        {section.count}
                      </span>
                    </a>
                  </div>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
      </Col>
      <Col sm={8}>
        {selectedSection && (
          <selectedSection.component resource={value.tenant} />
        )}
      </Col>
    </Row>
  );
};
