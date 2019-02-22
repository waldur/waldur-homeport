import * as React from 'react';
import Select from 'react-select';

import { QuotaList, QuotaChoice } from './types';

interface QuotaSelectorProps {
  quotas: QuotaList;
  value: QuotaChoice;
  handleChange(value): void;
  disabled?: boolean;
}

export const QuotaSelector = (props: QuotaSelectorProps) => (
  <Select
    value={props.value}
    onChange={props.handleChange}
    options={props.quotas}
    labelKey="title"
    valueKey="key"
    disabled={props.disabled}
    clearable={false}
  />
);
