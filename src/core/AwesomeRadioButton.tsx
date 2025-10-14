import { QuestionIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent } from 'react';
import { FormLabel } from 'react-bootstrap';

import { FormField } from '@waldur/form/types';
import { Choice } from '@waldur/marketplace/offerings/types';

import { Tip } from './Tooltip';

interface AwesomeRadioButtonProps extends FormField {
  choices: Choice[];
  direction?: 'vertical' | 'horizontal';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

export const AwesomeRadioButton: FunctionComponent<AwesomeRadioButtonProps> = ({
  choices,
  direction = 'vertical',
  justify = 'start',
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
            <div
              key={choiceId}
              className={classNames(
                'form-check form-check-custom form-check-solid',
                {
                  // This replicates the old "center" behavior where items grow to fill space
                  'flex-grow-1':
                    direction === 'horizontal' && justify === 'center',
                },
              )}
            >
              <input
                {...props.input} // Spreads name, onBlur, onChange, etc.
                className="form-check-input"
                type="radio"
                id={choiceId}
                value={choice.value}
                checked={props.input?.value === choice.value}
                disabled={props.disabled}
              />
              <label className="form-check-label" htmlFor={choiceId}>
                <span className="fw-bold d-block">{choice.label}</span>
                {Boolean(choice.description) && (
                  <span className="text-muted">{choice.description}</span>
                )}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
