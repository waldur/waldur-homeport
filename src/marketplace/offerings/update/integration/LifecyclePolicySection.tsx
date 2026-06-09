import { FC } from 'react';

import {
  BooleanEditField,
  DateEditField,
  EditFieldProvider,
  NumberEditField,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@/marketplace-script/constants';

import { OfferingEditPanelProps } from './types';
import { useUpdateOfferingIntegration } from './utils';

const RESOURCE_PROJECTS_LIMIT_POLICY_OPTIONS = [
  {
    value: 'none',
    label: translate('None — limits accepted as-is, no parent comparison'),
  },
  {
    value: 'per_project',
    label: translate('Per project — each RP limit ≤ parent resource limit'),
  },
  {
    value: 'aggregate',
    label: translate(
      'Aggregate — sum of all RP limits ≤ parent resource limit',
    ),
  },
];

export const LifecyclePolicySection: FC<OfferingEditPanelProps> = (props) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  return (
    <EditFieldProvider scope={props.offering} callback={update}>
      <TabbedSection enableSearch>
        <TabbedSection.Tab id="orders" title={translate('Orders & approval')}>
          {props.offering.type === OFFERING_TYPE_CUSTOM_SCRIPTS && (
            <BooleanEditField
              name="plugin_options.auto_approve_marketplace_script"
              label={translate('Auto-approve script orders')}
              description={translate(
                'If enabled, orders for this script offering will be automatically approved without requiring manual provider approval. If disabled, orders will require manual approval by the service provider.',
              )}
            />
          )}
          <BooleanEditField
            name="plugin_options.auto_approve_in_service_provider_projects"
            label={translate('Auto approve in service provider projects')}
            description={translate(
              'Automatically approves orders in service provider projects without manual approval',
            )}
          />
          <BooleanEditField
            name="plugin_options.disable_autoapprove"
            label={translate('Disable auto-approval')}
            description={translate(
              'When enabled, orders for this offering will always require manual approval, overriding the auto-approval setting above',
            )}
          />
          <BooleanEditField
            name="plugin_options.enable_purchase_order_upload"
            label={translate('Enable purchase order upload')}
            description={translate(
              'Shows purchase order upload dialog during order approval process',
            )}
          />
          <BooleanEditField
            name="plugin_options.require_purchase_order_upload"
            label={translate('Require purchase order upload')}
            description={translate(
              'Makes purchase order upload mandatory during order approval. Also enables the upload dialog if not already enabled.',
            )}
          />
          <BooleanEditField
            name="plugin_options.enable_provider_consumer_messaging"
            label={translate('Enable provider-customer messaging')}
            description={translate(
              'Allows service providers to send messages with attachments to customers on pending orders, and customers to respond',
            )}
          />
          <BooleanEditField
            name="plugin_options.notify_about_provider_consumer_messages"
            label={translate('Send email notifications for messages')}
            description={translate(
              'Sends email notifications when providers or customers exchange messages on pending orders',
            )}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab
          id="lifecycle"
          title={translate('Resource lifecycle')}
        >
          <BooleanEditField
            name="plugin_options.is_resource_termination_date_required"
            label={translate('Resource termination date is required')}
            description={translate(
              'When enabled, uses default and maximal offset settings below to control date selection',
            )}
          />
          <NumberEditField
            name="plugin_options.default_resource_termination_offset_in_days"
            label={translate('Default resource termination offset in days')}
            description={translate(
              'Used when termination date is required - sets default date selection',
            )}
          />
          <NumberEditField
            name="plugin_options.max_resource_termination_offset_in_days"
            label={translate('Maximal resource termination offset in days')}
            description={translate(
              'Used when termination date is required - limits maximum selectable date',
            )}
          />
          <DateEditField
            name="plugin_options.latest_date_for_resource_termination"
            label={translate('Latest date for resource termination')}
            description={translate(
              'Absolute latest date allowed for resource termination regardless of offset settings',
            )}
          />
          <NumberEditField
            name="plugin_options.resource_expiration_threshold"
            label={translate('Resource expiration threshold')}
            description={translate('Resource expiration threshold in days.')}
          />
          <BooleanEditField
            name="plugin_options.restrict_deletion_with_active_resources"
            label={translate('Restrict deletion with active resources')}
            description={translate(
              'When enabled, offering cannot be deleted while it has non-terminated resources. Applies to all users including staff.',
            )}
          />
          <BooleanEditField
            name="plugin_options.supports_downscaling"
            label={translate('Supports downscaling')}
            description={translate(
              'Enables downscaling operations for resources created from this offering',
            )}
          />
          <BooleanEditField
            name="plugin_options.supports_pausing"
            label={translate('Supports pausing')}
            description={translate(
              'Enables pausing/unpausing operations for resources created from this offering',
            )}
          />
          <BooleanEditField
            name="plugin_options.create_orders_on_resource_option_change"
            label={translate('Create orders on resource option change')}
            description={translate(
              'Automatically creates new orders when configuration options of related resources are modified',
            )}
          />
          <BooleanEditField
            name="plugin_options.enable_resource_projects"
            label={translate('Enable resource projects')}
            description={translate(
              'When enabled, a Projects tab is shown on resource detail pages, allowing management of sub-projects within a resource',
            )}
          />
          <BooleanEditField
            name="plugin_options.auto_ok_resource_projects"
            label={translate('Auto-OK resource projects on creation')}
            description={translate(
              'When enabled, newly-created resource projects are immediately marked as OK on save, bypassing the provider/site-agent reconciliation callback. Use for offerings without an external backend to reconcile against.',
            )}
          />
          <SelectEditField
            name="plugin_options.resource_projects_limit_policy"
            label={translate('Resource project limit policy')}
            options={RESOURCE_PROJECTS_LIMIT_POLICY_OPTIONS}
            simpleValue
            isClearable
            description={translate(
              'How parent resource limits are enforced on child resource projects. Default is none.',
            )}
          />
          <BooleanEditField
            name="plugin_options.resource_projects_limits_required"
            label={translate('Require limits on resource projects')}
            description={translate(
              'When enabled, every limit-billing component must have a positive value when creating or updating a resource project. Use this for backends that reject projects without resource quotas (e.g. the rancher-keycloak-operator).',
            )}
          />
          <BooleanEditField
            name="plugin_options.slurm_periodic_policy_enabled"
            label={translate('Enable SLURM periodic usage policy')}
            description={translate(
              'When enabled, allows configuring QoS-based threshold enforcement, carryover logic, and fairshare decay for site-agent managed SLURM offerings.',
            )}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="provisioning" title={translate('Provisioning')}>
          <NumberEditField
            name="plugin_options.minimal_team_count_for_provisioning"
            label={translate('Minimal team count for resource provisioning')}
            description={translate(
              'Minimum number of team members required in project to provision resources',
            )}
          />
          <StringEditField
            name="plugin_options.required_team_role_for_provisioning"
            label={translate('Required team role for resource provisioning')}
            description={translate(
              'Specific team role required for users to provision resources from this offering',
            )}
            parse={(value) => value ?? null}
          />
          <NumberEditField
            name="plugin_options.maximal_resource_count_per_project"
            label={translate('Maximal resource count per project')}
            description={translate(
              'Limits the maximum number of resources from this offering allowed per project',
            )}
          />
          <StringEditField
            name="plugin_options.resource_name_pattern"
            label={translate('Resource name pattern')}
            description={translate(
              'Python format string for auto-generated resource names. Available variables: {customer_name}, {customer_slug}, {project_name}, {project_slug}, {offering_name}, {offering_slug}, {plan_name}, {counter}, {attributes[KEY]}.',
            )}
            parse={(value) => value ?? null}
          />
        </TabbedSection.Tab>

        <TabbedSection.Tab id="billing" title={translate('Billing')}>
          <BooleanEditField
            name="plugin_options.conceal_billing_data"
            label={translate('Conceal billing data')}
            description={translate(
              'Hides pricing and components tabs in offering details to conceal billing information',
            )}
          />
        </TabbedSection.Tab>
      </TabbedSection>
    </EditFieldProvider>
  );
};
