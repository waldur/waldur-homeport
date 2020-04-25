import { Option } from 'react-select';

export type AccountingPeriodOption = Option<{
  year: number;
  month: number;
  current: boolean;
}>;
