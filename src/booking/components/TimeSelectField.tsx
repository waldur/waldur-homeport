import * as classNames from 'classnames';
import * as React from 'react';
import Select from 'react-select';

import {getOptions} from '@waldur/form-react/TimeSelectField';

import { TimeSelectProps } from '../store/types';

export const TimeSelectField = (props: TimeSelectProps) => (
  <>
    {
      (props.label || props.icon) && <label
        htmlFor={`react-select-${props.name}--value`}
        className={classNames(
          'control-label',
          props.icon ? 'col-xs-1' : 'col-xs-2',
          { disabled: props.isDisabled }
          )}>
        {props.label || props.icon && <i className="fa fa-clock-o" />}
      </label>
    }
    <Select
      instanceId={props.name}
      className={classNames(
        props.className,
        props.label ? 'col-xs-4' : 'col-xs-5',
        { disabled: props.isDisabled }
        )}
      name={props.name}
      simpleValue={true}
      searchable={false}
      clearable={false}
      options={props.options || getOptions(30)}
      value={props.value}
      onChange={value => props.onChange(value)}
      disabled={props.isDisabled}
    />
  </>
);
