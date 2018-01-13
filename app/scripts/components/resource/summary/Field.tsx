import * as React from 'react';

export interface FieldProps {
  label: string;
  value?: React.ReactNode;
  valueClass?: string;
}

export const Field = (props: FieldProps) =>
  props.value ? (
    <div className="m-b-xs">
      <dt>
        {props.label}:
      </dt>
      <dd className={props.valueClass}>
        {props.value}
      </dd>
    </div>
  ) : null;
