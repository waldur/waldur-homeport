import {
  PencilSimpleIcon,
  PlusCircleIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Form, Alert } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { AccordionCard } from '@waldur/core/AccordionCard';
import { required } from '@waldur/core/validators';
import { SelectField, TextField } from '@waldur/form';
import { FormField } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { waitForConfirmation } from '@waldur/modal/actions';
import { validateIPv4CIDR } from '@waldur/openstack/openstack-security-groups/rule-editor/CIDRField';
import { ActionItem } from '@waldur/resource/actions/ActionItem';
import { ActionsDropdownComponent } from '@waldur/table/ActionsDropdown';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { useUser } from '@waldur/workspace/hooks';

import { validateNumberOrRange } from './multi-datacenter-k8s-types';

interface K8sSecurityRule {
  uuid: string;
  id: string;
  name: string;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  port_range_min: number;
  port_range_max: number;
  cidr: string;
  direction: 'ingress' | 'egress';
  description?: string;
}

interface K8sSecurityRulesFieldProps extends FormField {
  field: {
    label?: string;
    help_text?: string;
    required?: boolean;
    rule_type: 'public_access' | 'administrative_access';
  };
  className?: string;
}

const DEFAULT_RULES = {
  public_access: [
    {
      uuid: 'http-ingress',
      id: 'http-ingress',
      name: 'HTTP Ingress',
      protocol: 'TCP' as const,
      port_range_min: 80,
      port_range_max: 80,
      cidr: '0.0.0.0/0',
      direction: 'ingress' as const,
      description: 'Allow HTTP traffic from anywhere',
    },
    {
      uuid: 'https-ingress',
      id: 'https-ingress',
      name: 'HTTPS Ingress',
      protocol: 'TCP' as const,
      port_range_min: 443,
      port_range_max: 443,
      cidr: '0.0.0.0/0',
      direction: 'ingress' as const,
      description: 'Allow HTTPS traffic from anywhere',
    },
  ],
  administrative_access: [
    {
      uuid: 'ssh-admin',
      id: 'ssh-admin',
      name: 'SSH Access',
      protocol: 'TCP' as const,
      port_range_min: 22,
      port_range_max: 22,
      cidr: '10.0.0.0/8',
      direction: 'ingress' as const,
      description: 'SSH access from internal networks',
    },
    {
      uuid: 'k8s-api',
      id: 'k8s-api',
      name: 'Kubernetes API',
      protocol: 'TCP' as const,
      port_range_min: 6443,
      port_range_max: 6443,
      cidr: '10.0.0.0/8',
      direction: 'ingress' as const,
      description: 'Kubernetes API server access',
    },
  ],
};

const BlurableStringInput: React.FC<{
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  validate?: (value: string) => string | undefined;
}> = ({ value, placeholder, onChange, validate }) => {
  const [internalValue, setInternalValue] = useState(value);

  return (
    <Form.Control
      type="text"
      placeholder={placeholder}
      value={internalValue}
      className="h-35px"
      onChange={(e) => setInternalValue(e.target.value)}
      onBlur={() => onChange(internalValue)}
      onKeyDown={(e) => e.key === 'Enter' && onChange(internalValue)}
      isInvalid={Boolean(validate && validate(internalValue))}
    />
  );
};

const DescriptionInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [internalValue, setInternalValue] = useState(value);

  return (
    <TextField
      input={
        {
          name: 'description',
          value: internalValue,
          onChange: (e) => setInternalValue(e.target.value),
          onBlur: () => onChange(internalValue),
        } as any
      }
      placeholder={translate('Add description')}
    />
  );
};

