import { FC } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';

interface Option {
  key: string;
  title: string;
}

interface AwesomeCheckBoxGroupProps {
  fieldName?: string;
  options: Option[];
  outerIndex?: number;
  groupType?: string;
}

export const AwesomeCheckBoxGroup: FC<AwesomeCheckBoxGroupProps> = ({
  groupType = 'list',
  ...props
}) => (
  <span>
    {props.options.map((option, index) => (
      <div key={index} className="ms-2 mb-2">
        <Field
          name={`${groupType}-${props.fieldName}-${index}`}
          component={(prop) => (
            <AwesomeCheckbox label={option.title} {...prop.input} />
          )}
          normalize={(v) => (v ? option.key : '')}
        />
      </div>
    ))}
  </span>
);
