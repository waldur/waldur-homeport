import * as React from 'react';
import { Async } from 'react-select';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { projectAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface ProjectFilterProps {
  customer_uuid: string;
}

export const ProjectFilter: React.SFC<ProjectFilterProps> = props => (
  <div className="form-group col-sm-3">
    <label className="control-label">
      {translate('Project')}
    </label>
    <Field
      name="project"
      component={fieldProps => (
        <Async
          placeholder={translate('Select project...')}
          loadOptions={projectAutocomplete(props.customer_uuid)}
          valueKey="uuid"
          labelKey="name"
          value={fieldProps.input.value}
          onChange={value => fieldProps.input.onChange(value)}
        />
      )}
    />
  </div>
);
