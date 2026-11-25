import { PlusIcon } from '@phosphor-icons/react';
import { FC, useEffect, useState } from 'react';

import {
  BaseButton,
  FormField,
  FormLabel,
  FormText,
  Input,
  NativeSelect,
} from 'waldur-ui';

import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { RemovalActionButton } from '@/table/RemovalActionButton';
import { SimpleTable } from '@/table/SimpleTable';

import {
  createEgressRule,
  formatEgressPorts,
  getDestinationTypeOptions,
  getProtocolOptions,
  K8sEgressRule,
  validateEgressDestination,
} from './k8sEgressRules';

const parsePorts = (
  text: string,
): Pick<K8sEgressRule, 'port_range_min' | 'port_range_max'> | null => {
  const trimmed = text.trim();
  if (!trimmed) {
    return { port_range_min: null, port_range_max: null };
  }
  const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(trimmed);
  if (!match) {
    return null;
  }
  const min = parseInt(match[1], 10);
  const max = match[2] ? parseInt(match[2], 10) : min;
  return { port_range_min: min, port_range_max: max };
};

const isValidPorts = (rule: K8sEgressRule) => {
  const { port_range_min: min, port_range_max: max } = rule;
  if (min === null || min === undefined) {
    return true;
  }
  return (
    min >= 1 &&
    min <= 65535 &&
    (max === null || max === undefined || (max >= min && max <= 65535)) &&
    rule.protocol !== 'ICMP'
  );
};

/** Ports as typed, committed on blur so a half-typed range is not rejected. */
const PortsInput: FC<{
  rule: K8sEgressRule;
  label: string;
  disabled: boolean;
  onChange: (ports: Partial<K8sEgressRule>) => void;
}> = ({ rule, label, disabled, onChange }) => {
  const formatted =
    rule.port_range_min === null || rule.port_range_min === undefined
      ? ''
      : formatEgressPorts(rule);
  const [text, setText] = useState(formatted);
  useEffect(() => setText(formatted), [formatted]);
  const parsed = parsePorts(text);
  return (
    <Input
      size="sm"
      value={text}
      disabled={disabled}
      placeholder={translate('Any')}
      aria-label={label}
      invalid={!parsed || !isValidPorts({ ...rule, ...parsed })}
      onChange={(event) => setText(event.target.value)}
      // Text that is not a port or range goes back to the ports in the
      // form, so what is shown is what will be sent.
      onBlur={() => (parsed ? onChange(parsed) : setText(formatted))}
    />
  );
};

/**
 * One rule as a small labelled grid: two columns in a narrow container such
 * as a dialog, one line of fields where there is room. A table row has too
 * little width per cell in a dialog to show a select's value.
 */
