import React from 'react';
import { Field } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { projectAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface ProjectFilterProps {
  customer_uuid?: string;
}

export const ProjectFilter: React.FC<ProjectFilterProps> = (props) => (
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
        getOptionLabel={(option) => (
          <div>
            {option.name}
            {isFeatureVisible('project.show_industry_flag') &&
              option.is_industry && (
                <span>
                  <i
                    className="fa fa-industry fa-lg"
                    style={{ marginLeft: '5px' }}
                  ></i>
                </span>
              )}
          </div>
        )}
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
);
