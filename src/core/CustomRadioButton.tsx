import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { FormLabel } from 'react-bootstrap';

import { FormField } from '@waldur/form/types';
import { Choice } from '@waldur/marketplace/offerings/types';

import { Tip } from './Tooltip';
import './CustomRadioButton.scss';

interface CustomRadioButtonProps extends FormField {
  choices: Choice[];
  direction?: 'vertical' | 'horizontal';
  align?: 'left' | 'center' | 'right';
}

export const CustomRadioButton: FunctionComponent<CustomRadioButtonProps> = ({
  choices,
  direction = 'vertical',
  align = 'center',
  ...props
}) => (
  <>
    {props.label && (
      <FormLabel
        htmlFor={props.input.name}
        className={props.disabled ? 'opacity-50' : undefined}
      >
        {props.label}
        {props.tooltip && (
          <Tip
            id={'tip-radio-' + props.input.name}
            label={props.tooltip}
            className="ms-2"
            autoWidth
          >
            <QuestionIcon weight="bold" size={16} />
          </Tip>
        )}
      </FormLabel>
    )}
    <div
      className={classNames(
        'custom-radio-button',
        direction,
        `radio-${align}`,
        props.disabled && 'disabled',
      )}
    >
      {choices.map((choice, index) => (
        <label key={index} className="d-flex mb-3">
          <input
            {...props.input}
            type="radio"
            value={choice.value}
            checked={props.input?.value === choice.value}
            {...props}
          />

          <div className="custom-checkmark" />
          <div className="radio-text">
            <span className="radio-label">{choice.label}</span>
            {Boolean(choice.description) && (
              <span className="radio-description">{choice.description}</span>
            )}
          </div>
        </label>
      ))}
    </div>
  </>
);
