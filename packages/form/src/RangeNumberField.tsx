import { FunctionComponent } from 'react';
import { translate } from 'waldur-i18n-runtime';

import { BaseInputField } from './InputField';

interface RangeNumberFieldProps {
  input: any;
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
    <div className="flex items-center gap-2">
      <BaseInputField
        containerClassName="flex-1"
        type="number"
        min={min}
        placeholder={placeholder || translate('Min')}
        value={value.min ?? ''}
        onChange={(e) => handleChange('min', e.target.value)}
      />
      <span className="text-quaternary">–</span>
      <BaseInputField
        containerClassName="flex-1"
        type="number"
        min={min}
        placeholder={placeholder || translate('Max')}
        value={value.max ?? ''}
        onChange={(e) => handleChange('max', e.target.value)}
      />
    </div>
  );
};
