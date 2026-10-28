import React from 'react';

import { FormField, FormLabel } from 'waldur-ui';

interface StaticFieldProps {
  label: string;
  value: string;
  labelClass?: string;
  controlClass?: string;
}

export const StaticField: React.FC<StaticFieldProps> = ({
  label,
  value,
  labelClass = 'sm:w-3/12 md:w-4/12 lg:w-3/12',
  controlClass = 'sm:w-9/12 md:w-8/12',
}) => (
  <FormField>
    <FormLabel className={labelClass}>{label}</FormLabel>
    <div className={controlClass}>
      <p>{value}</p>
    </div>
  </FormField>
);