const K8sSecurityRulesField: React.FC<K8sSecurityRulesFieldProps> = ({
  field,
  input,
  className,
}) => {
  const user = useUser();
  const rules: K8sSecurityRule[] = input?.value || [];

  const tableProps = useTable({
    table: 'SecurityRulesList',
    fetchData: () => Promise.resolve({ rows: rules }),
  });

  const addDefaultRules = () => {
    let defaultRules = DEFAULT_RULES[field.rule_type] || [];
    const existingRuleIds = new Set(rules.map((rule) => rule.uuid));

    // For administrative access rules, use user's IP address if available
    if (field.rule_type === 'administrative_access' && user?.ip_address) {
      const userCidr = `${user.ip_address}/32`; // Single IP address with /32 subnet
      defaultRules = defaultRules.map((rule) => ({
        ...rule,
        cidr: userCidr,
        description: `${rule.description} (your current IP: ${user.ip_address})`,
      }));
    }

    const newRules = defaultRules.filter(
      (rule) => !existingRuleIds.has(rule.id),
    );

    if (input?.onChange) {
      input.onChange([...rules, ...newRules]);
    }
    tableProps.fetch();
  };

  const addCustomRule = () => {
    const rule: K8sSecurityRule = {
      uuid: `custom-${Date.now()}`,
      id: `custom-${Date.now()}`,
      name: '',
      protocol: 'TCP',
      port_range_min: 80,
      port_range_max: 80,
      cidr: '0.0.0.0/0',
      direction: 'ingress',
      description: '',
    };

    if (input?.onChange) {
      input.onChange([...rules, rule]);
    }
    tableProps.fetch();
  };

  const editRuleField = (
    uuid: string,
    payload: Partial<Record<keyof K8sSecurityRule, any>>,
  ) => {
    if (!uuid) return;

    const index = rules.findIndex((rule) => rule.uuid === uuid);
    if (index === -1) return;

    const rule: K8sSecurityRule = {
      uuid: rules[index].uuid,
      id: rules[index].id,
      name: rules[index].name,
      protocol: rules[index].protocol || 'TCP',
      port_range_min: rules[index].port_range_min,
      port_range_max:
        rules[index].port_range_max || rules[index].port_range_min,
      cidr: rules[index].cidr || '0.0.0.0/0',
      direction: rules[index].direction || 'ingress',
      description: rules[index].description,
    };
    // Update the specific fields
    Object.keys(payload).forEach((key) => {
      rule[key] = payload[key];
    });

    if (input?.onChange) {
      const newRules = [...rules];
      newRules[index] = rule;
      input.onChange(newRules);
    }
  };

  const dispatch = useDispatch();
  const addDescription = async (ruleUuid: string) => {
    const rule = rules.find((rule) => rule.uuid === ruleUuid);
    let description = rule?.description || '';
    try {
      await waitForConfirmation(
        dispatch,
        translate('Description for security rule {name}', {
          name: rule?.name || DASH_ESCAPE_CODE,
        }),
        <DescriptionInput
          value={description}
          onChange={(v) => (description = v)}
        />,
        {
          positiveButton: translate('Confirm'),
          negativeButton: translate('Cancel'),
          iconNode: <PencilSimpleIcon weight="bold" />,
          type: 'primary',
        },
      );
    } catch {
      return;
    }
    editRuleField(ruleUuid, { description });
  };

  const removeRule = (ruleUuid: string) => {
    if (input?.onChange) {
      input.onChange(rules.filter((rule) => rule.uuid !== ruleUuid));
    }
    tableProps.fetch();
  };

  return (
    <AccordionCard
      title={field.label}
      subtitle={field.help_text}
      secondary
      defaultOpen
      className={classNames('bg-gray-50', className)}
      actions={
        <ActionsDropdownComponent
          variant="secondary"
          labeled
          label={
            <>
              <span className="svg-icon svg-icon-2">
                <PlusCircleIcon weight="bold" />
              </span>
              {translate('Add rule')}
            </>
          }
          drop="down"
        >
          <ActionItem title={translate('Custom rule')} action={addCustomRule} />
          <ActionItem
            title={
              field.rule_type === 'administrative_access' && user?.ip_address
                ? translate('Current API (Your IP: {ip})', {
                    ip: user.ip_address,
                  })
                : translate('Public access')
            }
            action={addDefaultRules}
          />
        </ActionsDropdownComponent>
      }
    >
      {rules.length === 0 ? (
        <Alert variant="info">
          {translate(
            'No security rules configured. Add default rules or create custom ones.',
          )}
        </Alert>
      ) : (
        <div>
          <Table<K8sSecurityRule>
            {...tableProps}
            rows={rules}
            columns={[
              {
                title: translate('Rule name'),
                render: ({ row }) => (
                  <BlurableStringInput
                    value={row.name}
                    placeholder={translate('Add name')}
                    onChange={(v) => editRuleField(row.uuid, { name: v })}
                    validate={required}
                  />
                ),
                width: 'auto',
              },
              {
                title: translate('Protocol'),
                render: ({ row }) => (
                  <SelectField
                    input={{
                      name: 'protocol_' + row.uuid,
                      value: row.protocol || 'TCP',
                      onChange: (v) => editRuleField(row.uuid, { protocol: v }),
                    }}
                    options={[
                      { value: 'TCP', label: 'TCP' },
                      { value: 'UDP', label: 'UDP' },
                      { value: 'ICMP', label: 'ICMP' },
                    ]}
                    simpleValue
                    className="select-table-cell"
                  />
                ),
                width: '16%',
              },
              {
                title: translate('Port range'),
                render: ({ row }) => (
                  <BlurableStringInput
                    value={
                      row.port_range_min === row.port_range_max
                        ? String(row.port_range_min)
                        : `${row.port_range_min}-${row.port_range_max}`
                    }
                    placeholder={translate('Min-max')}
                    onChange={(v) => {
                      let min, max;
                      if (!v) {
                        min = '';
                        max = '';
                      } else {
                        const parts = v.split('-').map((part) => part.trim());
                        min = parseInt(parts[0]);
                        max = parts.length > 1 ? parseInt(parts[1]) : min;
                      }
                      editRuleField(row.uuid, {
                        port_range_min: min,
                        port_range_max: max,
                      });
                    }}
                    validate={validateNumberOrRange}
                  />
                ),
                width: '17%',
              },
              {
                title: translate('Direction'),
                render: ({ row }) => (
                  <SelectField
                    input={{
                      name: 'direction_' + row.uuid,
                      value: row.direction || 'ingress',
                      onChange: (v) =>
                        editRuleField(row.uuid, { direction: v }),
                    }}
                    options={[
                      { value: 'ingress', label: 'Ingress' },
                      { value: 'egress', label: 'Egress' },
                    ]}
                    simpleValue
                    className="select-table-cell"
                  />
                ),
                width: '16%',
              },
              {
                title: translate('CIDR'),
                render: ({ row }) => (
                  <BlurableStringInput
                    value={row.cidr}
                    placeholder={translate('0.0.0.0/0')}
                    onChange={(v) => editRuleField(row.uuid, { cidr: v })}
                    validate={validateIPv4CIDR}
                  />
                ),
                width: '18%',
              },
            ]}
            verboseName={translate('Security rules')}
            hasActionBar={false}
            minHeight="auto"
            equalColWidth
            fullWidth
            cardBordered={false}
            className="bg-gray-50 mt-n5 pb-0"
            rowActions={({ row }) => (
              <ActionsDropdownComponent>
                <ActionItem
                  title={translate('Remove')}
                  iconNode={<TrashIcon weight="bold" />}
                  action={() => removeRule(row.uuid)}
                />
                <ActionItem
                  title={
                    row.description
                      ? translate('Edit description')
                      : translate('Add description')
                  }
                  iconNode={
                    row.description ? (
                      <PencilSimpleIcon weight="bold" />
                    ) : (
                      <PlusCircleIcon weight="bold" />
                    )
                  }
                  action={() => addDescription(row.uuid)}
                />
              </ActionsDropdownComponent>
            )}
          />
        </div>
      )}
    </AccordionCard>
  );
};

export default K8sSecurityRulesField;
