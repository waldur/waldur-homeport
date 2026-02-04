import { FC, useMemo, useState } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';

import { EditSchedulesButton } from '@waldur/booking/EditSchedulesButton';
import { NumberField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { CommaSeparatedListField } from '@waldur/form/CommaSeparatedListField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '@waldur/marketplace/offerings/update/DefaultOfferingEditPanel';
import { GoogleCalendarActions } from '@waldur/marketplace/offerings/update/integration/GoogleCalendarActions';
import { RemoteActions } from '@waldur/marketplace/offerings/update/integration/RemoteActions';
import { OfferingEditPanelProps } from '@waldur/marketplace/offerings/update/integration/types';
import { useUpdateOfferingIntegration } from '@waldur/marketplace/offerings/update/integration/utils';

import { OpenStackExternalIpsField } from './OpenStackExternalIpsField';

// Filtering fields
const filteringFields: OfferingEditField[] = [
  {
    label: translate('Availability zone'),
    description: translate(
      'Default availability zone for provisioned instances.',
    ),
    key: 'service_attributes.availability_zone',
    component: StringField,
  },
  {
    label: translate('Flavor exclude regex'),
    description: translate(
      'Flavors matching this regex expression will not be pulled from the backend.',
    ),
    key: 'service_attributes.flavor_exclude_regex',
    component: StringField,
  },
  {
    label: translate('Blacklisted volume types'),
    description: translate(
      'List of comma-separated volume types which should not be possible to select when creating VM/Volume.',
    ),
    key: 'service_attributes.volume_type_blacklist',
    component: StringField,
  },
];

// Console access fields
const consoleFields: OfferingEditField[] = [
  {
    label: translate('Console type'),
    description: translate(
      'Type of console access protocol used by OpenStack (novnc, xvpvnc, spice-html5, rdp-html5, serial). Default: novnc.',
    ),
    key: 'service_attributes.console_type',
    component: StringField,
  },
  {
    label: translate('Console domain override'),
    description: translate(
      'A client-accessible domain name override in case OpenStack is returning an internal domain. Leave empty to use the domain returned by OpenStack.',
    ),
    key: 'service_attributes.console_domain_override',
    component: StringField,
  },
];

// Network fields
const networkFields: OfferingEditField[] = [
  {
    label: translate('Default DNS servers'),
    description: translate(
      'Default value for new subnets DNS name servers. Should be defined as list.',
    ),
    key: 'service_attributes.dns_nameservers',
    component: CommaSeparatedListField,
  },
  {
    label: translate('Create highly available Neutron routers'),
    key: 'service_attributes.create_ha_routers',
    component: AwesomeCheckboxField,
  },
];

// Operations fields
const operationsFields: OfferingEditField[] = [
  {
    label: translate('Allow live volume resize'),
    description: translate(
      'Allow live volume resize of system and data volumes.',
    ),
    key: 'service_attributes.live_resize_of_volumes_enabled',
    component: AwesomeCheckboxField,
  },
  {
    label: translate(
      'Maximum parallel executions of provisioning operations for instances',
    ),
    description: translate('Leave empty for unlimited.'),
    key: 'service_attributes.max_concurrent_provision_instance',
    component: NumberField,
  },
  {
    label: translate(
      'Maximum parallel executions of provisioning operations for volumes',
    ),
    description: translate('Leave empty for unlimited.'),
    key: 'service_attributes.max_concurrent_provision_volume',
    component: NumberField,
  },
  {
    label: translate(
      'Maximum parallel executions of provisioning operations for snapshots',
    ),
    description: translate('Leave empty for unlimited.'),
    key: 'service_attributes.max_concurrent_provision_snapshot',
    component: NumberField,
  },
];

// IP mapping fields
const ipMappingFields: OfferingEditField[] = [
  {
    label: translate('Mapping of floating to external IPs'),
    key: 'secret_options.ipv4_external_ip_mapping',
    component: OpenStackExternalIpsField,
    value: (value) =>
      value ? (
        <div className="text-pre">
          {value
            .map((item) => `${item.floating_ip}: ${item.external_ip}`)
            .join('\n')}
        </div>
      ) : (
        'N/A'
      ),
  },
];

const PROVISIONING_TABS = [
  { key: 'filtering', title: translate('Filtering') },
  { key: 'console', title: translate('Console access') },
  { key: 'network', title: translate('Network') },
  { key: 'operations', title: translate('Operations') },
  { key: 'limits', title: translate('Limits') },
  { key: 'ip-mapping', title: translate('IP mapping') },
];

export const OpenStackProvisioningConfigSection: FC<OfferingEditPanelProps> = (
  props,
) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  const [activeKey, setActiveKey] = useState(PROVISIONING_TABS[0].key);

  const limitsFields = useMemo(
    () =>
      (
        [
          {
            label: translate('Default internal network MTU'),
            description: translate(
              'MTU value for internal networks. Valid range: 68–9000. Leave empty to use the cloud default.',
            ),
            key: 'plugin_options.default_internal_network_mtu',
            component: NumberField,
          },
          props.offering.plugin_options?.storage_mode == 'dynamic' && {
            label: translate('Snapshot size limit'),
            key: 'plugin_options.snapshot_size_limit_gb',
            component: NumberField,
            description: translate(
              'Additional space to apply to storage quota to be used by snapshots. Leave empty for no limit.',
            ),
            fieldProps: { unit: 'GB' },
          },
          {
            label: translate('Maximum number of instances in a single tenant'),
            description: translate('Leave empty for no limit.'),
            key: 'plugin_options.max_instances',
            component: NumberField,
          },
          {
            label: translate('Maximum number of volumes in a single tenant'),
            description: translate('Leave empty for no limit.'),
            key: 'plugin_options.max_volumes',
            component: NumberField,
          },
        ] satisfies OfferingEditField[]
      ).filter(Boolean),
    [props.offering.plugin_options?.storage_mode],
  );

  return (
    <Card className="card-bordered">
      <Card.Header>
        <Card.Title>
          <h3>{translate('Provisioning configuration')}</h3>
        </Card.Title>
        <div className="card-toolbar flex-grow-1 justify-content-end gap-3">
          <EditSchedulesButton {...props} />
          <RemoteActions offering={props.offering} />
          <GoogleCalendarActions offering={props.offering} />
        </div>
      </Card.Header>
      <Card.Body>
        <Tab.Container
          activeKey={activeKey}
          onSelect={(key) => key && setActiveKey(key)}
        >
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {PROVISIONING_TABS.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <Tab.Content>
            <Tab.Pane eventKey="filtering" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={filteringFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>

            <Tab.Pane eventKey="console" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={consoleFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>

            <Tab.Pane eventKey="network" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={networkFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>

            <Tab.Pane eventKey="operations" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={operationsFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>

            <Tab.Pane eventKey="limits" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={limitsFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>

            <Tab.Pane eventKey="ip-mapping" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={ipMappingFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );
};
