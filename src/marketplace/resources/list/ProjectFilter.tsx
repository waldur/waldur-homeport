import { FactoryIcon } from '@phosphor-icons/react';
import React from 'react';
import { Props as SelectProps } from 'react-select';
import { BaseFieldProps, Field } from 'redux-form';

import { isFeatureVisible } from '@/features/connect';
import { ProjectFeatures } from '@/FeaturesEnums';
import { AsyncPaginate } from '@/form/themed-select';
import { translate } from '@/i18n';
import { projectAutocomplete } from '@/marketplace/common/autocompletes';

interface ProjectFilterProps {
  customer_uuid?: string;
  placeholder?: string;
  isDisabled?: boolean;
  reactSelectProps?: Partial<SelectProps>;
  validator?: BaseFieldProps['validate'];
}

const getOptionLabel = (option) => (
  <div>
    {option.name}
    {isFeatureVisible(ProjectFeatures.show_industry_flag) &&
      option.is_industry && (
        <span className="svg-icon svg-icon-3 ms-3">
          <FactoryIcon weight="bold" />
        </span>
      )}
  </div>
);

export const ProjectFilter: React.FC<ProjectFilterProps> = (props) => (
  <Field
    name="project"
    validate={props.validator}
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
        inputId="project-selector-input"
        {...props.reactSelectProps}
      />
    )}
  />
);
