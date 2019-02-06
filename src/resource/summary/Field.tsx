import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

export interface FieldProps {
  label: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  valueClass?: string;
}

export const Field: React.SFC<FieldProps> = (props: FieldProps) =>
  (props.value || props.children) ? (
    <div className="m-b-xs">
      <dt>
        {props.label.length > 20 ? (
          <Tooltip label={props.label} id="fieldLabel">
            {props.label}:
          </Tooltip>
        ) : props.label}
      </dt>
      <dd className={props.valueClass}>
        {props.value || props.children}
      </dd>
    </div>
  ) : null;
