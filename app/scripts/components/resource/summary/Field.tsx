import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

export interface FieldProps {
  label: string;
  value?: React.ReactNode;
  valueClass?: string;
}

export const Field = (props: FieldProps) =>
  props.value ? (
    <div className="m-b-xs">
      <dt>
        {props.label.length > 20 ? (
          <Tooltip label={props.label} id="fieldLabel">
            {props.label}:
          </Tooltip>
        ) : props.label}
      </dt>
      <dd className={props.valueClass}>
        {props.value}
      </dd>
    </div>
  ) : null;
