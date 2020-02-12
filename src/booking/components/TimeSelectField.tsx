import * as classNames from 'classnames';
import * as React from 'react';
import Select from 'react-select';

import {getOptions} from '@waldur/form-react/TimeSelectField';

import { TimeSelectProps } from '../store/types';

export const  TimeSelectField = (props: TimeSelectProps) => (
  <>
    {
      (props.label || props.icon) &&
      <label htmlFor={`react-select-${props.name}--value`} className={classNames(
        'control-label', 'col-sm-1', {disabled: props.isDisabled}
        )}>
        {props.label || <i className="fa fa-clock-o" />}
      </label>
    }
    <Select
      instanceId={props.name}
      className={classNames( props.className, props.label ? 'col-sm-5' : 'col-sm-6', { disabled: props.isDisabled } )}
      name={props.name}
      simpleValue={true}
      searchable={false}
      clearable={false}
      options={getOptions(30)}
      value={props.value}
      onChange={value => props.onChange(value)}
      disabled={props.isDisabled}
    />
  </>
);
