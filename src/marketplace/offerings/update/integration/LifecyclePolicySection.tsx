import { FC, useMemo } from 'react';

import { maxItems } from '@/core/validators';
import {
  BooleanEditField,
  CommaSeparatedListEditField,
  DateEditField,
  EditFieldProvider,
  NumberEditField,
  SelectEditField,
  StringEditField,
} from '@/form/editFields';
import { TabbedSection } from '@/form/TabbedSection';
import { translate } from '@/i18n';
import { OFFERING_TYPE_CUSTOM_SCRIPTS } from '@/marketplace-script/constants';
import { Role } from '@/permissions/types';
import { getRoleLabels, getRoles } from '@/permissions/utils';

import { OfferingEditPanelProps } from './types';
import {
  canSeeOfferingSecretOptions,
  useUpdateOfferingIntegration,
} from './utils';

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

// Mirrors MAX_ORDER_NOTIFICATION_EMAILS / MAX_ORDER_NOTIFICATION_ROLES in the
// marketplace serializers, which reject a longer list with a 400.
const MAX_ORDER_NOTIFICATION_RECIPIENTS = 10;

const ACTION_ON_USAGE_LIMIT_OPTIONS = [
  {
    value: 'pause',
    label: translate('Pause — pause resources on reaching the limit'),
  },
  {
    value: 'downscale',
    label: translate('Downscale — downscale resources on reaching the limit'),
  },
];

