import * as React from 'react';

import { SelectField } from '@waldur/form-react';

const optionRenderer = option => (
  <div>
    <img src={option.icon_url} style={{
      display: 'inline-block',
      marginRight: 10,
      position: 'relative',
      top: -2,
      verticalAlign: 'middle',
    }}/>
    {option.name}
  </div>
);

const componentProps = {
  optionRenderer,
  valueRenderer: optionRenderer,
  clearable: false,
  valueKey: 'url',
  labelKey: 'name',
};

export const IssueTypeField = SelectField(componentProps);
