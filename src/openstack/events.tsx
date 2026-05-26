import { FC } from 'react';

import { EventGroup } from '@/events/types';
import { getUserContext, UserContext } from '@/events/utils';
import { formatJsxTemplate, translate } from '@/i18n';

import { ResourcesEnum } from '../EventsEnums';

interface SecurityGroupRulePayload {
  direction: string;
  ethertype: string;
  protocol: string | null;
  from_port: number | null;
  to_port: number | null;
  cidr: string | null;
  description?: string;
  remote_group_name?: string | null;
  remote_group_uuid?: string | null;
}

interface ModifiedRuleEntry {
  old: SecurityGroupRulePayload;
  new: SecurityGroupRulePayload;
  changed_fields: string[];
}

export interface RulesChangedContext extends UserContext {
  security_group_name: string;
  security_group_uuid?: string;
  added_count: number;
  removed_count: number;
  modified_count: number;
  added_rules: SecurityGroupRulePayload[];
  removed_rules: SecurityGroupRulePayload[];
  modified_rules: ModifiedRuleEntry[];
  trigger: 'user_action' | 'backend_sync';
}

/**
 * Render a rule as a compact one-liner: "tcp 22-22 from 10.0.0.0/8 (ingress)"
 * or "icmp any from 0.0.0.0/0 (ingress)" for protocol-less rules.
 */
const formatSecurityGroupRule = (rule: SecurityGroupRulePayload) => {
  const protocol = rule.protocol || 'any';
  const portRange =
    rule.from_port === rule.to_port
      ? rule.from_port === null || rule.from_port === -1
        ? 'any'
        : String(rule.from_port)
      : `${rule.from_port ?? '?'}–${rule.to_port ?? '?'}`;
  const target = rule.remote_group_name
    ? `group ${rule.remote_group_name}`
    : rule.cidr || 'any';
  return `${protocol} ${portRange} from ${target} (${rule.direction})`;
};

/**
 * Inline diff renderer used inside the events tab's expanded row.
 * Mounted from ExpandableEventDetailsTable when the relevant fields are present.
 */
