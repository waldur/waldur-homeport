import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { Form, FormLabel } from 'react-bootstrap';

import { FormField } from '@/form/types';
import { Choice } from '@/marketplace/offerings/types';

import { Tip } from './Tooltip';

interface AwesomeRadioButtonProps extends FormField {
  choices: Choice[];
  direction?: 'vertical' | 'horizontal';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  size?: 'sm' | 'lg';
}

export const AwesomeRadioButton: FunctionComponent<AwesomeRadioButtonProps> = ({
  choices,
  direction = 'vertical',
  justify = 'start',
  size,
  ...props
}) => {
  // Use the input name for generating unique IDs for each radio button
  const groupName = props.input.name;

  return (
    <div>
      {props.label && (
        <FormLabel
          className={classNames('mb-3', props.disabled ? 'opacity-50' : null)}
        >
          {props.label}
          {props.tooltip && (
            <Tip
              id={'tip-radio-' + groupName}
              label={props.tooltip}
              className="ms-2"
            >
              <QuestionIcon weight="bold" size={16} />
            </Tip>
          )}
        </FormLabel>
      )}
      <div
        className={classNames({
          'd-flex flex-wrap gap-3': direction === 'horizontal',
          [`justify-content-${justify}`]: direction === 'horizontal',
        })}
      >
        {choices.map((choice, index) => {
          const choiceId = `${groupName}-${choice.value}-${index}`;
          return (
            <Form.Check
              key={choiceId}
              type="radio"
              id={choiceId}
              className={classNames('form-check-custom form-check-start', {
                // This replicates the old "center" behavior where items grow to fill space
                'flex-grow-1':
                  direction === 'horizontal' && justify === 'center',
                [`form-check-${size}`]: !!size,
              })}
            >
              <Form.Check.Input
                type="radio"
                {...props.input} // Spreads name, onBlur, etc.
                value={choice.value}
                checked={props.input?.value === choice.value}
                onChange={() => {
                  props.input.onChange(choice.value);
                }}
                disabled={props.disabled}
              />
              <Form.Check.Label htmlFor={choiceId}>
                <span className="d-block">{choice.label}</span>
                {Boolean(choice.description) && (
                  <Form.Text>{choice.description}</Form.Text>
                )}
              </Form.Check.Label>
            </Form.Check>
          );
        })}
      </div>
    </div>
  );
};
