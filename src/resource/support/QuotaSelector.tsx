import { FunctionComponent } from 'react';
import Select from 'react-select';

import { QuotaChoice, QuotaList } from './types';

interface QuotaSelectorProps {
  quotas: QuotaList;
  value: QuotaChoice;
  handleChange(value): void;
  disabled?: boolean;
}

export const QuotaSelector: FunctionComponent<QuotaSelectorProps> = (props) => (
  <Select
    value={props.value}
    onChange={props.handleChange}
    options={props.quotas}
    getOptionValue={(option) => option.key}
    getOptionLabel={(option) => option.title}
    isDisabled={props.disabled}
    isClearable={false}
  />
);
