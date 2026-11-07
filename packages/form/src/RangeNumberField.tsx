import { FunctionComponent } from 'react';
import { translate } from 'waldur-i18n-runtime';
import { NumberInput } from 'waldur-ui';

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

  const handleChange = (field: 'min' | 'max', raw: number | string) => {
    const num = raw === '' ? undefined : Number(raw);
    const next = { ...value, [field]: num };
    if (next.min === undefined && next.max === undefined) {
      input.onChange(undefined);
    } else {
      input.onChange(next);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1">
        <NumberInput
          min={min}
          showSteppers={false}
          placeholder={placeholder || translate('Min')}
          value={value.min ?? ''}
          onValueChange={(v) => handleChange('min', v)}
        />
      </div>
      <span className="text-quaternary">–</span>
      <div className="flex-1">
        <NumberInput
          min={min}
          showSteppers={false}
          placeholder={placeholder || translate('Max')}
          value={value.max ?? ''}
          onValueChange={(v) => handleChange('max', v)}
        />
      </div>
    </div>
  );
};
