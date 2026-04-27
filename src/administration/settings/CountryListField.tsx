import { FunctionComponent } from 'react';

import { translate } from '@/i18n';

interface CountryListFieldProps {
  value: string[];
}

export const CountryListField: FunctionComponent<CountryListFieldProps> = ({
  value = [],
}) => (
  <span className="text-muted">
    {translate('{count} countries selected', {
      count: Array.isArray(value) ? value.length : 0,
    })}
  </span>
);
