import * as React from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { Option } from '@waldur/marketplace/offerings/types';

interface AwesomeCheckBoxGroupProps {
  fieldName?: string;
  options: Option[];
  outerIndex?: number;
  groupType?: string;
}

export const AwesomeCheckBoxGroup: React.SFC<AwesomeCheckBoxGroupProps> = (props: AwesomeCheckBoxGroupProps) => (
  <span>
    {props.options.map((option, index) => (
      <div key={index} className="m-l-sm">
        <Field
          name={`${props.groupType}-${props.fieldName}-${index}`}
          component={prop =>
            <AwesomeCheckbox
              id={`${option.key}-${props.outerIndex}`}
              label={option.title}
              {...prop.input}
            />
          }
          normalize={v => v ? option.key : ''}
        />
      </div>
    ))}
  </span>
);

AwesomeCheckBoxGroup.defaultProps = {
  groupType: 'list',
};