export const LifecyclePolicySection: FC<OfferingEditPanelProps> = (props) => {
  const { update } = useUpdateOfferingIntegration(
    props.offering,
    props.refetch,
  );

  const roleOptions = useMemo(() => getRoles(['project', 'customer']), []);
  const roleLabels = useMemo(() => getRoleLabels(roleOptions), [roleOptions]);

  // Order notification roles are resolved on the provider side — on the
  // offering's organization and on the offering itself — so they are picked
  // from a different role list than the consumer-side options above.
  const providerRoleOptions = useMemo(
    () => getRoles(['customer', 'offering']),
    [],
  );
  const providerRoleLabels = useMemo(
    () => getRoleLabels(providerRoleOptions),
    [providerRoleOptions],
  );

  // Both order-notification options live in secret_options, which the backend
  // omits from the payload for anyone who is not an owner or service manager of
  // the provider organization — even though such a user may still hold the
  // permission to PATCH integration settings. Editing them from an empty render
  // would overwrite recipients the user cannot see.
  const secretOptionsHidden = !canSeeOfferingSecretOptions(props.offering);
  const secretOptionsHiddenReason = translate(
    'Only owners and service managers of the provider organization can view or change this setting.',
  );

  return (
    <EditFieldProvider scope={props.offering} callback={update}>
      <TabbedSection enableSearch>
        <TabbedSection.Tab id="orders" title={translate('Orders & approval')}>
          <SelectEditField
            name="plugin_options.restricted_to_roles"
            label={translate('Restrict to roles')}
            options={roleOptions}
            getOptionLabel={(role: Role) => role.description || role.name}
            getOptionValue={({ name }) => name}
            renderValue={(value) =>
              Array.isArray(value) && value.length
                ? value.map((name) => roleLabels[name] || name).join(', ')
                : undefined
            }
            simpleValue
            isMulti
            isClearable
            description={translate(
              'If set, only users holding one of these project or organization roles can see and order this offering; other users will not see it in the catalog. Whether their orders skip consumer approval still depends on the role having the order-approval permission. Leave empty for no restriction.',
            )}
          />
          <SelectEditField
            name="plugin_options.auto_approve_for_roles"
            label={translate('Auto-approve for roles')}
            options={roleOptions}
            getOptionLabel={(role: Role) => role.description || role.name}
            getOptionValue={({ name }) => name}
            renderValue={(value) =>
              Array.isArray(value) && value.length
                ? value.map((name) => roleLabels[name] || name).join(', ')
                : undefined
            }
            simpleValue
            isMulti
            isClearable
            isStaffOnly
            description={translate(
              'Orders created by users holding one of these project or organization roles (on the target project or its organization) skip consumer approval for this offering, regardless of the order-approval permission. Provider review and purchase-order requirements still apply. Independent of the visibility restriction above. Staff-only setting.',
            )}
          />
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
          <SelectEditField
            name="secret_options.order_notification_roles"
            label={translate('Notify roles about new orders')}
            options={providerRoleOptions}
            getOptionLabel={(role: Role) => role.description || role.name}
            getOptionValue={({ name }) => name}
            renderValue={(value) =>
              Array.isArray(value) && value.length
                ? value
                    .map((name) => providerRoleLabels[name] || name)
                    .join(', ')
                : undefined
            }
            simpleValue
            isMulti
            isClearable
            validate={maxItems(MAX_ORDER_NOTIFICATION_RECIPIENTS)}
            disabled={secretOptionsHidden}
            tooltip={
              secretOptionsHidden ? secretOptionsHiddenReason : undefined
            }
            description={translate(
              'Holders of these roles are emailed about every new order for this offering, regardless of whether the order needs approval. Names are resolved on your organization and on the offering itself. Users who disabled notifications in their profile are skipped. At most {n} roles. Visible only to owners and service managers of your organization.',
              { n: MAX_ORDER_NOTIFICATION_RECIPIENTS },
            )}
          />
          <CommaSeparatedListEditField
            name="secret_options.order_notification_emails"
            label={translate('Notify addresses about new orders')}
            validate={maxItems(MAX_ORDER_NOTIFICATION_RECIPIENTS)}
            disabled={secretOptionsHidden}
            tooltip={
              secretOptionsHidden ? secretOptionsHiddenReason : undefined
            }
            description={translate(
              'Email addresses notified about every new order for this offering, regardless of whether the order needs approval. Intended for mailboxes which do not belong to a Waldur user, so these addresses are notified even if a user with the same address disabled notifications. At most {n} addresses, comma-separated. Visible only to owners and service managers of your organization.',
              { n: MAX_ORDER_NOTIFICATION_RECIPIENTS },
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
            name="plugin_options.can_restore_resource"
            label={translate('Allow restoring terminated resources')}
            description={translate(
              'When enabled, a terminated resource can be restored back to an active state instead of creating a new one.',
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
          <SelectEditField
            name="plugin_options.action_on_usage_limit"
            label={translate('Action on usage limit')}
            options={ACTION_ON_USAGE_LIMIT_OPTIONS}
            simpleValue
            isClearable
            description={translate(
              'When set, resources are automatically paused or downscaled once reported usage in the current period reaches a limit-based component’s limit, and the restriction is lifted when usage drops below it again. Leave empty to disable.',
            )}
          />
          <BooleanEditField
            name="plugin_options.disable_grace_period"
            label={translate('Disable grace period')}
            isStaffOnly
            description={translate(
              "When enabled, this offering's resources ignore the project grace period and are terminated on the project end date. Staff-only setting.",
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
            name="plugin_options.enable_resource_end_date_change_requests"
            label={translate('Enable resource end date change requests')}
            description={translate(
              'Lets users who may not change a resource end date themselves ask for it. Holders of the end date permission approve or reject on the resource, and approval applies the date immediately. Requests are also published as events, so an external approval system can decide instead. Does not apply to prepaid offerings, which extend through renewal instead.',
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
            name="plugin_options.enable_resource_access_subnets"
            label={translate('Enable resource access subnets')}
            description={translate(
              'When enabled, an Access subnets tab is shown on resource detail pages, letting consumers curate the IPs allowed to reach the backend entity. The list is advisory data for external firewalls.',
            )}
          />
          <BooleanEditField
            name="plugin_options.conceal_subnet_restricted_resources"
            label={translate('Conceal subnet-restricted resources')}
            description={translate(
              'When enabled, a resource of this offering that has access subnets is hidden from the consumer API unless the caller’s IP is in the resource’s allow-list. Staff and support are exempt; resources without any subnet stay visible.',
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
          <StringEditField
            name="plugin_options.resource_slug_template"
            label={translate('Resource slug template')}
            description={translate(
              'Template for auto-generated resource slugs, overriding the default 10-character slugified name. Available variables: {customer_slug}, {project_slug}, {project_name}, {offering_slug}, {year}, {month}, {counter}, {counter_padded}.',
            )}
            warnTooltip={
              props.offering.plugin_options?.resource_slug_template &&
              props.offering.plugin_options?.account_name_generation_policy ===
                'project_slug'
                ? translate(
                    'Warning: the "Project slug" account name generation policy (User management) ignores this slug template and appends its own counter to the backend ID. Clear that policy to use the unique slug directly.',
                  )
                : null
            }
            parse={(value) => value ?? null}
          />
          <NumberEditField
            name="plugin_options.resource_slug_max_length"
            label={translate('Resource slug maximum length')}
            description={translate(
              'Maximum length of auto-generated resource slugs derived from the resource name, overriding the default of 10 characters (up to 40). Ignored when a resource slug template is set.',
            )}
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
