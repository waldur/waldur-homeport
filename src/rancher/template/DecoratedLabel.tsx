import * as React from 'react';

export const DecoratedLabel = ({
  label,
  required,
}: {
  label: string;
  required: boolean;
}) => (
  <>
    {label}
    {required && <span className="text-danger"> *</span>}
  </>
);
