import React, { FunctionComponent } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

interface FilterChoice {
  label: React.ReactNode;
  value: string;
}

interface ToogleButtonFilterProps {
  defaultValue?: any[];
  choices: FilterChoice[];
  value: any;
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
      <ToggleButton
        key={index}
        value={choice.value}
        size="sm"
        id={choice.value}
      >
        {choice.label}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);
