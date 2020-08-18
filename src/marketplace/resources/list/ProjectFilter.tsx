import * as React from 'react';
import AsyncSelect from 'react-select/async';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { projectAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface ProjectFilterProps {
  customer_uuid: string;
}

export const ProjectFilter: React.FC<ProjectFilterProps> = (props) => (
  <div className="form-group col-sm-3">
    <label className="control-label">{translate('Project')}</label>
    <Field
      name="project"
      component={(fieldProps) => (
        <AsyncSelect
          placeholder={translate('Select project...')}
          loadOptions={projectAutocomplete(props.customer_uuid)}
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No projects')}
        />
      )}
    />
  </div>
);
