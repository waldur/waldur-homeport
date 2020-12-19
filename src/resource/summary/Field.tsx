import React, { FunctionComponent } from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

export interface FieldProps {
  label: string;
  helpText?: string;
  value?: React.ReactNode;
  children?: React.ReactNode;
  valueClass?: string;
}

export const Field: FunctionComponent<FieldProps> = (props) =>
  props.value || props.children ? (
    <div className="m-b-xs">
      <dt>
        {props.label.length > 20 ? (
          <Tooltip label={props.label} id="fieldLabel">
            {props.label}:
          </Tooltip>
        ) : (
          props.label
        )}
      </dt>
      <dd className={props.valueClass}>
        {props.value || props.children}
        {props.helpText && (
          <Tooltip label={props.helpText} id="fieldHelpText">
            {' '}
            <i className="fa fa-question-circle" />
          </Tooltip>
        )}
      </dd>
    </div>
  ) : null;
