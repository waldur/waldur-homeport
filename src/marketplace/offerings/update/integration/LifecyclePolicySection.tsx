import { FC, useMemo } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';

import { useSettingsUrlSync } from '@waldur/administration/settings/useSettingsUrlSync';
import { NumberField, StringField } from '@waldur/form';
import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { DateField } from '@waldur/form/DateField';
import FormTable from '@waldur/form/FormTable';
import { translate } from '@waldur/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@waldur/marketplace-script/constants';

import {
  DefaultOfferingEditPanel,
  OfferingEditField,
} from '../DefaultOfferingEditPanel';

import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

// Order approval fields
const orderApprovalFields: OfferingEditField[] = [
  {
    label: translate('Auto approve in service provider projects'),
    key: 'plugin_options.auto_approve_in_service_provider_projects',
    component: AwesomeCheckboxField,
    description: translate(
      'Automatically approves orders in service provider projects without manual approval',
    ),
  },
  {
    label: translate('Disable auto-approval'),
    key: 'plugin_options.disable_autoapprove',
    component: AwesomeCheckboxField,
    description: translate(
      'When enabled, orders for this offering will always require manual approval, overriding the auto-approval setting above',
    ),
  },
];

const scriptAutoApprovalField: OfferingEditField = {
  label: translate('Auto-approve script orders'),
  key: 'plugin_options.auto_approve_marketplace_script',
  component: AwesomeCheckboxField,
  description: translate(
    'If enabled, orders for this script offering will be automatically approved without requiring manual provider approval. If disabled, orders will require manual approval by the service provider.',
  ),
};

// Resource lifecycle fields
const resourceLifecycleFields: OfferingEditField[] = [
  {
    label: translate('Resource termination date is required'),
    key: 'plugin_options.is_resource_termination_date_required',
    component: AwesomeCheckboxField,
    description: translate(
      'When enabled, uses default and maximal offset settings below to control date selection',
    ),
  },
  {
    label: translate('Default resource termination offset in days'),
    key: 'plugin_options.default_resource_termination_offset_in_days',
    component: NumberField,
    description: translate(
      'Used when termination date is required - sets default date selection',
    ),
  },
  {
    label: translate('Maximal resource termination offset in days'),
    key: 'plugin_options.max_resource_termination_offset_in_days',
    component: NumberField,
    description: translate(
      'Used when termination date is required - limits maximum selectable date',
    ),
  },
  {
    label: translate('Latest date for resource termination'),
    key: 'plugin_options.latest_date_for_resource_termination',
    component: DateField,
    description: translate(
      'Absolute latest date allowed for resource termination regardless of offset settings',
    ),
  },
  {
    label: translate('Resource expiration threshold'),
    key: 'plugin_options.resource_expiration_threshold',
    component: NumberField,
    description: translate('Resource expiration threshold in days.'),
  },
];

// Resource capabilities fields
const resourceCapabilitiesFields: OfferingEditField[] = [
  {
    label: translate('Supports downscaling'),
    key: 'plugin_options.supports_downscaling',
    component: AwesomeCheckboxField,
    description: translate(
      'Enables downscaling operations for resources created from this offering',
    ),
  },
  {
    label: translate('Supports pausing'),
    key: 'plugin_options.supports_pausing',
    component: AwesomeCheckboxField,
    description: translate(
      'Enables pausing/unpausing operations for resources created from this offering',
    ),
  },
  {
    label: translate('Create orders on resource option change'),
    key: 'plugin_options.create_orders_on_resource_option_change',
    component: AwesomeCheckboxField,
    description: translate(
      'Automatically creates new orders when configuration options of related resources are modified',
    ),
  },
  {
    label: translate('Enable SLURM periodic usage policy'),
    key: 'plugin_options.slurm_periodic_policy_enabled',
    component: AwesomeCheckboxField,
    description: translate(
      'When enabled, allows configuring QoS-based threshold enforcement, carryover logic, and fairshare decay for site-agent managed SLURM offerings.',
    ),
  },
];

