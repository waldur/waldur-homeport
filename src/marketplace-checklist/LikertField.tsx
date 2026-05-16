import { FC, useMemo } from 'react';
import { Form } from 'react-bootstrap';

import { translate } from '@/i18n';

import { LikertConfig, LikertScaleLength } from './types';

const DEFAULT_LOW_LABEL = () => translate('Strongly disagree');
const DEFAULT_HIGH_LABEL = () => translate('Strongly agree');

const getMidLabels = (length: LikertScaleLength): string[] => {
  if (length === 3) {
    return [translate('Neither agree nor disagree')];
  }
  if (length === 7) {
    return [
      translate('Disagree'),
      translate('Somewhat disagree'),
      translate('Neither agree nor disagree'),
      translate('Somewhat agree'),
      translate('Agree'),
    ];
  }
  return [
    translate('Disagree'),
    translate('Neither agree nor disagree'),
    translate('Agree'),
  ];
};

interface LikertOption {
  value: number | 'na';
  label: string;
}

const getLikertOptions = (config: LikertConfig): LikertOption[] => {
  const length = (config.likert_scale_length ?? 5) as LikertScaleLength;
  const low = config.likert_low_label?.trim() || DEFAULT_LOW_LABEL();
  const high = config.likert_high_label?.trim() || DEFAULT_HIGH_LABEL();
  const mids = getMidLabels(length);
  const labels = [low, ...mids, high];
  const options: LikertOption[] = labels.map((label, index) => ({
    value: index,
    label,
  }));
  if (config.likert_allow_na) {
    options.push({ value: 'na', label: translate('N/A') });
  }
  return options;
};

interface LikertFieldProps {
  input: {
    name: string;
    value: number | 'na' | undefined;
    onChange: (value: number | 'na') => void;
  };
  question?: LikertConfig;
  disabled?: boolean;
  inline?: boolean;
}

export const LikertField: FC<LikertFieldProps> = ({
  input,
  question,
  disabled,
  inline,
}) => {
  const options = useMemo(() => getLikertOptions(question ?? {}), [question]);

  return (
    <div
      className={inline ? 'd-flex flex-wrap gap-4' : 'd-flex flex-column gap-2'}
      style={disabled ? { pointerEvents: 'none' } : undefined}
      aria-disabled={disabled || undefined}
    >
      {options.map((opt) => (
        <Form.Check
          key={String(opt.value)}
          type="radio"
          id={`${input.name}-${opt.value}`}
          name={input.name}
          checked={input.value === opt.value}
          onChange={() => input.onChange(opt.value)}
          label={opt.label}
          readOnly={disabled}
          tabIndex={disabled ? -1 : undefined}
        />
      ))}
    </div>
  );
};

export const LikertPreview: FC<{ config: LikertConfig }> = ({ config }) => (
  <LikertField
    input={{
      name: 'likert-preview',
      value: undefined,
      onChange: () => undefined,
    }}
    question={config}
    disabled
    inline
  />
);
