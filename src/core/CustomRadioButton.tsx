import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { FormField } from '@waldur/form/types';
import { Choice } from '@waldur/marketplace/offerings/types';
import './CustomRadioButton.scss';

interface CustomRadioButtonProps extends FormField {
  choices: Choice[];
  direction?: 'vertical' | 'horizontal';
}

export const CustomRadioButton: FunctionComponent<CustomRadioButtonProps> = ({
  choices,
  direction = 'vertical',
  ...props
}) => (
  <div className={classNames('custom-radio-button', direction)}>
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
);