// Provisioning fields
const provisioningFields: OfferingEditField[] = [
  {
    label: translate('Minimal team count for resource provisioning'),
    key: 'plugin_options.minimal_team_count_for_provisioning',
    component: NumberField,
    description: translate(
      'Minimum number of team members required in project to provision resources',
    ),
  },
  {
    label: translate('Required team role for resource provisioning'),
    key: 'plugin_options.required_team_role_for_provisioning',
    component: StringField,
    description: translate(
      'Specific team role required for users to provision resources from this offering',
    ),
  },
  {
    label: translate('Maximal resource count per project'),
    key: 'plugin_options.maximal_resource_count_per_project',
    component: NumberField,
    description: translate(
      'Limits the maximum number of resources from this offering allowed per project',
    ),
  },
];

// Purchase order fields
const purchaseOrderFields: OfferingEditField[] = [
  {
    label: translate('Enable purchase order upload'),
    key: 'plugin_options.enable_purchase_order_upload',
    component: AwesomeCheckboxField,
    description: translate(
      'Shows purchase order upload dialog during order approval process',
    ),
  },
  {
    label: translate('Require purchase order upload'),
    key: 'plugin_options.require_purchase_order_upload',
    component: AwesomeCheckboxField,
    description: translate(
      'Makes purchase order upload mandatory when "Enable purchase order upload" is active',
    ),
  },
];

// Billing fields
const billingFields: OfferingEditField[] = [
  {
    label: translate('Conceal billing data'),
    key: 'plugin_options.conceal_billing_data',
    component: AwesomeCheckboxField,
    description: translate(
      'Hides pricing and components tabs in offering details to conceal billing information',
    ),
  },
];

const LIFECYCLE_TABS = [
  { key: 'approval', title: translate('Order approval') },
  { key: 'lifecycle', title: translate('Resource lifecycle') },
  { key: 'capabilities', title: translate('Resource capabilities') },
  { key: 'provisioning', title: translate('Provisioning') },
  { key: 'purchase-orders', title: translate('Purchase orders') },
  { key: 'billing', title: translate('Billing') },
];

export const LifecyclePolicySection: FC<OfferingEditPanelProps> = (props) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  const { activeKey, handleSelect, defaultActiveKey } = useSettingsUrlSync(
    LIFECYCLE_TABS,
    'section',
  );

  const approvalFields = useMemo(() => {
    if (props.offering.type === OFFERING_TYPE_CUSTOM_SCRIPTS) {
      return [scriptAutoApprovalField, ...orderApprovalFields];
    }
    return orderApprovalFields;
  }, [props.offering.type]);

  return (
    <Card className="card-bordered">
      <Card.Body>
        <Tab.Container
          defaultActiveKey={defaultActiveKey}
          activeKey={activeKey}
          onSelect={handleSelect}
        >
          <Nav variant="tabs" className="nav-line-tabs mb-5">
            {LIFECYCLE_TABS.map((tab) => (
              <Nav.Item key={tab.key}>
                <Nav.Link eventKey={tab.key}>{tab.title}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
          <Tab.Content>
            {/* Order approval tab */}
            <Tab.Pane eventKey="approval" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={approvalFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>

            {/* Resource lifecycle tab */}
            <Tab.Pane eventKey="lifecycle" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={resourceLifecycleFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>

            {/* Resource capabilities tab */}
            <Tab.Pane eventKey="capabilities" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={resourceCapabilitiesFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>

            {/* Provisioning tab */}
            <Tab.Pane eventKey="provisioning" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={provisioningFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>

            {/* Purchase orders tab */}
            <Tab.Pane eventKey="purchase-orders" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={purchaseOrderFields}
                  callback={update}
                />
              </FormTable>
            </Tab.Pane>

            {/* Billing tab */}
            <Tab.Pane eventKey="billing" unmountOnExit>
              <FormTable>
                <DefaultOfferingEditPanel
                  offering={props.offering}
                  fields={billingFields}
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
