import { ChangeEvent, FC, useState } from 'react';
import { Form as BootstrapForm } from 'react-bootstrap';
import { useField } from 'react-final-form';

import { translate } from '@/i18n';

const CUSTOM_MODE = 'custom';

export const isNumericProtocol = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^\d+$/.test(value) &&
  Number(value) >= 0 &&
  Number(value) <= 255;

const NAMED_PROTOCOLS = new Set(['tcp', 'udp', 'icmp', 'any', '']);

const validateProtocol = (value: unknown) => {
  if (typeof value !== 'string' || NAMED_PROTOCOLS.has(value)) return;
  if (isNumericProtocol(value)) return;
  return translate('Protocol must be a number between 0 and 255.');
};

export const ProtocolField: FC<{ name: string }> = ({ name }) => {
  const { input, meta } = useField<string>(name, {
    validate: validateProtocol,
  });
  const value: string = input.value ?? '';

  // Track Custom mode separately so the number input stays visible while
  // empty: simply clearing the field value would make the select fall back
  // to the first option.
  const [customMode, setCustomMode] = useState(() => isNumericProtocol(value));
  const isCustom = customMode || isNumericProtocol(value);
  const mode = isCustom ? CUSTOM_MODE : value;
  const invalid = meta.touched && !!meta.error;

  const handleModeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value;
    if (next === CUSTOM_MODE) {
      setCustomMode(true);
      input.onChange('');
    } else {
      setCustomMode(false);
      input.onChange(next);
    }
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    input.onChange(e.target.value);
  };

  return (
    <BootstrapForm.Group as="td">
      <div className="d-flex gap-1">
        <BootstrapForm.Select
          value={mode}
          onChange={handleModeChange}
          onBlur={input.onBlur}
        >
          <option value="tcp">TCP</option>
          <option value="udp">UDP</option>
          <option value="icmp">ICMP</option>
          <option value="any">{translate('Any')}</option>
          <option value={CUSTOM_MODE}>{translate('Custom')}</option>
        </BootstrapForm.Select>
        {isCustom && (
          <BootstrapForm.Control
            type="number"
            min={0}
            max={255}
            step={1}
            value={value}
            onChange={handleNumberChange}
            onBlur={input.onBlur}
            placeholder="0-255"
            isInvalid={invalid}
            style={{ minWidth: '90px' }}
          />
        )}
      </div>
      {invalid && <div className="invalid-feedback d-block">{meta.error}</div>}
    </BootstrapForm.Group>
  );
};
