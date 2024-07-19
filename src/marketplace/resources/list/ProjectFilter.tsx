import React from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { AsyncPaginate } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { projectAutocomplete } from '@waldur/marketplace/common/autocompletes';

interface ProjectFilterProps {
  customer_uuid?: string;
  placeholder?: string;
  isDisabled?: boolean;
  reactSelectProps?: Partial<SelectProps>;
}

const getOptionLabel = (option) => (
  <div>
    {option.name}
    {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
      option.is_industry && (
        <i className="fa fa-industry fa-lg" style={{ marginLeft: '5px' }} />
      )}
  </div>
);

export const ProjectFilter: React.FC<ProjectFilterProps> = (props) => (
  <Field
    name="project"
    component={(fieldProps) => (
      <AsyncPaginate
        placeholder={props.placeholder || translate('Select project...')}
        loadOptions={(query, prevOptions, { page }) =>
          projectAutocomplete(props.customer_uuid, query, prevOptions, page)
        }
        defaultOptions
        getOptionValue={(option) => option.uuid}
        getOptionLabel={getOptionLabel as any}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        noOptionsMessage={() => translate('No projects')}
        isClearable={true}
        isDisabled={props.isDisabled}
        className="metronic-select-container"
        classNamePrefix="metronic-select"
        {...props.reactSelectProps}
      />
    )}
  />
);
