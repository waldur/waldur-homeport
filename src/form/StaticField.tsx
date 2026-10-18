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
  labelClass = 'col-sm-3 col-md-4 col-lg-3',
  controlClass = 'col-sm-9 col-md-8',
}) => (
  <FormField>
    <FormLabel className={labelClass}>{label}</FormLabel>
    <div className={controlClass}>
      <p>{value}</p>
    </div>
  </FormField>
);
