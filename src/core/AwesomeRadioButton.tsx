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
  // Bootstrap gap scale (0-5) between rows in vertical layout. Opt-in so the
  // default stacking of existing consumers is unchanged.
  gap?: number;
}

export const AwesomeRadioButton: FunctionComponent<AwesomeRadioButtonProps> = ({
  choices,
  direction = 'vertical',
  justify = 'start',
  size,
  gap,
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
          'd-flex flex-column': direction === 'vertical' && gap != null,
          [`gap-${gap}`]: direction === 'vertical' && gap != null,
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
                name={props.input.name}
                onBlur={props.input.onBlur}
                onFocus={props.input.onFocus}
                value={choice.value}
                checked={props.input?.value === choice.value}
                onChange={() => {
                  props.input.onChange(choice.value);
                }}
                disabled={props.disabled}
              />
              <Form.Check.Label htmlFor={choiceId}>
                <span className="d-flex align-items-center gap-2">
                  <span>{choice.label}</span>
                  {Boolean(choice.tooltip) && (
                    <Tip
                      id={`${choiceId}-tip`}
                      label={choice.tooltip}
                      className="text-muted"
                    >
                      <QuestionIcon weight="regular" size={16} />
                    </Tip>
                  )}
                </span>
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
