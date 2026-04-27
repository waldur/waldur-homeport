import { FunctionComponent } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

import { translate } from '@/i18n';

interface RangeNumberFieldProps {
  input: {
    value: { min?: number; max?: number };
    onChange: (value: { min?: number; max?: number } | undefined) => void;
  };
  min?: number;
  placeholder?: string;
}

export const RangeNumberField: FunctionComponent<RangeNumberFieldProps> = ({
  input,
  min = 0,
  placeholder,
}) => {
  const value = input.value || {};

  const handleChange = (field: 'min' | 'max', raw: string) => {
    const num = raw === '' ? undefined : Number(raw);
    const next = { ...value, [field]: num };
    if (next.min === undefined && next.max === undefined) {
      input.onChange(undefined);
    } else {
      input.onChange(next);
    }
  };

  return (
    <InputGroup>
      <Form.Control
        type="number"
        min={min}
        placeholder={placeholder || translate('Min')}
        value={value.min ?? ''}
        onChange={(e) => handleChange('min', e.target.value)}
      />
      <InputGroup.Text>–</InputGroup.Text>
      <Form.Control
        type="number"
        min={min}
        placeholder={placeholder || translate('Max')}
        value={value.max ?? ''}
        onChange={(e) => handleChange('max', e.target.value)}
      />
    </InputGroup>
  );
};
