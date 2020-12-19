import React, { FunctionComponent } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

interface FilterChoice {
  label: React.ReactNode;
  value: string;
}

interface ToogleButtonFilterProps {
  defaultValue?: string | string[];
  choices: FilterChoice[];
  value: string;
  onChange(values: any[]): void;
}

export const ToogleButtonFilter: FunctionComponent<ToogleButtonFilterProps> = (
  props,
) => (
  <ToggleButtonGroup
    type="checkbox"
    defaultValue={props.defaultValue}
    value={props.value}
    onChange={props.onChange}
  >
    {props.choices.map((choice, index) => (
      <ToggleButton key={index} value={choice.value} bsSize="small">
        {choice.label}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);