export const SecurityGroupRulesDiff: FC<{ context: RulesChangedContext }> = ({
  context,
}) => {
  const { added_rules, removed_rules, modified_rules } = context;
  if (
    !added_rules?.length &&
    !removed_rules?.length &&
    !modified_rules?.length
  ) {
    return null;
  }
  return (
    <div className="mt-3">
      {added_rules?.length > 0 && (
        <div className="mb-3">
          <strong className="text-success">
            {translate('Added rules ({count})', { count: added_rules.length })}
          </strong>
          <ul className="mb-0">
            {added_rules.map((rule, i) => (
              <li key={`a-${i}`} className="font-monospace">
                + {formatSecurityGroupRule(rule)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {removed_rules?.length > 0 && (
        <div className="mb-3">
          <strong className="text-danger">
            {translate('Removed rules ({count})', {
              count: removed_rules.length,
            })}
          </strong>
          <ul className="mb-0">
            {removed_rules.map((rule, i) => (
              <li key={`r-${i}`} className="font-monospace">
                − {formatSecurityGroupRule(rule)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {modified_rules?.length > 0 && (
        <div className="mb-3">
          <strong className="text-warning">
            {translate('Modified rules ({count})', {
              count: modified_rules.length,
            })}
          </strong>
          <ul className="mb-0">
            {modified_rules.map((entry, i) => (
              <li key={`m-${i}`} className="font-monospace">
                {formatSecurityGroupRule(entry.old)} →{' '}
                {formatSecurityGroupRule(entry.new)}{' '}
                <span className="text-muted">
                  [{entry.changed_fields.join(', ')}]
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const formatSecurityGroupRulesChangedEvent = (event: RulesChangedContext) => {
  const summary = translate(
    '{added} added, {removed} removed, {modified} modified',
    {
      added: event.added_count,
      removed: event.removed_count,
      modified: event.modified_count,
    },
  );

  if (event.trigger === 'backend_sync') {
    return translate(
      'Security group "{name}" rules synchronised from backend: {summary}.',
      { name: event.security_group_name, summary },
      formatJsxTemplate,
    );
  }

  const userContext = getUserContext(event);
  return translate(
    '{user_link} changed security group "{name}" rules: {summary}.',
    { ...userContext, name: event.security_group_name, summary },
    formatJsxTemplate,
  );
};

// ---------------------------------------------------------------------------
// Port security + allowed_address_pairs
// ---------------------------------------------------------------------------

interface AllowedAddressPair {
  ip_address: string | null;
  mac_address: string | null;
}

export interface AllowedAddressPairsChangedContext extends UserContext {
  port_name: string;
  added_count: number;
  removed_count: number;
  modified_count: number;
  added_pairs: AllowedAddressPair[];
  removed_pairs: AllowedAddressPair[];
  modified_pairs: { old: AllowedAddressPair; new: AllowedAddressPair }[];
  trigger: 'user_action';
}

const formatAllowedAddressPair = (pair: AllowedAddressPair) =>
  `${pair.ip_address ?? 'any'}${pair.mac_address ? ` @ ${pair.mac_address}` : ''}`;

export const AllowedAddressPairsDiff: FC<{
  context: AllowedAddressPairsChangedContext;
}> = ({ context }) => {
  const { added_pairs, removed_pairs, modified_pairs } = context;
  if (
    !added_pairs?.length &&
    !removed_pairs?.length &&
    !modified_pairs?.length
  ) {
    return null;
  }
  return (
    <div className="mt-3">
      {added_pairs?.length > 0 && (
        <div className="mb-3">
          <strong className="text-success">
            {translate('Added pairs ({count})', { count: added_pairs.length })}
          </strong>
          <ul className="mb-0">
            {added_pairs.map((p, i) => (
              <li key={`a-${i}`} className="font-monospace">
                + {formatAllowedAddressPair(p)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {removed_pairs?.length > 0 && (
        <div className="mb-3">
          <strong className="text-danger">
            {translate('Removed pairs ({count})', {
              count: removed_pairs.length,
            })}
          </strong>
          <ul className="mb-0">
            {removed_pairs.map((p, i) => (
              <li key={`r-${i}`} className="font-monospace">
                − {formatAllowedAddressPair(p)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {modified_pairs?.length > 0 && (
        <div className="mb-3">
          <strong className="text-warning">
            {translate('Modified pairs ({count})', {
              count: modified_pairs.length,
            })}
          </strong>
          <ul className="mb-0">
            {modified_pairs.map((entry, i) => (
              <li key={`m-${i}`} className="font-monospace">
                {formatAllowedAddressPair(entry.old)} →{' '}
                {formatAllowedAddressPair(entry.new)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const formatPortSecurityEnabledEvent = (event: any) => {
  const userContext = getUserContext(event);
  return translate(
    '{user_link} enabled port security on port "{port_name}".',
    { ...userContext, port_name: event.port_name },
    formatJsxTemplate,
  );
};

const formatPortSecurityDisabledEvent = (event: any) => {
  const userContext = getUserContext(event);
  return translate(
    '{user_link} disabled port security on port "{port_name}".',
    { ...userContext, port_name: event.port_name },
    formatJsxTemplate,
  );
};

const formatAllowedAddressPairsChangedEvent = (
  event: AllowedAddressPairsChangedContext,
) => {
  const summary = translate(
    '{added} added, {removed} removed, {modified} modified',
    {
      added: event.added_count,
      removed: event.removed_count,
      modified: event.modified_count,
    },
  );
  const userContext = getUserContext(event);
  return translate(
    '{user_link} updated allowed address pairs on port "{port_name}": {summary}.',
    { ...userContext, port_name: event.port_name, summary },
    formatJsxTemplate,
  );
};

// ---------------------------------------------------------------------------
// LBaaS lifecycle
// ---------------------------------------------------------------------------

const formatLbaasLifecycle = (kind: string, action: string) =>
  function formatter(event: any) {
    const userContext = getUserContext(event);
    if (action === 'updated' && event.changed_fields_str) {
      return translate(
        '{user_link} updated {kind} "{name}" ({fields}).',
        {
          ...userContext,
          kind,
          name: event.name,
          fields: event.changed_fields_str,
        },
        formatJsxTemplate,
      );
    }
    const verb =
      action === 'created'
        ? translate('created')
        : action === 'deleted'
          ? translate('deleted')
          : translate('updated');
    return translate(
      '{user_link} {verb} {kind} "{name}".',
      { ...userContext, verb, kind, name: event.name },
      formatJsxTemplate,
    );
  };

export const OpenStackEvents: EventGroup = {
  title: translate('OpenStack security group events'),
  events: [
    {
      key: ResourcesEnum.openstack_security_group_rules_changed,
      title: translate('Security group "{security_group_name}" rules changed.'),
      formatter: formatSecurityGroupRulesChangedEvent,
    },
    {
      key: ResourcesEnum.openstack_port_security_enabled,
      title: translate('Port security enabled on "{port_name}".'),
      formatter: formatPortSecurityEnabledEvent,
    },
    {
      key: ResourcesEnum.openstack_port_security_disabled,
      title: translate('Port security disabled on "{port_name}".'),
      formatter: formatPortSecurityDisabledEvent,
    },
    {
      key: ResourcesEnum.openstack_port_allowed_address_pairs_changed,
      title: translate('Allowed address pairs on port "{port_name}" changed.'),
      formatter: formatAllowedAddressPairsChangedEvent,
    },
    {
      key: ResourcesEnum.openstack_load_balancer_created,
      title: translate('Load balancer "{name}" created.'),
      formatter: formatLbaasLifecycle(translate('load balancer'), 'created'),
    },
    {
      key: ResourcesEnum.openstack_load_balancer_updated,
      title: translate('Load balancer "{name}" updated.'),
      formatter: formatLbaasLifecycle(translate('load balancer'), 'updated'),
    },
    {
      key: ResourcesEnum.openstack_load_balancer_deleted,
      title: translate('Load balancer "{name}" deleted.'),
      formatter: formatLbaasLifecycle(translate('load balancer'), 'deleted'),
    },
    {
      key: ResourcesEnum.openstack_listener_created,
      title: translate('Listener "{name}" created.'),
      formatter: formatLbaasLifecycle(translate('listener'), 'created'),
    },
    {
      key: ResourcesEnum.openstack_listener_updated,
      title: translate('Listener "{name}" updated.'),
      formatter: formatLbaasLifecycle(translate('listener'), 'updated'),
    },
    {
      key: ResourcesEnum.openstack_listener_deleted,
      title: translate('Listener "{name}" deleted.'),
      formatter: formatLbaasLifecycle(translate('listener'), 'deleted'),
    },
    {
      key: ResourcesEnum.openstack_pool_created,
      title: translate('Pool "{name}" created.'),
      formatter: formatLbaasLifecycle(translate('pool'), 'created'),
    },
    {
      key: ResourcesEnum.openstack_pool_updated,
      title: translate('Pool "{name}" updated.'),
      formatter: formatLbaasLifecycle(translate('pool'), 'updated'),
    },
    {
      key: ResourcesEnum.openstack_pool_deleted,
      title: translate('Pool "{name}" deleted.'),
      formatter: formatLbaasLifecycle(translate('pool'), 'deleted'),
    },
    {
      key: ResourcesEnum.openstack_pool_member_created,
      title: translate('Pool member "{name}" created.'),
      formatter: formatLbaasLifecycle(translate('pool member'), 'created'),
    },
    {
      key: ResourcesEnum.openstack_pool_member_updated,
      title: translate('Pool member "{name}" updated.'),
      formatter: formatLbaasLifecycle(translate('pool member'), 'updated'),
    },
    {
      key: ResourcesEnum.openstack_pool_member_deleted,
      title: translate('Pool member "{name}" deleted.'),
      formatter: formatLbaasLifecycle(translate('pool member'), 'deleted'),
    },
  ],
};
