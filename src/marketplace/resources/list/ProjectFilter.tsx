import * as React from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
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
        <AsyncPaginate
          placeholder={translate('Select project...')}
          loadOptions={(query, prevOptions, { page }) =>
            projectAutocomplete(props.customer_uuid, query, prevOptions, page)
          }
          defaultOptions
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          noOptionsMessage={() => translate('No projects')}
          isClearable={true}
          additional={{
            page: 1,
          }}
        />
      )}
    />
  </div>
);