const RuleFields: FC<{
  rule: K8sEgressRule;
  position: number;
  allowDomains: boolean;
  onChange: (rule: K8sEgressRule) => void;
  onRemove: () => void;
}> = ({ rule, position, allowDomains, onChange, onRemove }) => {
  // Each control is named after its rule, so a screen reader can tell the
  // rules apart; the visible label stays the short field name.
  const label = (field: string) =>
    translate('{field} of egress rule {position}', { field, position });
  const change = (patch: Partial<K8sEgressRule>) =>
    onChange({ ...rule, ...patch });
  const typeOptions = getDestinationTypeOptions(
    allowDomains || rule.destination_type === 'domain',
  );
  const destinationError =
    rule.destination &&
    validateEgressDestination(rule.destination_type, rule.destination);
  const typeError =
    rule.destination_type === 'domain' && !allowDomains
      ? translate('This offering accepts network destinations only.')
      : undefined;
  return (
    <div
      className="@container rounded-lg border border-secondary p-3 mb-3"
      data-testid="k8s-egress-rule"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-secondary">
          {rule.name?.trim() ||
            translate('Egress rule {position}', { position })}
        </span>
        <RemovalActionButton
          size="sm"
          onClick={onRemove}
          aria-label={translate('Remove egress rule {position}', { position })}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 @2xl:grid-cols-12">
        <FormField className="@2xl:col-span-3">
          <FormLabel>{translate('Name')}</FormLabel>
          <Input
            size="sm"
            value={rule.name}
            aria-label={label(translate('Name'))}
            invalid={!rule.name?.trim()}
            onChange={(event) => change({ name: event.target.value })}
          />
        </FormField>
        <FormField className="@2xl:col-span-2">
          <FormLabel>{translate('Type')}</FormLabel>
          <NativeSelect
            size="sm"
            value={rule.destination_type}
            aria-label={label(translate('Destination type'))}
            invalid={Boolean(typeError)}
            onChange={(event) =>
              change({
                destination_type: event.target
                  .value as K8sEgressRule['destination_type'],
              })
            }
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField className="col-span-2 @2xl:col-span-3">
          <FormLabel>{translate('Destination')}</FormLabel>
          <Input
            size="sm"
            value={rule.destination}
            placeholder={
              rule.destination_type === 'domain'
                ? '*.example.com'
                : '10.0.0.0/8'
            }
            aria-label={label(translate('Destination'))}
            invalid={Boolean(destinationError)}
            onChange={(event) =>
              change({ destination: event.target.value.trim() })
            }
          />
          {(destinationError || typeError) && (
            <FormText className="text-danger">
              {typeError || destinationError}
            </FormText>
          )}
        </FormField>
        <FormField className="@2xl:col-span-2">
          <FormLabel>{translate('Protocol')}</FormLabel>
          <NativeSelect
            size="sm"
            value={rule.protocol || ''}
            aria-label={label(translate('Protocol'))}
            onChange={(event) =>
              change({
                protocol: event.target.value as K8sEgressRule['protocol'],
                ...(event.target.value === 'ICMP'
                  ? { port_range_min: null, port_range_max: null }
                  : {}),
              })
            }
          >
            {getProtocolOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField className="@2xl:col-span-2">
          <FormLabel>{translate('Ports')}</FormLabel>
          <PortsInput
            rule={rule}
            label={label(translate('Ports'))}
            disabled={rule.protocol === 'ICMP'}
            onChange={change}
          />
        </FormField>
      </div>
    </div>
  );
};

const getRuleKey = (rule: K8sEgressRule, index: number) =>
  rule.uuid || `rule-${index}`;

/**
 * Editable list of outbound destinations: a network or a domain each, with
 * protocol and ports optional (empty means any).
 */
export const K8sEgressRulesEditor: FC<{
  rules: K8sEgressRule[];
  onChange: (rules: K8sEgressRule[]) => void;
  allowDomains: boolean;
  emptyMessage?: string;
}> = ({ rules, onChange, allowDomains, emptyMessage }) => {
  const update = (index: number, rule: K8sEgressRule) =>
    onChange(rules.map((current, i) => (i === index ? rule : current)));
  const remove = (index: number) =>
    onChange(rules.filter((_, i) => i !== index));
  return (
    <div data-testid="k8s-egress-rules-editor">
      {rules.length ? (
        rules.map((rule, index) => (
          <RuleFields
            position={index + 1}
            key={getRuleKey(rule, index)}
            rule={rule}
            allowDomains={allowDomains}
            onChange={(updated) => update(index, updated)}
            onRemove={() => remove(index)}
          />
        ))
      ) : (
        <NoResult
          title={translate('No egress rules')}
          message={emptyMessage}
          noAction
        />
      )}
      <BaseButton
        className="mt-1"
        label={translate('Add egress rule')}
        onClick={() => onChange([...rules, createEgressRule()])}
        iconNode={<PlusIcon weight="bold" />}
        variant="tertiary"
      />
    </div>
  );
};

const getReadOnlyColumns = () => [
  { title: translate('Name'), render: ({ row }) => row.name },
  {
    title: translate('Type'),
    render: ({ row }) =>
      row.destination_type === 'domain'
        ? translate('Domain')
        : translate('Network'),
  },
  {
    title: translate('Destination'),
    render: ({ row }) => row.destination,
  },
  {
    title: translate('Protocol'),
    render: ({ row }) => row.protocol || translate('Any'),
  },
  {
    title: translate('Ports'),
    render: ({ row }) =>
      row.protocol === 'ICMP' ? DASH_ESCAPE_CODE : formatEgressPorts(row),
  },
];

/** A read-only list of egress rules, such as the offering's baseline. */
export const K8sEgressRulesList: FC<{ rules: K8sEgressRule[] }> = ({
  rules,
}) => (
  <SimpleTable
    columns={getReadOnlyColumns()}
    rows={rules.map((rule, index) => ({
      ...rule,
      uuid: getRuleKey(rule, index),
    }))}
  />
);
