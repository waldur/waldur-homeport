import { FunctionComponent } from 'react';
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

export const AwesomeCheckBoxGroup: FunctionComponent<AwesomeCheckBoxGroupProps> = (
  props,
) => (
  <span>
    {props.options.map((option, index) => (
      <div key={index} className="m-l-sm">
        <Field
          name={`${props.groupType}-${props.fieldName}-${index}`}
          component={(prop) => (
            <AwesomeCheckbox label={option.title} {...prop.input} />
          )}
          normalize={(v) => (v ? option.key : '')}
        />
      </div>
    ))}
  </span>
);

AwesomeCheckBoxGroup.defaultProps = {
  groupType: 'list',
};
