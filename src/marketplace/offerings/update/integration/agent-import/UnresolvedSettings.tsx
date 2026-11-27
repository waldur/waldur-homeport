import { FC } from 'react';

import {
  Code,
  FormField,
  FormLabel,
  FormText,
  Input,
  NativeSelect,
  NumberInput,
  Switch,
} from 'waldur-ui';

import { translate } from '@/i18n';

import { AgentConfigurationUnresolved } from './api';
import { PlaceholderType } from './importModel';

interface ValueControlProps {
  path: string;
  type: PlaceholderType | undefined;
  value: string | undefined;
  disabled: boolean;
  onChange(value: string): void;
}

// The control for a setting's value, by its type where it is known. The
// value is kept as text and typed when it is sent.
const ValueControl: FC<ValueControlProps> = ({
  path,
  type,
  value,
  disabled,
  onChange,
}) => {
  const kind = type?.kind;
  if (kind === 'enum' && type.options?.length) {
    // The options as text; the one chosen is sent as the option itself.
    return (
      <NativeSelect
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-label={path}
      >
        <option value="">{translate('Choose...')}</option>
        {type.options.map((option) => (
          <option key={String(option)} value={String(option)}>
            {String(option)}
          </option>
        ))}
      </NativeSelect>
    );
  }
  if (kind === 'boolean') {
    return (
      <Switch
        checked={value === 'true'}
        onCheckedChange={(checked) => onChange(String(checked))}
        disabled={disabled}
        aria-label={path}
      />
    );
  }
  if (kind === 'integer' || kind === 'number') {
    return (
      <NumberInput
        value={value ?? ''}
        onValueChange={(next) => onChange(String(next))}
        step={kind === 'integer' ? 1 : 'any'}
        disabled={disabled}
        aria-label={path}
      />
    );
  }
  return (
    <Input
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-label={path}
    />
  );
};

interface UnresolvedSettingsProps {
  unresolved: AgentConfigurationUnresolved[];
  types: Record<string, PlaceholderType | undefined>;
  values: Record<string, string>;
  checking: boolean;
  onValueChange(path: string, value: string): void;
}

/**
 * The settings the file leaves as environment placeholders, `${NAME}`, which
 * the agent fills in on its host. Waldur holds the value itself, so it is
 * asked for here.
 */
export const UnresolvedSettings: FC<UnresolvedSettingsProps> = ({
  unresolved,
  types,
  values,
  checking,
  onValueChange,
}) => (
  <div className="mb-5" data-testid="import-unresolved">
    <h3 className="text-base font-semibold mb-2">
      {translate('Settings to fill in')}
    </h3>
    <p className="text-secondary mb-3">
      {translate(
        'The file takes these settings from environment variables on the agent host. Enter the values Waldur should hold, then check the configuration again.',
      )}
    </p>
    {unresolved.map(({ path, placeholder }) => (
      <FormField key={path} className="mb-3">
        <FormLabel required={types[path]?.kind !== 'boolean'}>
          <Code>{path}</Code>
        </FormLabel>
        <ValueControl
          path={path}
          type={types[path]}
          value={values[path]}
          disabled={checking}
          onChange={(value) => onValueChange(path, value)}
        />
        <FormText variant="muted">
          {translate('In the file: {placeholder}', {
            placeholder: `\${${placeholder}}`,
          })}
        </FormText>
      </FormField>
    ))}
  </div>
);
